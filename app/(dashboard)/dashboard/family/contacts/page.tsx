'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import { ContactCard } from '@/components/ui/contact-card';
import { Contact } from '@/lib/db/temp-schema/contacts.types';
import { getContacts, deleteContact } from './actions';
import { useRouter } from 'next/navigation';

export default function ContactsPage() {
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const router = useRouter();

  React.useEffect(() => {
    async function fetchContacts() {
      try {
        const result = await getContacts();
        if ('contacts' in result) {
          setContacts(result.contacts);
        }
      } catch (error) {
        console.error('Failed to fetch contacts:', error);
      }
    }
    fetchContacts();
  }, []);

  const handleEdit = (contact: Contact) => {
    router.push(`/dashboard/family/contacts/${contact.id}/edit`);
  };

  const handleDelete = async (contact: Contact) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      try {
        const formData = new FormData();
        formData.append('id', contact.id.toString());
        const result = await deleteContact(formData);
        
        if ('error' in result) {
          throw new Error(result.error);
        }
        
        setContacts(contacts.filter(c => c.id !== contact.id));
      } catch (error) {
        console.error('Failed to delete contact:', error);
        alert('Failed to delete contact. Please try again.');
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href="/dashboard/family">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Family Dashboard
          </Button>
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Contacts</h1>
        <Link href="/dashboard/family/contacts/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contacts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No contacts yet. Add your first contact to get started.</p>
          </div>
        ) : (
          contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
} 