'use server';

import { revalidatePath } from 'next/cache';
import { Contact as DbContact } from '@/lib/db/temp-schema/contacts.types';
import { createContact as dbCreateContact, updateContact as dbUpdateContact, getContactById as dbGetContactById } from '@/lib/db/actions/contacts';
import { getSession } from '@/lib/auth/session';

// Define a type for the session user
type SessionUser = {
  id: number;
  email: string;
  name: string;
  teamId?: number;
};

// Define a local Contact type that uses null instead of undefined
type Contact = {
  id: number;
  name: string;
  type: 'family' | 'medical' | 'financial' | 'legal' | 'service' | 'other';
  relationship: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  isArchived?: boolean;
  tags?: string[] | null;
  metadata?: Record<string, any> | null;
  teamId: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
};

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
    isArchived: false,
    tags: null,
    metadata: null
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
    isArchived: false,
    tags: null,
    metadata: null
  },
];

export async function getContacts() {
  // For now, just return mock data
  return { contacts: mockContacts };
}

export async function createContact(data: FormData) {
  try {
    // Get session for user and team info
    const session = await getSession();
    // Use type assertion to help TypeScript understand the structure
    const user = session?.user as SessionUser | undefined;
    const userId = user?.id ?? 1; // Fallback to 1 for development
    const teamId = user?.teamId ?? 1; // Fallback to 1 for development
    
    // Extract data from form
    const name = data.get('name') as string;
    const type = data.get('type') as Contact['type'];
    const relationship = data.get('relationship') as string;
    const email = (data.get('email') as string) || null;
    const phone = (data.get('phone') as string) || null;
    const address = (data.get('address') as string) || null;
    const notes = (data.get('notes') as string) || null;
    
    // Validate required fields
    if (!name || !type || !relationship) {
      return { error: 'Missing required fields' };
    }
    
    // Try to use the database action
    try {
      const result = await dbCreateContact({
        name,
        type,
        relationship,
        email,
        phone,
        address,
        notes,
        teamId,
        userId
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create contact');
      }
      
      // Revalidate only the resources path
      revalidatePath('/dashboard/resources/contacts');
      
      return { data: result.data };
    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // If we're in development and the database action fails, fall back to mock data
      if (process.env.NODE_ENV === 'development') {
        console.log('Falling back to mock data in development');
        
        // Use mock data for development
        const newContact: Contact = {
          id: mockContacts.length + 1,
          name,
          type,
          relationship,
          email,
          phone,
          address,
          notes,
          teamId,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          isArchived: false,
          tags: null,
          metadata: null
        };
        
        mockContacts.push(newContact);
        
        // Revalidate only the resources path
        revalidatePath('/dashboard/resources/contacts');
        
        return { data: newContact };
      }
      
      // In production, rethrow the error
      throw dbError;
    }
  } catch (error) {
    console.error('Error creating contact:', error);
    return { error: error instanceof Error ? error.message : 'Failed to create contact' };
  }
}

export async function updateContact(data: FormData) {
  try {
    // Debug: Log the form data
    console.log('Update Contact - Form Data:');
    console.log('id:', data.get('id'));
    console.log('name:', data.get('name'));
    console.log('type:', data.get('type'));
    console.log('relationship:', data.get('relationship'));
    console.log('email:', data.get('email'));
    console.log('phone:', data.get('phone'));
    console.log('address:', data.get('address'));
    console.log('notes:', data.get('notes'));
    
    // Get session for user and team info
    const session = await getSession();
    // Use type assertion to help TypeScript understand the structure
    const user = session?.user as SessionUser | undefined;
    const userId = user?.id ?? 1; // Fallback to 1 for development
    const teamId = user?.teamId ?? 1; // Fallback to 1 for development
    
    // Extract data from form
    const id = Number(data.get('id'));
    const name = data.get('name') as string;
    const type = data.get('type') as Contact['type'];
    const relationship = data.get('relationship') as string;
    const email = (data.get('email') as string) || null;
    const phone = (data.get('phone') as string) || null;
    const address = (data.get('address') as string) || null;
    const notes = (data.get('notes') as string) || null;
    
    // Validate required fields
    if (!id || !name || !type || !relationship) {
      console.log('Missing required fields:', { id, name, type, relationship });
      return { error: 'Missing required fields' };
    }
    
    // Try to use the database action
    try {
      const result = await dbUpdateContact(id, {
        name,
        type,
        relationship,
        email,
        phone,
        address,
        notes,
        teamId,
        userId
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update contact');
      }
      
      // Revalidate only the resources path
      revalidatePath('/dashboard/resources/contacts');
      
      return { data: result.data };
    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // If we're in development and the database action fails, fall back to mock data
      if (process.env.NODE_ENV === 'development') {
        console.log('Falling back to mock data in development');
        
        // Find and update the contact in mock data
        const index = mockContacts.findIndex(contact => contact.id === id);
        if (index === -1) {
          return { error: 'Contact not found' };
        }
        
        const updatedContact = {
          ...mockContacts[index],
          name,
          type,
          relationship,
          email,
          phone,
          address,
          notes,
          updatedAt: new Date(),
        };
        
        mockContacts[index] = updatedContact;
        
        // Revalidate only the resources path
        revalidatePath('/dashboard/resources/contacts');
        
        return { data: updatedContact };
      }
      
      // In production, rethrow the error
      throw dbError;
    }
  } catch (error) {
    console.error('Error updating contact:', error);
    return { error: error instanceof Error ? error.message : 'Failed to update contact' };
  }
}

export async function deleteContact(data: FormData) {
  const id = Number(data.get('id'));
  const index = mockContacts.findIndex(contact => contact.id === id);
  
  if (index === -1) {
    return { error: 'Contact not found' };
  }

  mockContacts.splice(index, 1);
  
  // Revalidate only the resources path
  revalidatePath('/dashboard/resources/contacts');
  
  return { success: true };
} 