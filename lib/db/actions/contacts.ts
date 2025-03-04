import { z } from 'zod';
import { Contact, ContactCreate, ContactUpdate } from '@/lib/db/temp-schema/contacts.types';
import { getUserWithTeam } from '@/lib/db/actions/users';
import { validatedActionWithUser } from '@/lib/auth/middleware';

// This will be replaced with actual database operations
const contacts: Contact[] = [];

// Validation schemas
export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['family', 'medical', 'financial', 'legal', 'service', 'other'], {
    required_error: 'Contact type is required',
  }),
  relationship: z.string().min(1, 'Relationship is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const contactUpdateSchema = contactSchema.extend({
  id: z.number(),
});

// Database operations with auth checks
export async function getContactsByTeam(teamId: number): Promise<Contact[]> {
  return contacts.filter(contact => contact.teamId === teamId);
}

export async function getContactById(id: number): Promise<Contact | null> {
  return contacts.find(contact => contact.id === id) || null;
}

export async function getContactsByUser(userId: number): Promise<Contact[]> {
  return contacts.filter(contact => contact.userId === userId);
}

export async function getContactsByTeamAndType(teamId: number, type: Contact['type']): Promise<Contact[]> {
  return contacts.filter(contact => contact.teamId === teamId && contact.type === type);
}

// Server actions with validation and auth
export const createContact = validatedActionWithUser(
  contactSchema,
  async (data, _, user) => {
    const userWithTeam = await getUserWithTeam(user.id);
    if (!userWithTeam?.teamId) {
      throw new Error('User is not associated with a team.');
    }

    try {
      const newContact: Contact = {
        id: contacts.length + 1,
        ...data,
        teamId: userWithTeam.teamId,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      contacts.push(newContact);
      return { data: newContact, message: 'Contact created successfully.' };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create contact.');
    }
  }
);

export const updateContact = validatedActionWithUser(
  contactUpdateSchema,
  async (data, _, user) => {
    const userWithTeam = await getUserWithTeam(user.id);
    if (!userWithTeam?.teamId) {
      throw new Error('User is not associated with a team.');
    }

    const { id, ...updateData } = data;
    const index = contacts.findIndex(contact => contact.id === id && contact.teamId === userWithTeam.teamId);
    
    if (index === -1) {
      throw new Error('Contact not found or access denied.');
    }

    try {
      contacts[index] = {
        ...contacts[index],
        ...updateData,
        updatedAt: new Date(),
      };
      return { data: contacts[index], message: 'Contact updated successfully.' };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update contact.');
    }
  }
);

export const deleteContact = validatedActionWithUser(
  z.object({ id: z.number() }),
  async (data, _, user) => {
    const userWithTeam = await getUserWithTeam(user.id);
    if (!userWithTeam?.teamId) {
      throw new Error('User is not associated with a team.');
    }

    const index = contacts.findIndex(contact => contact.id === data.id && contact.teamId === userWithTeam.teamId);
    
    if (index === -1) {
      throw new Error('Contact not found or access denied.');
    }

    try {
      contacts.splice(index, 1);
      return { message: 'Contact deleted successfully.' };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to delete contact.');
    }
  }
); 