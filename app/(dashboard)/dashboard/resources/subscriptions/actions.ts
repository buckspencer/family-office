'use server';

import { z } from 'zod';
import { validatedActionWithUser } from '@/lib/auth/middleware';
import { getUserWithTeam } from '@/lib/db/actions/users';
import { createSubscription as createSubscriptionAction } from '@/lib/db/actions/subscriptions';

const subscriptionSchema = z.object({
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
});

export const createSubscription = validatedActionWithUser(
  subscriptionSchema,
  async (data, _, user) => {
    const userWithTeam = await getUserWithTeam(user.id);
    if (!userWithTeam?.teamId) {
      return { error: 'User is not associated with a team.' };
    }

    try {
      const newSubscription = await createSubscriptionAction({
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        teamId: userWithTeam.teamId,
        userId: user.id,
      });

      return { success: 'Subscription created successfully.', subscription: newSubscription };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to create subscription.' };
    }
  }
); 