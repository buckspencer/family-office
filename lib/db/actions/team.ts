'use server';

import { TeamDataWithMembers } from '@/lib/db/schema';

// Temporary mock data until we implement the database
const mockTeamData: TeamDataWithMembers = {
  id: 1,
  name: 'My Family',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  stripeProductId: null,
  planName: 'Plus',
  subscriptionStatus: 'active',
  teamMembers: [
    {
      id: 1,
      role: 'owner',
      teamId: 1,
      userId: '1',
      joinedAt: new Date('2024-01-01'),
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
      },
    },
    {
      id: 2,
      role: 'member',
      teamId: 1,
      userId: '2',
      joinedAt: new Date('2024-01-02'),
      user: {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
      },
    },
  ],
};

type ActionResponse<T> = {
  data?: T;
  error?: string;
};

export async function getTeamData(): Promise<ActionResponse<TeamDataWithMembers>> {
  try {
    // This will be replaced with actual database query
    return { data: mockTeamData };
  } catch (error) {
    console.error('Error fetching team data:', error);
    return { error: 'Failed to fetch team data' };
  }
} 