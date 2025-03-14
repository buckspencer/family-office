'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useActionState } from 'react';
import { createEvent } from '@/lib/db/actions/events';
import { useRouter } from 'next/navigation';
// @ts-ignore - Using temp-schema
import { Event } from '@/lib/db/temp-schema/events.types';

const eventTypes = [
  { value: 'birthday', label: 'Birthday' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'holiday', label: 'Holiday' },
  { value: 'reminder', label: 'Reminder' },
  { value: 'other', label: 'Other' },
] as const;

// Define Event type to match the schema
type Event = {
  id: number;
  title: string;
  type: 'birthday' | 'anniversary' | 'holiday' | 'reminder' | 'other';
  description?: string | null;
  startDate: Date;
  endDate?: Date | null;
  location?: string | null;
  notes?: string | null;
  isRecurring: boolean | null;
  recurringPattern?: string | null;
  reminderBefore?: number | null;
  isArchived: boolean | null;
  tags?: string[] | null;
  metadata?: unknown;
  teamId: number;
  userId: string | number;
  createdAt: Date;
  updatedAt: Date;
};

type ActionState = {
  success: boolean;
  data?: Event;
  error?: string;
};

// Temporary function to handle form data transformation
async function handleCreateEvent(state: ActionState, formData: FormData): Promise<ActionState> {
  const startDateStr = formData.get('startDate') as string;
  const endDateStr = formData.get('endDate') as string;

  const data = {
    title: formData.get('title') as string,
    type: formData.get('type') as 'birthday' | 'anniversary' | 'holiday' | 'reminder' | 'other',
    description: formData.get('description') as string,
    startDate: new Date(startDateStr),
    endDate: endDateStr ? new Date(endDateStr) : undefined,
    location: formData.get('location') as string,
    notes: formData.get('notes') as string,
    // Temporary values for development
    teamId: 1,
    userId: '1', // Use string for UUID
    isArchived: false,
    isRecurring: false
  };

  const result = await createEvent(data);
  return {
    success: result.success,
    data: result.data || undefined,
    error: result.error
  };
}

export default function NewEventForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    handleCreateEvent,
    { success: false }
  );

  React.useEffect(() => {
    if (state.success) {
      router.push('/dashboard/resources/events');
    }
  }, [state.success, router]);

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Event</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            <FormField
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter event title" required {...field} />
                  </FormControl>
                  <FormDescription>
                    Name of the event
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} required>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the type of event
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the event"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Brief description of the event
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date *</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" required {...field} />
                  </FormControl>
                  <FormDescription>
                    When the event starts
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormDescription>
                    When the event ends (if applicable)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter event location" {...field} />
                  </FormControl>
                  <FormDescription>
                    Where the event takes place
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes about this event"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {state.error && (
              <div className="text-sm text-red-500">{state.error}</div>
            )}

            <div className="flex justify-end space-x-4">
              <Link href="/dashboard/resources/events">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Event'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 