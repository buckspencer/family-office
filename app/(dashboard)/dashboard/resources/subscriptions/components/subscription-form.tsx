'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Subscription } from '@/lib/db/temp-schema/subscriptions.types';
import { createSubscription, updateSubscription } from '../actions';

const subscriptionTypes = [
  { value: 'service', label: 'Service' },
  { value: 'membership', label: 'Membership' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'other', label: 'Other' },
] as const;

const billingFrequencies = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'one-time', label: 'One-time' },
] as const;

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['service', 'membership', 'subscription', 'other'], {
    required_error: 'Subscription type is required',
  }),
  description: z.string().min(1, 'Description is required'),
  amount: z.coerce.number().min(0, 'Amount must be greater than or equal to 0'),
  billingFrequency: z.enum(['monthly', 'quarterly', 'yearly', 'one-time'], {
    required_error: 'Billing frequency is required',
  }),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  autoRenew: z.coerce.boolean(),
  category: z.string().optional(),
  notes: z.string().optional(),
  paymentMethod: z.string().optional(),
  lastBilled: z.string().optional(),
  nextBilling: z.string().optional(),
  status: z.enum(['active', 'cancelled', 'pending', 'failed']).default('active'),
  isArchived: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface SubscriptionFormProps {
  subscription?: Subscription;
  mode: 'create' | 'edit';
}

export function SubscriptionForm({ subscription, mode }: SubscriptionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: subscription?.name || '',
      type: subscription?.type || 'service',
      description: subscription?.description || '',
      amount: subscription?.amount || 0,
      billingFrequency: subscription?.billingFrequency || 'monthly',
      startDate: subscription?.startDate ? new Date(subscription.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: subscription?.endDate ? new Date(subscription.endDate).toISOString().split('T')[0] : '',
      autoRenew: subscription?.autoRenew || false,
      category: subscription?.category || '',
      notes: subscription?.notes || '',
      paymentMethod: subscription?.paymentMethod || '',
      lastBilled: subscription?.lastBilled ? new Date(subscription.lastBilled).toISOString().split('T')[0] : '',
      nextBilling: subscription?.nextBilling ? new Date(subscription.nextBilling).toISOString().split('T')[0] : '',
      status: subscription?.status || 'active',
      isArchived: subscription?.isArchived || false,
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      setIsSubmitting(true);
      console.log('Form values before conversion:', values);
      console.log('Subscription prop:', subscription);

      // Convert form values to FormData
      const formData = new FormData();
      
      // Always include all fields, even if they're empty
      Object.entries(values).forEach(([key, value]) => {
        // Convert value to string if it's not already a string
        const stringValue = typeof value === 'string' ? value : String(value);
        formData.append(key, stringValue);
        console.log(`Adding to FormData: ${key} = ${stringValue}`);
      });

      // Add additional fields that might be needed
      if (subscription) {
        console.log('Adding subscription ID:', subscription.id);
        formData.append('id', subscription.id.toString());
        // Preserve existing metadata and tags if they exist
        if (subscription.metadata) {
          formData.append('metadata', JSON.stringify(subscription.metadata));
        }
        if (subscription.tags) {
          formData.append('tags', JSON.stringify(subscription.tags));
        }
        // Preserve userId if it exists
        if (subscription.userId) {
          formData.append('userId', subscription.userId.toString());
        }
      }

      let result;
      if (mode === 'create') {
        result = await createSubscription(formData);
      } else if (subscription) {
        result = await updateSubscription(formData);
      }

      console.log('Server response:', result);

      if (result?.error) {
        console.error('Error from server:', result.error);
        toast.error(result.error);
        return;
      }

      if (result?.success) {
        toast.success(`Subscription ${mode === 'create' ? 'created' : 'updated'} successfully`);
        router.push('/dashboard/resources/subscriptions');
        router.refresh(); // Force a refresh to show the updated data
      } else {
        console.error('No success in response:', result);
        toast.error(`Failed to ${mode === 'create' ? 'create' : 'update'} subscription`);
      }
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} subscription:`, error);
      toast.error(`Failed to ${mode === 'create' ? 'create' : 'update'} subscription`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>{mode === 'create' ? 'Add New Subscription' : 'Edit Subscription'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter subscription name" required {...field} />
                    </FormControl>
                    <FormDescription>
                      Name of the subscription
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subscription Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} required>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subscriptionTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the type of subscription
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the subscription"
                        required
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Brief description of the subscription
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter subscription amount"
                        required
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Cost of the subscription
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billingFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Frequency *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} required>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select billing frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {billingFrequencies.map((frequency) => (
                          <SelectItem key={frequency.value} value={frequency.value}>
                            {frequency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How often you are billed
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date *</FormLabel>
                    <FormControl>
                      <Input type="date" required {...field} />
                    </FormControl>
                    <FormDescription>
                      When the subscription starts
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>
                      When the subscription ends (if applicable)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="autoRenew"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Auto-renew</FormLabel>
                      <FormDescription>
                        Automatically renew the subscription
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter category (e.g., Entertainment, Software)" {...field} />
                    </FormControl>
                    <FormDescription>
                      Category for organizing subscriptions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes about this subscription"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter payment method" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastBilled"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Billed</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nextBilling"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Billing</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isArchived"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Archived</FormLabel>
                      <FormDescription>
                        Archive this subscription
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Link href="/dashboard/resources/subscriptions">
                  <Button variant="outline" disabled={isSubmitting}>Cancel</Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Subscription' : 'Update Subscription'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 