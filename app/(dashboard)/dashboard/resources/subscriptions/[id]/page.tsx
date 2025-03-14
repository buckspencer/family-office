import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BackButton } from '@/components/ui/back-button';
import { Edit, Trash2 } from 'lucide-react';
import { getSubscriptionById } from '@/lib/db/actions/subscriptions';
import DeleteSubscriptionButton from '../delete-subscription-button';

interface SubscriptionPageProps {
  params: {
    id: string;
  };
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (date: Date | null) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default async function SubscriptionPage({ params }: SubscriptionPageProps) {
  const { id: idString } = await params;
  const id = parseInt(idString, 10);
  
  if (isNaN(id)) {
    notFound();
  }
  
  const response = await getSubscriptionById(id);
  
  if (!response.success || !response.data) {
    notFound();
  }
  
  const subscription = response.data;
  
  return (
    <div className="container mx-auto p-6">
      <BackButton 
        href="/dashboard/resources/subscriptions" 
        label="Back to Subscriptions"
      />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{subscription.name}</h1>
          <div className="flex items-center mt-2 space-x-2">
            <Badge variant="outline" className="capitalize">
              {subscription.type}
            </Badge>
            <Badge 
              variant={subscription.isArchived ? 'secondary' : 'default'}
              className="capitalize"
            >
              {subscription.isArchived ? 'archived' : 'active'}
            </Badge>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link href={`/dashboard/resources/subscriptions/${id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Subscription
            </Button>
          </Link>
          <DeleteSubscriptionButton 
            subscriptionId={subscription.id} 
            subscriptionName={subscription.name} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Description</h3>
              <p className="mt-1">{subscription.description}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Amount</h3>
              <p className="mt-1">{formatCurrency(subscription.amount)}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Billing Frequency</h3>
              <p className="mt-1 capitalize">{subscription.billingFrequency}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Start Date</h3>
              <p className="mt-1">{formatDate(subscription.startDate)}</p>
            </div>
            {subscription.endDate && (
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">End Date</h3>
                <p className="mt-1">{formatDate(subscription.endDate)}</p>
              </div>
            )}
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Auto-renew</h3>
              <p className="mt-1">{subscription.autoRenew ? 'Yes' : 'No'}</p>
            </div>
            {subscription.category && (
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Category</h3>
                <p className="mt-1">{subscription.category}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription.paymentMethod && (
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Payment Method</h3>
                <p className="mt-1">{subscription.paymentMethod}</p>
              </div>
            )}
            {subscription.lastBilled && (
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Last Billed</h3>
                <p className="mt-1">{formatDate(subscription.lastBilled)}</p>
              </div>
            )}
            {subscription.nextBilling && (
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Next Billing</h3>
                <p className="mt-1">{formatDate(subscription.nextBilling)}</p>
              </div>
            )}
            {subscription.notes && (
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Notes</h3>
                <p className="mt-1 whitespace-pre-wrap">{subscription.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 