'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, Table as TableIcon, Grid } from 'lucide-react';
import { ContactsTable } from './contacts-table';
import { Card, CardContent } from '@/components/ui/card';

// Define the Contact type to match the one in contacts-table
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

interface ContactsClientPageProps {
  initialContacts: Contact[];
}

export function ContactsClientPage({ initialContacts }: ContactsClientPageProps) {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [contacts] = useState<Contact[]>(initialContacts);

  // Function to render contact cards
  const renderContactCards = () => {
    if (contacts.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No contacts found.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contacts.map((contact) => (
          <ContactCard key={contact.id} contact={contact} />
        ))}
      </div>
    );
  };

  // Contact Card Component
  function ContactCard({ contact }: { contact: Contact }) {
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
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{contact.name}</h3>
              <p className="text-sm text-muted-foreground">
                {getTypeLabel(contact.type)} • {contact.relationship}
              </p>
            </div>
            
            <div className="space-y-2">
              {contact.email && (
                <div className="flex items-center text-sm">
                  <span className="mr-2">📧</span>
                  <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                    {contact.email}
                  </a>
                </div>
              )}
              
              {contact.phone && (
                <div className="flex items-center text-sm">
                  <span className="mr-2">📞</span>
                  <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
                    {contact.phone}
                  </a>
                </div>
              )}
              
              {contact.address && (
                <div className="flex items-center text-sm">
                  <span className="mr-2">📍</span>
                  <span>{contact.address}</span>
                </div>
              )}
            </div>
            
            {contact.notes && (
              <div className="text-sm border-t pt-2 mt-2">
                <p className="text-muted-foreground">{contact.notes}</p>
              </div>
            )}
            
            <div className="flex justify-end space-x-2 pt-2">
              <Link href={`/dashboard/resources/contacts/edit?id=${contact.id}`}>
                <Button variant="outline" size="sm">Edit Contact</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Contacts</h1>
          <p className="text-muted-foreground mt-2">
            Manage your family and professional contacts
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex rounded-md border overflow-hidden">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              className="rounded-none border-0"
              onClick={() => setViewMode('table')}
            >
              <TableIcon className="h-4 w-4 mr-2" />
              Table
            </Button>
            <Button
              variant={viewMode === 'card' ? 'default' : 'outline'}
              className="rounded-none border-0"
              onClick={() => setViewMode('card')}
            >
              <Grid className="h-4 w-4 mr-2" />
              Cards
            </Button>
          </div>
          
          <Link href="/dashboard/resources/contacts/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </Link>
        </div>
      </div>
      
      {viewMode === 'table' ? (
        <ContactsTable initialContacts={contacts} />
      ) : (
        renderContactCards()
      )}
    </div>
  );
} 