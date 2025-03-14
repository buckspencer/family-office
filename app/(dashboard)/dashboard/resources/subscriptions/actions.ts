'use server';

import { getUser } from '@/lib/auth/session';
import { revalidatePath } from 'next/cache';
import { 
  createSubscription as createSubscriptionAction,
  getSubscriptions as getSubscriptionsAction,
  getSubscriptionById as getSubscriptionByIdAction,
  updateSubscription as updateSubscriptionDb,
  deleteSubscription as deleteSubscriptionAction
} from '@/lib/db/actions/subscriptions';
import { Subscription, SubscriptionType, BillingFrequency } from '@/lib/db/temp-schema/subscriptions.types';
import { headers } from 'next/headers';

// Define a standard response type for all actions
export type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function getSubscriptions(teamId?: number) {
  try {
    // Get the authenticated user
    const user = await getUser();
    console.log('User result:', user);
    
    if (!user?.teamId) {
      return { error: 'User is not authenticated or does not belong to a team' };
    }

    const resolvedTeamId = teamId ?? user.teamId;
    const response = await getSubscriptionsAction(resolvedTeamId);
    
    if (!response.success) {
      return { error: response.error || 'Failed to fetch subscriptions' };
    }
    
    return { subscriptions: response.data || [] };
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return { error: 'Failed to fetch subscriptions' };
  }
}

export async function getSubscriptionById(id: number) {
  try {
    const user = await getUser();
    
    if (!user?.teamId) {
      return { success: false, error: 'User is not authenticated or does not belong to a team' };
    }

    const response = await getSubscriptionByIdAction(id);
    return response;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return { success: false, error: 'Failed to fetch subscription' };
  }
}

export async function createSubscription(formData: FormData): Promise<ActionResponse<Subscription>> {
  try {
    const user = await getUser();
    if (!user?.teamId) {
      return { success: false, error: 'User is not authenticated or does not belong to a team' };
    }

    // Extract and validate form data
    const data = {
      teamId: user.teamId,
      userId: user.id, // Use the UUID directly without parsing
      name: formData.get('name')?.toString() || '',
      type: formData.get('type') as SubscriptionType,
      description: formData.get('description')?.toString() || '',
      amount: parseFloat(formData.get('amount')?.toString() || '0'),
      billingFrequency: formData.get('billingFrequency') as BillingFrequency,
      startDate: new Date(formData.get('startDate')?.toString() || ''),
      endDate: formData.get('endDate')?.toString() ? new Date(formData.get('endDate')?.toString() || '') : null,
      autoRenew: formData.get('autoRenew') === 'true',
      category: formData.get('category')?.toString() || null,
      notes: formData.get('notes')?.toString() || null,
      paymentMethod: formData.get('paymentMethod')?.toString() || null,
      lastBilled: formData.get('lastBilled')?.toString() ? new Date(formData.get('lastBilled')?.toString() || '') : null,
      nextBilling: formData.get('nextBilling')?.toString() ? new Date(formData.get('nextBilling')?.toString() || '') : null,
      status: (formData.get('status')?.toString() || 'active') as 'active' | 'cancelled' | 'pending' | 'failed',
      isArchived: formData.get('isArchived') === 'true',
      tags: [],
      metadata: {}
    };

    const result = await createSubscriptionAction(data);
    return result;
  } catch (error) {
    console.error('Error creating subscription:', error);
    return { success: false, error: 'Failed to create subscription' };
  }
}

export async function updateSubscription(formData: FormData): Promise<ActionResponse<Subscription>> {
  try {
    const user = await getUser();
    
    if (!user?.teamId) {
      return { success: false, error: 'User is not authenticated or does not belong to a team' };
    }

    const id = formData.get('id');
    if (!id) {
      return { success: false, error: 'Subscription ID is required' };
    }

    const subscriptionId = parseInt(id.toString(), 10);
    const updateData = {
      teamId: user.teamId,
      userId: user.id, // Use the UUID directly without parsing
      name: formData.get('name')?.toString() || '',
      type: formData.get('type') as SubscriptionType,
      description: formData.get('description')?.toString() || '',
      amount: parseFloat(formData.get('amount')?.toString() || '0'),
      billingFrequency: formData.get('billingFrequency') as BillingFrequency,
      startDate: new Date(formData.get('startDate')?.toString() || ''),
      endDate: formData.get('endDate')?.toString() ? new Date(formData.get('endDate')?.toString() || '') : null,
      autoRenew: formData.get('autoRenew') === 'true',
      category: formData.get('category')?.toString() || null,
      notes: formData.get('notes')?.toString() || null,
      paymentMethod: formData.get('paymentMethod')?.toString() || null,
      lastBilled: formData.get('lastBilled')?.toString() ? new Date(formData.get('lastBilled')?.toString() || '') : null,
      nextBilling: formData.get('nextBilling')?.toString() ? new Date(formData.get('nextBilling')?.toString() || '') : null,
      status: (formData.get('status')?.toString() || 'active') as 'active' | 'cancelled' | 'pending' | 'failed',
      isArchived: formData.get('isArchived') === 'true',
      tags: [],
      metadata: {}
    };

    const result = await updateSubscriptionDb(subscriptionId, updateData);
    return result;
  } catch (error) {
    console.error('Error updating subscription:', error);
    return { success: false, error: 'Failed to update subscription' };
  }
}

export async function deleteSubscription(id: number): Promise<ActionResponse<void>> {
  try {
    const user = await getUser();
    
    if (!user?.teamId) {
      return { success: false, error: 'User is not authenticated or does not belong to a team' };
    }

    const response = await deleteSubscriptionAction(id);

    if (response.success) {
      revalidatePath('/dashboard/resources/subscriptions');
      return { success: true };
    } else {
      return { success: false, error: response.error || 'Failed to delete subscription' };
    }
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return { success: false, error: 'An error occurred while deleting the subscription' };
  }
} 