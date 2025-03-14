'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit } from 'lucide-react';
import { Subscription } from '@/lib/db/temp-schema/subscriptions.types';
import DeleteSubscriptionButton from './delete-subscription-button';

interface SubscriptionCardProps {
  subscription: Subscription;
}

export default function SubscriptionCard({ subscription }: SubscriptionCardProps) {
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

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="text-xl">{subscription.name}</CardTitle>
          <Badge variant="outline" className="mt-2 capitalize">
            {subscription.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              {subscription.description}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                {formatCurrency(subscription.amount)}
              </span>
              <Badge variant="secondary" className="capitalize">
                {subscription.billingFrequency}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              <div>Start Date: {formatDate(subscription.startDate)}</div>
              {subscription.endDate && (
                <div>End Date: {formatDate(subscription.endDate)}</div>
              )}
              {subscription.category && (
                <div>Category: {subscription.category}</div>
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2 border-t">
            <Link href={`/dashboard/resources/subscriptions/${subscription.id}`}>
              <Button variant="ghost" size="sm">
                View
              </Button>
            </Link>
            <Link href={`/dashboard/resources/subscriptions/${subscription.id}/edit`}>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <DeleteSubscriptionButton 
              subscriptionId={subscription.id} 
              subscriptionName={subscription.name} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 