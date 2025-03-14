'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { eq, desc, and, sql, gte, lte, between } from 'drizzle-orm';
import { events, eventType } from '../schema';
import { z } from 'zod';

// Define types based on the schema
type Event = typeof events.$inferSelect;
type NewEvent = typeof events.$inferInsert;

type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Database Operations
async function createEventQuery(data: NewEvent) {
  return db.insert(events).values(data).returning();
}

async function getEventsQuery(teamId: number, options?: { 
  limit?: number; 
  offset?: number; 
  orderBy?: string; 
  orderDir?: 'asc' | 'desc';
  isArchived?: boolean;
  type?: typeof eventType.enumValues[number];
  startDate?: Date;
  endDate?: Date;
  isRecurring?: boolean;
}) {
  const { 
    limit = 100, 
    offset = 0, 
    orderBy = 'startDate', 
    orderDir = 'asc', 
    isArchived = false,
    type,
    startDate,
    endDate,
    isRecurring
  } = options || {};
  
  const orderColumn = events[orderBy as keyof typeof events] as any;
  const orderDirection = orderDir === 'asc' ? sql`asc` : sql`desc`;
  
  let conditions = and(
    eq(events.teamId, teamId),
    eq(events.isArchived, isArchived)
  );
  
  if (type) {
    conditions = and(conditions, eq(events.type, type));
  }
  
  if (isRecurring !== undefined) {
    conditions = and(conditions, eq(events.isRecurring, isRecurring));
  }
  
  if (startDate && endDate) {
    // Find events that overlap with the date range
    conditions = and(
      conditions,
      and(
        lte(events.startDate, endDate),
        gte(events.endDate || events.startDate, startDate)
      )
    );
  } else if (startDate) {
    conditions = and(conditions, gte(events.startDate, startDate));
  } else if (endDate) {
    conditions = and(conditions, lte(events.startDate, endDate));
  }
  
  return db.select()
    .from(events)
    .where(conditions)
    .orderBy(sql`${orderColumn} ${orderDirection}`)
    .limit(limit)
    .offset(offset);
}

async function getEventByIdQuery(id: number) {
  return db.select()
    .from(events)
    .where(eq(events.id, id))
    .limit(1);
}

async function updateEventQuery(id: number, data: Partial<Event>) {
  return db.update(events)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(events.id, id))
    .returning();
}

async function deleteEventQuery(id: number) {
  return db.delete(events)
    .where(eq(events.id, id))
    .returning();
}

// Input validation schemas
const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(eventType.enumValues),
  description: z.string().nullish(),
  startDate: z.date(),
  endDate: z.date().nullish(),
  location: z.string().nullish(),
  notes: z.string().nullish(),
  isRecurring: z.boolean().default(false),
  recurrenceRule: z.string().nullish(),
  reminderBefore: z.number().int().nullish(),
  isArchived: z.boolean().default(false),
  tags: z.array(z.string()).nullish(),
  metadata: z.record(z.any()).nullish(),
  teamId: z.number(),
  userId: z.string()
});

const updateEventSchema = createEventSchema.partial();

// Server Actions
export async function createEvent(data: z.infer<typeof createEventSchema>): Promise<ActionResponse<Event>> {
  try {
    // Validate input
    const validatedData = createEventSchema.parse(data);
    
    const [event] = await createEventQuery(validatedData);
    revalidatePath('/family/events');
    return { success: true, data: event };
  } catch (error) {
    console.error('Error creating event:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Failed to create event' };
  }
}

export async function getEvents(
  teamId: number, 
  options?: { 
    limit?: number; 
    offset?: number; 
    orderBy?: string; 
    orderDir?: 'asc' | 'desc';
    isArchived?: boolean;
    type?: typeof eventType.enumValues[number];
    startDate?: Date;
    endDate?: Date;
    isRecurring?: boolean;
  }
): Promise<ActionResponse<Event[]>> {
  try {
    const eventsList = await getEventsQuery(teamId, options);
    return { success: true, data: eventsList };
  } catch (error) {
    console.error('Error fetching events:', error);
    return { success: false, error: 'Failed to fetch events' };
  }
}

export async function getEventById(id: number): Promise<ActionResponse<Event | null>> {
  try {
    const [event] = await getEventByIdQuery(id);
    if (!event) {
      return { success: false, error: 'Event not found' };
    }
    return { success: true, data: event };
  } catch (error) {
    console.error('Error fetching event:', error);
    return { success: false, error: 'Failed to fetch event' };
  }
}

export async function updateEvent(id: number, data: z.infer<typeof updateEventSchema>): Promise<ActionResponse<Event>> {
  try {
    // Validate input
    const validatedData = updateEventSchema.parse(data);
    
    const [event] = await updateEventQuery(id, validatedData);
    if (!event) {
      return { success: false, error: 'Event not found' };
    }
    revalidatePath('/family/events');
    return { success: true, data: event };
  } catch (error) {
    console.error('Error updating event:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Failed to update event' };
  }
}

export async function deleteEvent(id: number): Promise<ActionResponse<Event>> {
  try {
    const [event] = await deleteEventQuery(id);
    if (!event) {
      return { success: false, error: 'Event not found' };
    }
    revalidatePath('/family/events');
    return { success: true, data: event };
  } catch (error) {
    console.error('Error deleting event:', error);
    return { success: false, error: 'Failed to delete event' };
  }
}

// Archive/Unarchive event
export async function toggleEventArchiveStatus(id: number, isArchived: boolean): Promise<ActionResponse<Event>> {
  try {
    const [event] = await updateEventQuery(id, { isArchived });
    if (!event) {
      return { success: false, error: 'Event not found' };
    }
    revalidatePath('/family/events');
    return { success: true, data: event };
  } catch (error) {
    console.error('Error updating event archive status:', error);
    return { success: false, error: 'Failed to update event archive status' };
  }
}

// Batch operations
export async function batchDeleteEvents(ids: number[]): Promise<ActionResponse<{ count: number }>> {
  try {
    const result = await db.delete(events)
      .where(sql`${events.id} IN (${ids.join(',')})`)
      .returning();
    
    revalidatePath('/family/events');
    return { success: true, data: { count: result.length } };
  } catch (error) {
    console.error('Error batch deleting events:', error);
    return { success: false, error: 'Failed to delete events' };
  }
}

export async function batchArchiveEvents(ids: number[], isArchived: boolean): Promise<ActionResponse<{ count: number }>> {
  try {
    const result = await db.update(events)
      .set({ isArchived, updatedAt: new Date() })
      .where(sql`${events.id} IN (${ids.join(',')})`)
      .returning();
    
    revalidatePath('/family/events');
    return { success: true, data: { count: result.length } };
  } catch (error) {
    console.error('Error batch archiving events:', error);
    return { success: false, error: 'Failed to archive events' };
  }
} 