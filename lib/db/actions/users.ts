import { desc, and, eq, isNull } from 'drizzle-orm';
import { db } from '../drizzle';
import { users, teamMembers } from '../schema';
import { createServerClient } from '@/lib/supabase-server';
import { getUserFromDatabase } from '@/lib/auth/supabase-sync';

/**
 * Get the current authenticated user from the database
 * This uses Supabase Auth for authentication and retrieves the corresponding database user
 */
export async function getUser() {
  try {
    // Get the Supabase Auth user
    const serverClient = await createServerClient();
    const { data: { user: supabaseUser }, error } = await serverClient.auth.getUser();
    
    if (error || !supabaseUser) {
      return null;
    }
    
    // Get the corresponding database user
    const dbUser = await getUserFromDatabase(supabaseUser.id);
    return dbUser;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

/**
 * Get a user with their team information
 * @param userId The UUID of the user
 */
export async function getUserWithTeam(userId: string) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId,
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
} 