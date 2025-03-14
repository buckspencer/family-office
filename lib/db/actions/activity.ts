import { desc, eq } from 'drizzle-orm';
import { db } from '../drizzle';
import { activityLogs, users } from '../schema';
import { getUser } from './users';

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function createActivityLog({
  teamId,
  userId,
  action,
}: {
  teamId: number;
  userId: string;
  action: string;
}) {
  try {
    await db.insert(activityLogs).values({
      teamId,
      userId,
      action,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error creating activity log:', error);
    // We don't throw here as activity logging should not break the main flow
  }
} 