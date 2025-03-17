import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import EventsTable from './events-table';
import { getEvents } from '@/lib/db/actions/events';
import { BackButton } from '@/components/ui/back-button';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EventsPage() {
  const supabase = createServerComponentClient({ cookies });

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/signin');
  }

  // Get team ID (hardcoded to 1 for now, should be fetched from user's active team)
  const teamId = 1;
  
  // Fetch events
  const { success, data: events, error } = await getEvents(teamId, {
    orderBy: 'startDate',
    orderDir: 'desc',
  });

  return (
    <div className="container mx-auto p-6">
      <BackButton 
        href="/dashboard/resources" 
        label="Back to Resources Dashboard"
      />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Events</h1>
        <Link href="/dashboard/resources/events/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-red-500 mb-4">Error loading events: {error}</div>
          )}
          {success && events && (
            <EventsTable events={events} />
          )}
          {success && (!events || events.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              No events found. Create your first event to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 