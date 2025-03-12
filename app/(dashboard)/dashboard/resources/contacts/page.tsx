import React from 'react';
import { getContacts } from '@/lib/db/actions/contacts';
import { ContactsClientPage } from './contacts-client';
import { getSession } from '@/lib/auth/session';

export const metadata = {
  title: 'Contacts | Family Office',
  description: 'Manage your family and professional contacts',
};

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

export default async function ContactsPage() {
  const session = await getSession();
  
  // Use type assertion to help TypeScript understand the structure
  type SessionUser = {
    id: number;
    email: string;
    name: string;
    teamId?: number;
  };
  
  const user = session?.user as SessionUser | undefined;
  const teamId = user?.teamId ?? 1; // Default to 1 if not available
  
  const response = await getContacts(teamId);
  
  // Map the response data to match the Contact type
  const contacts: Contact[] = response.success && response.data 
    ? response.data.map((contact: any) => ({
        ...contact,
        // Convert null values to undefined to match the Contact type
        email: contact.email || undefined,
        phone: contact.phone || undefined,
        address: contact.address || undefined,
        notes: contact.notes || undefined,
        tags: contact.tags || undefined,
        metadata: contact.metadata || undefined,
      }))
    : [];
  
  return <ContactsClientPage initialContacts={contacts} />;
} 