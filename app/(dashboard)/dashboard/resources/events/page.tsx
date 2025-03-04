'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import EventsTable from './events-table';
// @ts-ignore - Using temp-schema
import { events } from '@/lib/db/temp-schema/events.types';
import { BackButton } from '@/components/ui/back-button';

export default function EventsPage() {
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
          <EventsTable events={events} />
        </CardContent>
      </Card>
    </div>
  );
} 