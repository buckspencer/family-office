'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Mail, Phone, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { deleteContact, toggleContactArchiveStatus } from '@/lib/db/actions/contacts';
import { useRouter } from 'next/navigation';

type Contact = {
  id: number;
  name: string;
  type: 'family' | 'medical' | 'financial' | 'legal' | 'service' | 'other';
  relationship: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  isArchived?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
  teamId: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
};

interface ContactsTableProps {
  initialContacts: Contact[];
}

export function ContactsTable({ initialContacts }: ContactsTableProps) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const router = useRouter();

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      try {
        const result = await deleteContact(id);
        if (result.success) {
          setContacts(contacts.filter(contact => contact.id !== id));
        } else {
          alert(result.error || 'Failed to delete contact');
        }
      } catch (error) {
        console.error('Error deleting contact:', error);
        alert('An error occurred while deleting the contact');
      }
    }
  };

  const handleArchive = async (id: number, isArchived: boolean) => {
    try {
      const result = await toggleContactArchiveStatus(id, isArchived);
      if (result.success) {
        setContacts(
          contacts.map(contact => 
            contact.id === id ? { ...contact, isArchived } : contact
          )
        );
      } else {
        alert(result.error || 'Failed to update contact');
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      alert('An error occurred while updating the contact');
    }
  };

  const getTypeLabel = (type: Contact['type']) => {
    const typeMap = {
      family: 'Family Member',
      medical: 'Medical Provider',
      financial: 'Financial Advisor',
      legal: 'Legal Representative',
      service: 'Service Provider',
      other: 'Other'
    };
    return typeMap[type] || type;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Relationship</TableHead>
            <TableHead>Contact Info</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No contacts found.
              </TableCell>
            </TableRow>
          ) : (
            contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell className="font-medium">{contact.name}</TableCell>
                <TableCell>{getTypeLabel(contact.type)}</TableCell>
                <TableCell>{contact.relationship}</TableCell>
                <TableCell>
                  <div className="flex flex-col space-y-1">
                    {contact.email && (
                      <div className="flex items-center text-sm">
                        <Mail className="mr-2 h-3 w-3 text-muted-foreground" />
                        <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                          {contact.email}
                        </a>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
                        <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
                          {contact.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <Link href={`/dashboard/resources/contacts/edit?id=${contact.id}`}>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem onClick={() => handleArchive(contact.id, !contact.isArchived)}>
                        {contact.isArchived ? 'Unarchive' : 'Archive'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(contact.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
} 