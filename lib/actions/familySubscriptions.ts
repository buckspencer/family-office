'use server';

import 'server-only'; // Ensures this module runs only on the server
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { familySubscriptions, NewFamilySubscription, TeamDataWithMembers } from '@/lib/db/schema';
import { getSession } from '@/app/lib/auth/session'; // Removed validateSession import
import { eq, and, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getTeamForUser } from '@/lib/db/queries';
import type { Team } from '@/lib/db/schema';

// Get the current team ID for the user
async function getCurrentTeamId(userId: string): Promise<string | null> {
  const team = await getTeamForUser(userId);
  return team?.id?.toString() || null;
}

// --- Validation Schemas ---

const CreateSubscriptionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  monthlyCost: z.coerce.number().positive('Monthly cost must be positive'),
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
  description: z.string().optional(),
});

const UpdateSubscriptionSchema = CreateSubscriptionSchema.partial().extend({
  id: z.number().int().positive('Invalid ID'),
});

const DeleteSubscriptionSchema = z.object({
  id: z.number().int().positive('Invalid ID'),
});

const GetSubscriptionSchema = z.object({
  id: z.number().int().positive('Invalid ID'),
});

// --- Server Actions ---

/**
 * Creates a new family subscription.
 * Requires user to be authenticated.
 * TODO: Implement proper team permission check based on fetched teamId.
 */
export async function createSubscription(
  input: z.infer<typeof CreateSubscriptionSchema>
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, message: 'Unauthorized', errors: null };
  }

  const userId = session.user.id;
  const teamId = await getCurrentTeamId(userId);

  if (!teamId) {
    return { success: false, message: 'Could not determine user team affiliation.', errors: null };
  }

  const validationResult = CreateSubscriptionSchema.safeParse(input);
  if (!validationResult.success) {
    return { 
      success: false, 
      message: 'Invalid input', 
      errors: validationResult.error.flatten() 
    };
  }

  const data = validationResult.data;

  try {
    const newSubscriptionData: NewFamilySubscription = {
      name: data.name,
      monthlyCost: data.monthlyCost.toString(),
      url: data.url || null,
      description: data.description || null,
      teamId: teamId,
      createdBy: userId,
    };

    const result = await db.insert(familySubscriptions)
      .values(newSubscriptionData)
      .returning();

    revalidatePath('/dashboard/family/subscriptions');

    return { success: true, data: result[0], errors: null };

  } catch (error) {
    console.error('Error creating subscription:', error);
    return { 
      success: false, 
      message: 'Failed to create subscription',
      errors: null 
    };
  }
}

// --- Placeholder for other actions ---

export async function getSubscription(input: z.infer<typeof GetSubscriptionSchema>) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, message: 'Unauthorized', data: null };
  }

  const userId = session.user.id;
  const teamId = await getCurrentTeamId(userId);

  if (!teamId) {
    return { success: false, message: 'Could not determine user team affiliation.', data: null };
  }

  const validationResult = GetSubscriptionSchema.safeParse(input);
  if (!validationResult.success) {
    return { success: false, message: 'Invalid input', errors: validationResult.error.flatten(), data: null };
  }

  const { id } = validationResult.data;

  try {
    const subscription = await db.query.familySubscriptions.findFirst({
      where: and(
        eq(familySubscriptions.id, id),
        eq(familySubscriptions.teamId, teamId),
        isNull(familySubscriptions.deletedAt)
      )
      // No need to specify columns, fetch all by default
    });

    if (!subscription) {
      return { success: false, message: 'Subscription not found or permission denied.', data: null };
    }

    return { success: true, data: subscription };

  } catch (error) {
    console.error('Error getting subscription:', error);
    return { success: false, message: 'Failed to retrieve subscription', data: null };
  }
}

export async function listSubscriptions() {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, message: 'Unauthorized', data: [] };
  }

  const userId = session.user.id;
  const teamId = await getCurrentTeamId(userId);

  if (!teamId) {
    return { success: false, message: 'Could not determine user team affiliation.', data: [] };
  }

  // TODO: Add permission check if needed beyond just team membership

  try {
    const subscriptions = await db.select()
      .from(familySubscriptions)
      .where(
        and(
          eq(familySubscriptions.teamId, teamId),
          isNull(familySubscriptions.deletedAt) // Use isNull for checking null
        )
      )
      .orderBy(familySubscriptions.createdAt);

    return { success: true, data: subscriptions };

  } catch (error) {
    console.error('Error listing subscriptions:', error);
    return { success: false, message: 'Failed to list subscriptions', data: [] };
  }
}

export async function updateSubscription(
  input: z.infer<typeof UpdateSubscriptionSchema>
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, message: 'Unauthorized' };
  }

  const userId = session.user.id;
  const teamId = await getCurrentTeamId(userId);

  if (!teamId) {
    return { success: false, message: 'Could not determine user team affiliation.' };
  }

  const validationResult = UpdateSubscriptionSchema.safeParse(input);
  if (!validationResult.success) {
    return { success: false, message: 'Invalid input', errors: validationResult.error.flatten() };
  }

  const data = validationResult.data;

  try {
    // Verify the subscription exists and belongs to the user's team
    const existingSubscription = await db.query.familySubscriptions.findFirst({
      where: and(
        eq(familySubscriptions.id, data.id),
        eq(familySubscriptions.teamId, teamId),
        isNull(familySubscriptions.deletedAt) // Ensure it's not deleted
      ),
      columns: { id: true } // Only need the ID for verification
    });

    if (!existingSubscription) {
      return { success: false, message: 'Subscription not found or permission denied.' };
    }

    // Prepare data for update (only fields present in input)
    const updateData: Partial<NewFamilySubscription> = {
      updatedBy: userId,
      // updatedAt will be handled by DB default or trigger if set up
      // Explicitly set updatedAt if no DB default/trigger exists
      // updatedAt: new Date().toISOString(),
    };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.monthlyCost !== undefined) updateData.monthlyCost = data.monthlyCost.toString();
    if (data.url !== undefined) updateData.url = data.url || null;
    if (data.description !== undefined) updateData.description = data.description || null;

    // Perform the update
    const result = await db.update(familySubscriptions)
      .set(updateData)
      .where(eq(familySubscriptions.id, data.id)) // Use the validated ID
      .returning();

    revalidatePath('/dashboard/family/subscriptions');
    revalidatePath(`/dashboard/family/subscriptions/${data.id}`); // Revalidate specific item path if exists

    return { success: true, data: result[0] };

  } catch (error) {
    console.error('Error updating subscription:', error);
    return { success: false, message: 'Failed to update subscription' };
  }
}

export async function deleteSubscription(
  input: z.infer<typeof DeleteSubscriptionSchema>
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, message: 'Unauthorized', errors: null };
  }

  const userId = session.user.id;
  const teamId = await getCurrentTeamId(userId);

  if (!teamId) {
    return { success: false, message: 'Could not determine user team affiliation.', errors: null };
  }

  const validationResult = DeleteSubscriptionSchema.safeParse(input);
  if (!validationResult.success) {
    return { 
      success: false, 
      message: 'Invalid input', 
      errors: validationResult.error.flatten() 
    };
  }

  const { id } = validationResult.data;

  try {
    // Verify the subscription exists and belongs to the user's team
    const existingSubscription = await db.query.familySubscriptions.findFirst({
      where: and(
        eq(familySubscriptions.id, id),
        eq(familySubscriptions.teamId, teamId),
        isNull(familySubscriptions.deletedAt)
      )
    });

    if (!existingSubscription) {
      return { 
        success: false, 
        message: 'Subscription not found or permission denied.',
        errors: null 
      };
    }

    // Soft delete by setting deletedAt
    await db.update(familySubscriptions)
      .set({ 
        deletedAt: new Date().toISOString(),
        updatedBy: userId
      })
      .where(eq(familySubscriptions.id, id));

    revalidatePath('/dashboard/family/subscriptions');

    return { success: true, errors: null };

  } catch (error) {
    console.error('Error deleting subscription:', error);
    return { 
      success: false, 
      message: 'Failed to delete subscription',
      errors: null 
    };
  }
}