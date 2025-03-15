import { desc, eq } from 'drizzle-orm';
import { db } from '../drizzle';
import { activityLogs, users, type ActivityType } from '../schema';
import { getSession } from '@/lib/auth/session';

/**
 * Get recent activity logs for the current user
 */
export async function getActivityLogs(limit = 10) {
  try {
    const session = await getSession();
    if (!session) {
      console.warn('User not authenticated, returning empty activity logs');
      return [];
    }

    return await db
      .select({
        id: activityLogs.id,
        action: activityLogs.action,
        timestamp: activityLogs.timestamp,
        ipAddress: activityLogs.ipAddress,
        metadata: activityLogs.metadata,
        userName: users.name,
      })
      .from(activityLogs)
      .leftJoin(users, eq(activityLogs.userId, users.id))
      .where(eq(activityLogs.userId, session.user.id))
      .orderBy(desc(activityLogs.timestamp))
      .limit(limit);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return [];
  }
}

/**
 * Log a user activity
 */
export async function logActivity({
  action,
  userId,
  teamId,
  metadata = {},
}: {
  action: ActivityType;
  userId: string;
  teamId: number;
  metadata?: Record<string, any>;
}) {
  try {
    await db.insert(activityLogs).values({
      action,
      userId,
      teamId,
      timestamp: new Date(),
      ipAddress: 'server-side',
      metadata: metadata as any
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw the error to prevent disrupting the main flow
  }
}

/**
 * Utility function to wrap database operations with activity logging
 * This is the original implementation for backward compatibility
 */
export async function withActivityLog<T>({
  action,
  userId,
  teamId,
  resourceType,
  resourceId,
  operation,
  metadata = {},
}: {
  action: ActivityType;
  userId: string;
  teamId: number;
  resourceType: string;
  resourceId?: number | string;
  operation: () => Promise<T>;
  metadata?: Record<string, any>;
}): Promise<T> {
  try {
    // Execute the database operation
    const result = await operation();

    // Log the activity
    await logActivity({
      action,
      userId,
      teamId,
      metadata: {
        ...metadata,
        resourceType,
        resourceId,
        success: true,
        timestamp: new Date().toISOString()
      }
    });

    return result;
  } catch (error) {
    // Log the failed activity
    await logActivity({
      action,
      userId,
      teamId,
      metadata: {
        ...metadata,
        resourceType,
        resourceId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    });
    throw error;
  }
}

/**
 * Create a new activity logger with a simpler API
 * This can be used for new code
 */
export function createActivityLogger<T>(
  actionName: ActivityType,
  options?: {
    resourceType?: string;
    getResourceId?: (result: T) => number | string | undefined;
  }
) {
  return async function(operation: () => Promise<T>): Promise<T> {
    const session = await getSession();
    if (!session) {
      throw new Error('Unauthorized');
    }
    
    const userId = session.user.id;
    const teamId = session.user.teamId || 0;
    const resourceType = options?.resourceType || '';
    
    return withActivityLog({
      action: actionName,
      userId,
      teamId,
      resourceType,
      operation,
      metadata: {}
    });
  };
} 