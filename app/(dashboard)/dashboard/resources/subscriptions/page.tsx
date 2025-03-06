'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SubscriptionCard } from '@/components/ui/subscription-card';
import { Subscription } from '@/lib/db/temp-schema/subscriptions.types';
import { BackButton } from '@/components/ui/back-button';

// Mock data for development
const mockSubscriptions: Subscription[] = [
  {
    id: 1,
    name: 'Netflix',
    type: 'service',
    description: 'Streaming service subscription',
    amount: 19.99,
    billingFrequency: 'monthly',
    startDate: new Date('2024-01-01'),
    autoRenew: true,
    category: 'Entertainment',
    notes: 'Family plan',
    status: 'active',
    teamId: 1,
    userId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: 'Amazon Prime',
    type: 'subscription',
    description: 'Prime membership',
    amount: 139.99,
    billingFrequency: 'yearly',
    startDate: new Date('2024-01-01'),
    autoRenew: true,
    category: 'Shopping',
    notes: 'Includes Prime Video and shipping',
    status: 'active',
    teamId: 1,
    userId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = React.useState<Subscription[]>(mockSubscriptions);

  return (
    <div className="container mx-auto p-6">
      <BackButton 
        href="/dashboard/resources" 
        label="Back to Resources Dashboard"
      />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Subscriptions</h1>
        <Link href="/dashboard/resources/subscriptions/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Subscription
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subscriptions.length === 0 ? (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>No Subscriptions Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You haven&apos;t added any subscriptions yet. Click the button above to add your first subscription.
              </p>
            </CardContent>
          </Card>
        ) : (
          subscriptions.map((subscription) => (
            <SubscriptionCard key={subscription.id} subscription={subscription} />
          ))
        )}
      </div>
    </div>
  );
} 