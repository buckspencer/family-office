'use client';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { format } from 'date-fns';
import { deleteEvent } from '@/lib/db/actions/events';
import { useRouter } from 'next/navigation';

// Define a more flexible Event type that works with both the temp schema and the database
interface Event {
  id: number;
  title: string;
  type: 'birthday' | 'anniversary' | 'holiday' | 'reminder' | 'other';
  description: string | null | undefined;
  startDate: Date | string;
  endDate?: Date | string | null;
  location?: string | null;
  notes?: string | null;
  isRecurring?: boolean | null;
  recurrenceRule?: string | null;
  reminderBefore?: number | null;
  isArchived?: boolean | null;
  tags?: string[] | null;
  metadata?: unknown;
  teamId: number;
  userId: string | number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface EventsTableProps {
  events: Event[];
}

export default function EventsTable({ events }: EventsTableProps) {
  const router = useRouter();

  const handleDelete = async (id: number) => {
    const result = await deleteEvent(id);
    if (result.success) {
      router.refresh();
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => (
          <TableRow key={event.id}>
            <TableCell className="font-medium">{event.title}</TableCell>
            <TableCell className="capitalize">{event.type}</TableCell>
            <TableCell>{format(new Date(event.startDate), 'PPP p')}</TableCell>
            <TableCell>
              {event.endDate ? format(new Date(event.endDate), 'PPP p') : '-'}
            </TableCell>
            <TableCell>{event.location || '-'}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Link href={`/dashboard/resources/events/${event.id}`}>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </Link>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDelete(event.id)}
                >
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
        {events.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center">
              No events found. Create your first event to get started.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
} 