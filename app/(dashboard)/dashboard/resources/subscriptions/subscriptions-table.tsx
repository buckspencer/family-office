'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { deleteSubscription } from './actions';
import { useRouter } from 'next/navigation';
import { Subscription } from '@/lib/db/temp-schema/subscriptions.types';

interface SubscriptionsTableProps {
  initialSubscriptions: Subscription[];
}

export function SubscriptionsTable({ initialSubscriptions }: SubscriptionsTableProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions);
  const router = useRouter();

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this subscription?')) {
      try {
        const result = await deleteSubscription(id);
        if (result.success) {
          setSubscriptions(subscriptions.filter(subscription => subscription.id !== id));
        } else {
          alert(result.error || 'Failed to delete subscription');
        }
      } catch (error) {
        console.error('Error deleting subscription:', error);
        alert('An error occurred while deleting the subscription');
      }
    }
  };

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
    <div className="space-y-4 pt-3">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Billing</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No subscriptions found.
                </TableCell>
              </TableRow>
            ) : (
              subscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell className="font-medium">{subscription.name}</TableCell>
                  <TableCell className="capitalize">{subscription.type}</TableCell>
                  <TableCell>{formatCurrency(subscription.amount)}</TableCell>
                  <TableCell className="capitalize">{subscription.billingFrequency}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Start: {formatDate(subscription.startDate)}</div>
                      {subscription.endDate && (
                        <div>End: {formatDate(subscription.endDate)}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <Link href={`/dashboard/resources/subscriptions/${subscription.id}`}>
                          <DropdownMenuItem>
                            View Details
                          </DropdownMenuItem>
                        </Link>
                        <Link href={`/dashboard/resources/subscriptions/${subscription.id}/edit`}>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem onClick={() => handleDelete(subscription.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 