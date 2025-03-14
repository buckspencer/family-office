'use client';

import { BackButton } from '@/components/ui/back-button';
import { SubscriptionsTable } from './subscriptions-table';
import { Subscription } from '@/lib/db/temp-schema/subscriptions.types';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { PlusCircle } from 'lucide-react';

interface SubscriptionsClientProps {
  initialSubscriptions: Subscription[];
}

export function SubscriptionsClient({ initialSubscriptions }: SubscriptionsClientProps) {
  return (
    <div className="container mx-auto py-6">
      <BackButton 
        href="/dashboard/resources" 
        label="Back to Resources Dashboard"
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-3xl font-bold tracking-tight">Subscriptions</h2>
          <Badge className="ml-2">{initialSubscriptions.length}</Badge>
        </div>
        <Link href="/dashboard/resources/subscriptions/new/" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Subscription
        </Link>
      </div>

      <SubscriptionsTable initialSubscriptions={initialSubscriptions} />
    </div>
  );
} 