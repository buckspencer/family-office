'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { eq, desc, and, sql, gte, lte } from 'drizzle-orm';
import { subscriptions, subscriptionType, billingFrequency, subscriptionStatus } from '../schema';
import { z } from 'zod';
import { DbSubscription, Subscription } from '@/lib/db/temp-schema/subscriptions.types';

type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Database Operations
async function createSubscriptionQuery(data: Omit<DbSubscription, 'id' | 'createdAt' | 'updatedAt'>) {
  return db.insert(subscriptions).values(data).returning().then(results => results.map(subscription => ({
    ...subscription,
    amount: parseFloat(subscription.amount)
  })));
}

async function getSubscriptionsQuery(teamId: number, options?: { 
  limit?: number; 
  offset?: number; 
  orderBy?: string; 
  orderDir?: 'asc' | 'desc';
  isArchived?: boolean;
  type?: typeof subscriptionType.enumValues[number];
  status?: typeof subscriptionStatus.enumValues[number];
  billingFrequency?: typeof billingFrequency.enumValues[number];
  nextBillingBefore?: Date;
  nextBillingAfter?: Date;
}): Promise<Subscription[]> {
  const { 
    limit = 100, 
    offset = 0, 
    orderBy = 'nextBilling', 
    orderDir = 'asc', 
    isArchived = false,
    type,
    status,
    billingFrequency: billing,
    nextBillingBefore,
    nextBillingAfter
  } = options || {};
  
  const orderColumn = subscriptions[orderBy as keyof typeof subscriptions] as any;
  const orderDirection = orderDir === 'asc' ? sql`asc` : sql`desc`;
  
  let conditions = and(
    eq(subscriptions.teamId, teamId),
    eq(subscriptions.isArchived, isArchived)
  );
  
  if (type) {
    conditions = and(conditions, eq(subscriptions.type, type));
  }
  
  if (status) {
    conditions = and(conditions, eq(subscriptions.status, status));
  }
  
  if (billing) {
    conditions = and(conditions, eq(subscriptions.billingFrequency, billing));
  }
  
  if (nextBillingBefore) {
    conditions = and(conditions, lte(subscriptions.nextBilling, nextBillingBefore));
  }
  
  if (nextBillingAfter) {
    conditions = and(conditions, gte(subscriptions.nextBilling, nextBillingAfter));
  }
  
  const results = await db.select()
    .from(subscriptions)
    .where(conditions)
    .orderBy(sql`${orderColumn} ${orderDirection}`)
    .limit(limit)
    .offset(offset);

  return results.map(subscription => ({
    ...subscription,
    amount: parseFloat(subscription.amount)
  }));
}

async function getSubscriptionByIdQuery(id: number): Promise<Subscription[]> {
  const [subscription] = await db.select()
    .from(subscriptions)
    .where(eq(subscriptions.id, id))
    .limit(1);

  if (!subscription) return [];

  return [{
    ...subscription,
    amount: parseFloat(subscription.amount)
  }];
}

async function updateSubscriptionQuery(id: number, data: Partial<DbSubscription>) {
  return db.update(subscriptions)
    .set({
      ...data,
      updatedAt: new Date()
    })
    .where(eq(subscriptions.id, id))
    .returning()
    .then(results => results.map(subscription => ({
      ...subscription,
      amount: parseFloat(subscription.amount)
    })));
}

async function deleteSubscriptionQuery(id: number) {
  return db.delete(subscriptions)
    .where(eq(subscriptions.id, id))
    .returning()
    .then(results => results.map(subscription => ({
      ...subscription,
      amount: parseFloat(subscription.amount)
    })));
}

// Input validation schemas
const createSubscriptionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(subscriptionType.enumValues),
  description: z.string(),
  amount: z.number().min(0, "Amount must be greater than or equal to 0"),
  billingFrequency: z.enum(billingFrequency.enumValues),
  startDate: z.date(),
  endDate: z.date().nullable(),
  autoRenew: z.boolean().nullable(),
  category: z.string().nullable(),
  notes: z.string().nullable(),
  paymentMethod: z.string().nullable(),
  lastBilled: z.date().nullable(),
  nextBilling: z.date().nullable(),
  status: z.enum(subscriptionStatus.enumValues).default('active'),
  isArchived: z.boolean().nullable(),
  tags: z.array(z.string()).nullable(),
  metadata: z.record(z.any()).nullable(),
  teamId: z.number(),
  userId: z.string()
});

const updateSubscriptionSchema = createSubscriptionSchema.partial();

// Server Actions
export async function createSubscription(data: z.infer<typeof createSubscriptionSchema>): Promise<ActionResponse<Subscription>> {
  try {
    // Validate input
    const validatedData = createSubscriptionSchema.parse(data);
    
    const [subscription] = await createSubscriptionQuery({
      ...validatedData,
      amount: validatedData.amount.toString(),
      autoRenew: validatedData.autoRenew ?? null,
      isArchived: validatedData.isArchived ?? null,
      tags: validatedData.tags ?? null,
      metadata: validatedData.metadata ?? null,
      category: validatedData.category ?? null,
      notes: validatedData.notes ?? null,
      paymentMethod: validatedData.paymentMethod ?? null,
      lastBilled: validatedData.lastBilled ?? null,
      nextBilling: validatedData.nextBilling ?? null,
      endDate: validatedData.endDate ?? null
    });
    revalidatePath('/dashboard/resources/subscriptions');
    return { success: true, data: subscription };
  } catch (error) {
    console.error('Error creating subscription:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Failed to create subscription' };
  }
}

export async function getSubscriptions(
  teamId: number, 
  options?: { 
    limit?: number; 
    offset?: number; 
    orderBy?: string; 
    orderDir?: 'asc' | 'desc';
    isArchived?: boolean;
    type?: typeof subscriptionType.enumValues[number];
    status?: typeof subscriptionStatus.enumValues[number];
    billingFrequency?: typeof billingFrequency.enumValues[number];
    nextBillingBefore?: Date;
    nextBillingAfter?: Date;
  }
): Promise<ActionResponse<Subscription[]>> {
  try {
    const subscriptionsList = await getSubscriptionsQuery(teamId, options);
    return { success: true, data: subscriptionsList };
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return { success: false, error: 'Failed to fetch subscriptions' };
  }
}

export async function getSubscriptionById(id: number): Promise<ActionResponse<Subscription | null>> {
  try {
    const [subscription] = await getSubscriptionByIdQuery(id);
    if (!subscription) {
      return { success: false, error: 'Subscription not found' };
    }
    return { success: true, data: subscription };
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return { success: false, error: 'Failed to fetch subscription' };
  }
}

export async function updateSubscription(id: number, data: z.infer<typeof updateSubscriptionSchema>): Promise<ActionResponse<Subscription>> {
  try {
    // Validate input
    const validatedData = updateSubscriptionSchema.parse(data);
    
    const [subscription] = await updateSubscriptionQuery(id, {
      ...validatedData,
      amount: validatedData.amount?.toString(),
      autoRenew: validatedData.autoRenew ?? null,
      isArchived: validatedData.isArchived ?? null,
      tags: validatedData.tags ?? null,
      metadata: validatedData.metadata ?? null,
      category: validatedData.category ?? null,
      notes: validatedData.notes ?? null,
      paymentMethod: validatedData.paymentMethod ?? null,
      lastBilled: validatedData.lastBilled ?? null,
      nextBilling: validatedData.nextBilling ?? null,
      endDate: validatedData.endDate ?? null
    });
    if (!subscription) {
      return { success: false, error: 'Subscription not found' };
    }
    revalidatePath('/dashboard/resources/subscriptions');
    return { success: true, data: subscription };
  } catch (error) {
    console.error('Error updating subscription:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Failed to update subscription' };
  }
}

export async function deleteSubscription(id: number): Promise<ActionResponse<Subscription>> {
  try {
    const [subscription] = await deleteSubscriptionQuery(id);
    if (!subscription) {
      return { success: false, error: 'Subscription not found' };
    }
    revalidatePath('/dashboard/resources/subscriptions');
    return { success: true, data: subscription };
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return { success: false, error: 'Failed to delete subscription' };
  }
}

// Archive/Unarchive subscription
export async function toggleSubscriptionArchiveStatus(id: number, isArchived: boolean): Promise<ActionResponse<Subscription>> {
  try {
    const [subscription] = await updateSubscriptionQuery(id, { isArchived });
    if (!subscription) {
      return { success: false, error: 'Subscription not found' };
    }
    revalidatePath('/dashboard/resources/subscriptions');
    return { success: true, data: subscription };
  } catch (error) {
    console.error('Error updating subscription archive status:', error);
    return { success: false, error: 'Failed to update subscription archive status' };
  }
}

// Update subscription status
export async function updateSubscriptionStatus(id: number, status: typeof subscriptionStatus.enumValues[number]): Promise<ActionResponse<Subscription>> {
  try {
    const [subscription] = await updateSubscriptionQuery(id, { status });
    if (!subscription) {
      return { success: false, error: 'Subscription not found' };
    }
    revalidatePath('/dashboard/resources/subscriptions');
    return { success: true, data: subscription };
  } catch (error) {
    console.error('Error updating subscription status:', error);
    return { success: false, error: 'Failed to update subscription status' };
  }
}

// Batch operations
export async function batchDeleteSubscriptions(ids: number[]): Promise<ActionResponse<{ count: number }>> {
  try {
    const result = await db.delete(subscriptions)
      .where(sql`${subscriptions.id} IN (${ids.join(',')})`)
      .returning()
      .then(results => results.map(subscription => ({
        ...subscription,
        amount: parseFloat(subscription.amount)
      })));
    
    revalidatePath('/dashboard/resources/subscriptions');
    return { success: true, data: { count: result.length } };
  } catch (error) {
    console.error('Error batch deleting subscriptions:', error);
    return { success: false, error: 'Failed to delete subscriptions' };
  }
}

export async function batchArchiveSubscriptions(ids: number[], isArchived: boolean): Promise<ActionResponse<{ count: number }>> {
  try {
    const result = await db.update(subscriptions)
      .set({ isArchived, updatedAt: new Date() })
      .where(sql`${subscriptions.id} IN (${ids.join(',')})`)
      .returning()
      .then(results => results.map(subscription => ({
        ...subscription,
        amount: parseFloat(subscription.amount)
      })));
    
    revalidatePath('/dashboard/resources/subscriptions');
    return { success: true, data: { count: result.length } };
  } catch (error) {
    console.error('Error batch archiving subscriptions:', error);
    return { success: false, error: 'Failed to archive subscriptions' };
  }
} 