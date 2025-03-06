import { Subscription, SubscriptionCreate, SubscriptionUpdate } from '@/lib/db/temp-schema/subscriptions.types';

// This will be replaced with actual database operations
const subscriptions: Subscription[] = [
  {
    id: 1,
    name: 'Netflix Premium',
    type: 'service',
    description: 'Streaming service for movies and TV shows',
    amount: 19.99,
    billingFrequency: 'monthly',
    startDate: new Date('2023-01-01'),
    autoRenew: true,
    category: 'Entertainment',
    notes: 'Family plan with 4 screens',
    status: 'active',
    teamId: 1,
    userId: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 2,
    name: 'Gym Membership',
    type: 'membership',
    description: 'Annual gym membership with all facilities',
    amount: 599.99,
    billingFrequency: 'yearly',
    startDate: new Date('2023-06-01'),
    endDate: new Date('2024-06-01'),
    autoRenew: true,
    category: 'Health & Fitness',
    notes: 'Includes personal training sessions',
    status: 'active',
    teamId: 1,
    userId: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 3,
    name: 'Adobe Creative Cloud',
    type: 'subscription',
    description: 'Design software suite',
    amount: 52.99,
    billingFrequency: 'monthly',
    startDate: new Date('2023-03-15'),
    autoRenew: true,
    category: 'Software',
    notes: 'All apps included',
    status: 'active',
    teamId: 1,
    userId: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 4,
    name: 'Amazon Prime',
    type: 'service',
    description: 'Prime membership with free shipping',
    amount: 139.00,
    billingFrequency: 'yearly',
    startDate: new Date('2023-09-01'),
    autoRenew: true,
    category: 'Shopping',
    notes: 'Includes Prime Video and Music',
    status: 'active',
    teamId: 1,
    userId: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 5,
    name: 'Spotify Family',
    type: 'service',
    description: 'Music streaming service',
    amount: 14.99,
    billingFrequency: 'monthly',
    startDate: new Date('2023-02-01'),
    autoRenew: true,
    category: 'Entertainment',
    notes: 'Family plan with 6 accounts',
    status: 'active',
    teamId: 1,
    userId: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

export async function getSubscriptionsByTeam(teamId: number): Promise<Subscription[]> {
  if (!teamId) throw new Error('Team ID is required');
  return subscriptions.filter(subscription => subscription.teamId === teamId);
}

export async function getSubscriptionById(id: number): Promise<Subscription | null> {
  if (!id) throw new Error('Subscription ID is required');
  return subscriptions.find(subscription => subscription.id === id) || null;
}

export async function getSubscriptionsByUser(userId: number): Promise<Subscription[]> {
  if (!userId) throw new Error('User ID is required');
  return subscriptions.filter(subscription => subscription.userId === userId);
}

export async function getSubscriptionsByTeamAndType(teamId: number, type: Subscription['type']): Promise<Subscription[]> {
  if (!teamId) throw new Error('Team ID is required');
  if (!type) throw new Error('Subscription type is required');
  return subscriptions.filter(subscription => subscription.teamId === teamId && subscription.type === type);
}

export async function createSubscription(data: SubscriptionCreate & { teamId: number; userId: number }): Promise<Subscription> {
  if (!data.teamId) throw new Error('Team ID is required');
  if (!data.userId) throw new Error('User ID is required');
  if (!data.name) throw new Error('Name is required');
  if (!data.type) throw new Error('Type is required');
  if (!data.description) throw new Error('Description is required');
  if (typeof data.amount !== 'number') throw new Error('Amount must be a number');
  if (!data.billingFrequency) throw new Error('Billing frequency is required');
  if (!data.startDate) throw new Error('Start date is required');
  if (typeof data.autoRenew !== 'boolean') throw new Error('Auto-renew must be a boolean');

  const newSubscription: Subscription = {
    id: subscriptions.length + 1,
    ...data,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  subscriptions.push(newSubscription);
  return newSubscription;
}

export async function updateSubscription(id: number, data: SubscriptionUpdate): Promise<Subscription | null> {
  if (!id) throw new Error('Subscription ID is required');
  if (data.amount !== undefined && typeof data.amount !== 'number') {
    throw new Error('Amount must be a number');
  }

  const subscriptionIndex = subscriptions.findIndex(subscription => subscription.id === id);
  if (subscriptionIndex === -1) return null;

  subscriptions[subscriptionIndex] = {
    ...subscriptions[subscriptionIndex],
    ...data,
    status: 'active',
    updatedAt: new Date(),
  };

  return subscriptions[subscriptionIndex];
}

export async function deleteSubscription(id: number): Promise<boolean> {
  if (!id) throw new Error('Subscription ID is required');
  const subscriptionIndex = subscriptions.findIndex(subscription => subscription.id === id);
  if (subscriptionIndex === -1) return false;

  subscriptions.splice(subscriptionIndex, 1);
  return true;
} 