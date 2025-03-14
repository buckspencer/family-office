export type SubscriptionType = 'service' | 'membership' | 'subscription' | 'other';

export type BillingFrequency = 'monthly' | 'quarterly' | 'yearly' | 'one-time';

export type SubscriptionStatus = 'active' | 'cancelled' | 'pending' | 'failed';

export interface DbSubscription {
  id: number;
  name: string;
  type: SubscriptionType;
  description: string;
  amount: string;
  billingFrequency: BillingFrequency;
  startDate: Date;
  endDate: Date | null;
  autoRenew: boolean | null;
  category: string | null;
  notes: string | null;
  paymentMethod: string | null;
  lastBilled: Date | null;
  nextBilling: Date | null;
  status: SubscriptionStatus;
  isArchived: boolean | null;
  tags: string[] | null;
  metadata: unknown | null;
  teamId: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription extends Omit<DbSubscription, 'amount'> {
  amount: number;
}

export interface SubscriptionCreate extends Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'> {}

export interface SubscriptionUpdate {
  name?: string;
  type?: SubscriptionType;
  description?: string;
  amount?: number;
  billingFrequency?: BillingFrequency;
  startDate?: Date;
  endDate?: Date | null;
  autoRenew?: boolean;
  category?: string;
  notes?: string;
  paymentMethod?: string;
  lastBilled?: Date;
  nextBilling?: Date;
  status?: SubscriptionStatus;
  isArchived?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
  teamId?: number;
  userId?: string;
} 