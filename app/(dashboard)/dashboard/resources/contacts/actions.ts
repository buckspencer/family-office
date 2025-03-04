'use server';

import { Contact } from '@/lib/db/temp-schema/contacts.types';

// Mock data for development
const mockContacts: Contact[] = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    type: 'medical',
    relationship: 'Primary Care Physician',
    email: 'sarah.johnson@healthcare.com',
    phone: '(555) 123-4567',
    address: '123 Medical Center Dr, Suite 100\nSan Francisco, CA 94105',
    notes: 'Family doctor for the past 5 years. Specializes in preventive care.',
    teamId: 1,
    userId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: 'Michael Chen',
    type: 'financial',
    relationship: 'Financial Advisor',
    email: 'm.chen@wealthmanagement.com',
    phone: '(555) 987-6543',
    address: '456 Financial District\nSan Francisco, CA 94104',
    notes: 'Handles family investments and retirement planning.',
    teamId: 1,
    userId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export async function getContacts() {
  // For now, just return mock data
  return { contacts: mockContacts };
}

export async function createContact(data: FormData) {
  const newContact: Contact = {
    id: mockContacts.length + 1,
    name: data.get('name') as string,
    type: data.get('type') as Contact['type'],
    relationship: data.get('relationship') as string,
    email: data.get('email') as string || undefined,
    phone: data.get('phone') as string || undefined,
    address: data.get('address') as string || undefined,
    notes: data.get('notes') as string || undefined,
    teamId: 1, // Mock team ID
    userId: 1, // Mock user ID
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Validate required fields
  if (!newContact.name || !newContact.type || !newContact.relationship) {
    return { error: 'Missing required fields' };
  }

  mockContacts.push(newContact);
  return { data: newContact };
}

export async function deleteContact(data: FormData) {
  const id = Number(data.get('id'));
  const index = mockContacts.findIndex(contact => contact.id === id);
  
  if (index === -1) {
    return { error: 'Contact not found' };
  }

  mockContacts.splice(index, 1);
  return { success: true };
} 