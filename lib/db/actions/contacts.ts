'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { eq, desc, and, sql } from 'drizzle-orm';
import { contacts, contactType } from '../schema';
import { z } from 'zod';

// Define types based on the schema
type Contact = typeof contacts.$inferSelect;
type NewContact = typeof contacts.$inferInsert;

type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Database Operations
async function createContactQuery(data: NewContact) {
  return db.insert(contacts).values(data).returning();
}

async function getContactsQuery(teamId: number, options?: { 
  limit?: number; 
  offset?: number; 
  orderBy?: string; 
  orderDir?: 'asc' | 'desc';
  isArchived?: boolean;
  type?: typeof contactType.enumValues[number];
}) {
  const { 
    limit = 100, 
    offset = 0, 
    orderBy = 'createdAt', 
    orderDir = 'desc', 
    isArchived = false,
    type
  } = options || {};
  
  const orderColumn = contacts[orderBy as keyof typeof contacts] as any;
  const orderDirection = orderDir === 'asc' ? sql`asc` : sql`desc`;
  
  let conditions = and(
    eq(contacts.teamId, teamId),
    eq(contacts.isArchived, isArchived)
  );
  
  if (type) {
    conditions = and(conditions, eq(contacts.type, type));
  }
  
  return db.select()
    .from(contacts)
    .where(conditions)
    .orderBy(sql`${orderColumn} ${orderDirection}`)
    .limit(limit)
    .offset(offset);
}

async function getContactByIdQuery(id: number) {
  return db.select()
    .from(contacts)
    .where(eq(contacts.id, id))
    .limit(1);
}

async function updateContactQuery(id: number, data: Partial<Contact>) {
  return db.update(contacts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(contacts.id, id))
    .returning();
}

async function deleteContactQuery(id: number) {
  return db.delete(contacts)
    .where(eq(contacts.id, id))
    .returning();
}

// Input validation schemas
const createContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(contactType.enumValues),
  relationship: z.string().min(1, "Relationship is required"),
  email: z.string().email().nullish(),
  phone: z.string().nullish(),
  address: z.string().nullish(),
  notes: z.string().nullish(),
  isArchived: z.boolean().optional(),
  tags: z.array(z.string()).nullish(),
  metadata: z.record(z.any()).nullish(),
  teamId: z.number(),
  userId: z.number()
});

const updateContactSchema = createContactSchema.partial();

// Server Actions
export async function createContact(data: z.infer<typeof createContactSchema>): Promise<ActionResponse<Contact>> {
  try {
    // Validate input
    const validatedData = createContactSchema.parse(data);
    
    const [contact] = await createContactQuery(validatedData);
    revalidatePath('/family/contacts');
    return { success: true, data: contact };
  } catch (error) {
    console.error('Error creating contact:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Failed to create contact' };
  }
}

export async function getContacts(
  teamId: number, 
  options?: { 
    limit?: number; 
    offset?: number; 
    orderBy?: string; 
    orderDir?: 'asc' | 'desc';
    isArchived?: boolean;
    type?: typeof contactType.enumValues[number];
  }
): Promise<ActionResponse<Contact[]>> {
  try {
    const contactsList = await getContactsQuery(teamId, options);
    return { success: true, data: contactsList };
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return { success: false, error: 'Failed to fetch contacts' };
  }
}

export async function getContactById(id: number): Promise<ActionResponse<Contact | null>> {
  try {
    const [contact] = await getContactByIdQuery(id);
    if (!contact) {
      return { success: false, error: 'Contact not found' };
    }
    return { success: true, data: contact };
  } catch (error) {
    console.error('Error fetching contact:', error);
    return { success: false, error: 'Failed to fetch contact' };
  }
}

export async function updateContact(id: number, data: z.infer<typeof updateContactSchema>): Promise<ActionResponse<Contact>> {
  try {
    // Validate input
    const validatedData = updateContactSchema.parse(data);
    
    const [contact] = await updateContactQuery(id, validatedData);
    if (!contact) {
      return { success: false, error: 'Contact not found' };
    }
    revalidatePath('/family/contacts');
    return { success: true, data: contact };
  } catch (error) {
    console.error('Error updating contact:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Failed to update contact' };
  }
}

export async function deleteContact(id: number): Promise<ActionResponse<Contact>> {
  try {
    const [contact] = await deleteContactQuery(id);
    if (!contact) {
      return { success: false, error: 'Contact not found' };
    }
    revalidatePath('/family/contacts');
    return { success: true, data: contact };
  } catch (error) {
    console.error('Error deleting contact:', error);
    return { success: false, error: 'Failed to delete contact' };
  }
}

// Archive/Unarchive contact
export async function toggleContactArchiveStatus(id: number, isArchived: boolean): Promise<ActionResponse<Contact>> {
  try {
    const [contact] = await updateContactQuery(id, { isArchived });
    if (!contact) {
      return { success: false, error: 'Contact not found' };
    }
    revalidatePath('/family/contacts');
    return { success: true, data: contact };
  } catch (error) {
    console.error('Error updating contact archive status:', error);
    return { success: false, error: 'Failed to update contact archive status' };
  }
}

// Batch operations
export async function batchDeleteContacts(ids: number[]): Promise<ActionResponse<{ count: number }>> {
  try {
    const result = await db.delete(contacts)
      .where(sql`${contacts.id} IN (${ids.join(',')})`)
      .returning();
    
    revalidatePath('/family/contacts');
    return { success: true, data: { count: result.length } };
  } catch (error) {
    console.error('Error batch deleting contacts:', error);
    return { success: false, error: 'Failed to delete contacts' };
  }
}

export async function batchArchiveContacts(ids: number[], isArchived: boolean): Promise<ActionResponse<{ count: number }>> {
  try {
    const result = await db.update(contacts)
      .set({ isArchived, updatedAt: new Date() })
      .where(sql`${contacts.id} IN (${ids.join(',')})`)
      .returning();
    
    revalidatePath('/family/contacts');
    return { success: true, data: { count: result.length } };
  } catch (error) {
    console.error('Error batch archiving contacts:', error);
    return { success: false, error: 'Failed to archive contacts' };
  }
} 