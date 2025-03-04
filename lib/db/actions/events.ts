'use server';

// @ts-ignore - Using temp-schema
import { Event, EventCreate, EventUpdate } from '@/lib/db/temp-schema/events.types';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['birthday', 'anniversary', 'holiday', 'reminder', 'other'], {
    required_error: 'Event type is required',
  }),
  description: z.string().optional(),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  location: z.string().optional(),
  notes: z.string().optional(),
});

// This will be replaced with actual database operations
const events: Event[] = [];

// Server Actions
export async function createEvent(data: EventCreate & { teamId: number; userId: number }): Promise<ActionResponse<Event | null>> {
  try {
    const validation = eventSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message };
    }

    const newEvent: Event = {
      id: events.length + 1,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    events.push(newEvent);
    revalidatePath('/dashboard/family/events');
    return { success: true, data: newEvent };
  } catch (error) {
    console.error('Error creating event:', error);
    return { success: false, error: 'Failed to create event' };
  }
}

export async function getEvents(teamId: number): Promise<ActionResponse<Event[]>> {
  try {
    const teamEvents = events.filter(event => event.teamId === teamId);
    return { success: true, data: teamEvents };
  } catch (error) {
    console.error('Error fetching events:', error);
    return { success: false, error: 'Failed to fetch events' };
  }
}

export async function getEventById(id: number): Promise<ActionResponse<Event | null>> {
  try {
    const event = events.find(e => e.id === id);
    if (!event) {
      return { success: false, error: 'Event not found' };
    }
    return { success: true, data: event };
  } catch (error) {
    console.error('Error fetching event:', error);
    return { success: false, error: 'Failed to fetch event' };
  }
}

export async function updateEvent(id: number, data: EventUpdate): Promise<ActionResponse<Event | null>> {
  try {
    const validation = eventSchema.partial().safeParse(data);
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message };
    }

    const eventIndex = events.findIndex(e => e.id === id);
    if (eventIndex === -1) {
      return { success: false, error: 'Event not found' };
    }

    events[eventIndex] = {
      ...events[eventIndex],
      ...data,
      updatedAt: new Date(),
    };

    revalidatePath('/dashboard/family/events');
    return { success: true, data: events[eventIndex] };
  } catch (error) {
    console.error('Error updating event:', error);
    return { success: false, error: 'Failed to update event' };
  }
}

export async function deleteEvent(id: number): Promise<ActionResponse<Event | null>> {
  try {
    const eventIndex = events.findIndex(e => e.id === id);
    if (eventIndex === -1) {
      return { success: false, error: 'Event not found' };
    }

    const deletedEvent = events[eventIndex];
    events.splice(eventIndex, 1);
    revalidatePath('/dashboard/family/events');
    return { success: true, data: deletedEvent };
  } catch (error) {
    console.error('Error deleting event:', error);
    return { success: false, error: 'Failed to delete event' };
  }
} 