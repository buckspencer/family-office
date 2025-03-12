'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { eq, desc, and, sql, gte, lte } from 'drizzle-orm';
import { subscriptions, subscriptionType, billingFrequency, subscriptionStatus } from '../schema';
import { z } from 'zod';

// Define types based on the schema
type Subscription = typeof subscriptions.$inferSelect;
type NewSubscription = typeof subscriptions.$inferInsert;

type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Database Operations
async function createSubscriptionQuery(data: NewSubscription) {
  return db.insert(subscriptions).values(data).returning();
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
}) {
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
  
  return db.select()
    .from(subscriptions)
    .where(conditions)
    .orderBy(sql`${orderColumn} ${orderDirection}`)
    .limit(limit)
    .offset(offset);
}

async function getSubscriptionByIdQuery(id: number) {
  return db.select()
    .from(subscriptions)
    .where(eq(subscriptions.id, id))
    .limit(1);
}

async function updateSubscriptionQuery(id: number, data: Partial<Subscription>) {
  return db.update(subscriptions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(subscriptions.id, id))
    .returning();
}

async function deleteSubscriptionQuery(id: number) {
  return db.delete(subscriptions)
    .where(eq(subscriptions.id, id))
    .returning();
}

// Input validation schemas
const createSubscriptionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(subscriptionType.enumValues),
  description: z.string(),
  amount: z.string().or(z.number().transform(n => n.toString())),
  billingFrequency: z.enum(billingFrequency.enumValues),
  startDate: z.date(),
  endDate: z.date().nullish(),
  autoRenew: z.boolean().default(true),
  category: z.string().nullish(),
  notes: z.string().nullish(),
  paymentMethod: z.string().nullish(),
  lastBilled: z.date().nullish(),
  nextBilling: z.date().nullish(),
  status: z.enum(subscriptionStatus.enumValues).default('active'),
  isArchived: z.boolean().default(false),
  tags: z.array(z.string()).nullish(),
  metadata: z.record(z.any()).nullish(),
  teamId: z.number(),
  userId: z.number()
});

const updateSubscriptionSchema = createSubscriptionSchema.partial();

// Server Actions
export async function createSubscription(data: z.infer<typeof createSubscriptionSchema>): Promise<ActionResponse<Subscription>> {
  try {
    // Validate input
    const validatedData = createSubscriptionSchema.parse(data);
    
    const [subscription] = await createSubscriptionQuery(validatedData);
    revalidatePath('/family/subscriptions');
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
    
    const [subscription] = await updateSubscriptionQuery(id, validatedData);
    if (!subscription) {
      return { success: false, error: 'Subscription not found' };
    }
    revalidatePath('/family/subscriptions');
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
    revalidatePath('/family/subscriptions');
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
    revalidatePath('/family/subscriptions');
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
    revalidatePath('/family/subscriptions');
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
      .returning();
    
    revalidatePath('/family/subscriptions');
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
      .returning();
    
    revalidatePath('/family/subscriptions');
    return { success: true, data: { count: result.length } };
  } catch (error) {
    console.error('Error batch archiving subscriptions:', error);
    return { success: false, error: 'Failed to archive subscriptions' };
  }
} 