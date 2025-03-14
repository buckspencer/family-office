'use client';

import { BackButton } from '@/components/ui/back-button';
import { SubscriptionsTable } from './subscriptions-table';
import { Subscription } from '@/lib/db/temp-schema/subscriptions.types';

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

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Subscriptions</h1>
        <a
          href="/dashboard/resources/subscriptions/new"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Add Subscription
        </a>
      </div>

      <SubscriptionsTable initialSubscriptions={initialSubscriptions} />
    </div>
  );
} 