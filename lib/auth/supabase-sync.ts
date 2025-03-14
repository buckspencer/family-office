import { db } from '@/lib/db';
import { users, teams, teamMembers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createServerClient } from '@/lib/supabase-server';
import { User } from '@supabase/supabase-js';

/**
 * TODO: Implement a Supabase webhook handler to ensure team creation happens automatically on user creation
 * This would provide a more robust solution than relying on client-side or manual synchronization.
 * Steps to implement:
 * 1. Create a webhook route at app/api/auth/webhook/route.ts
 * 2. Configure Supabase to send auth events to this webhook
 * 3. Handle user creation events in the webhook to create teams
 * 4. Update this sync function to work with the webhook
 */

/**
 * Sync a Supabase Auth user with our database user
 * This should be called whenever a user signs up or updates their profile
 */
export async function syncUserWithDatabase(supabaseUser: User): Promise<void> {
  try {
    // Check if user already exists in our database
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.id, supabaseUser.id))
      .limit(1);
    
    const userExists = existingUsers.length > 0;
    
    if (userExists) {
      // Update existing user
      await db
        .update(users)
        .set({
          email: supabaseUser.email || '',
          name: supabaseUser.user_metadata?.name || (supabaseUser.email ? supabaseUser.email.split('@')[0] : ''),
          updatedAt: new Date(),
        })
        .where(eq(users.id, supabaseUser.id));
    } else {
      // Create new user
      await db.insert(users).values({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.name || (supabaseUser.email ? supabaseUser.email.split('@')[0] : ''),
        role: 'member',
      });
      
      // Create a default team for the user
      const userName = supabaseUser.user_metadata?.name || (supabaseUser.email ? supabaseUser.email.split('@')[0] : 'New User');
      const [team] = await db.insert(teams).values({
        name: `${userName}'s Team`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      
      // Add the user to the team as an admin
      if (team) {
        await db.insert(teamMembers).values({
          userId: supabaseUser.id,
          teamId: team.id,
          role: 'admin',
          joinedAt: new Date(),
        });
        
        // Update user metadata with teamId
        await createServerClient().then(client => 
          client.auth.updateUser({
            data: { teamId: team.id }
          })
        );
      }
    }
  } catch (error) {
    console.error('Error syncing user with database:', error);
    throw error;
  }
}

/**
 * Get a user from the database by their Supabase Auth ID
 */
export async function getUserFromDatabase(supabaseUserId: string) {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, supabaseUserId))
      .limit(1);
    
    return user || null;
  } catch (error) {
    console.error('Error getting user from database:', error);
    return null;
  }
}

/**
 * Get the current authenticated user from Supabase Auth and sync with database
 */
export async function getCurrentUser() {
  try {
    // Get the Supabase Auth user
    const serverClient = await createServerClient();
    const { data: { user: supabaseUser }, error } = await serverClient.auth.getUser();
    
    if (error || !supabaseUser) {
      return null;
    }
    
    // Sync with database
    await syncUserWithDatabase(supabaseUser);
    
    // Get the database user
    const dbUser = await getUserFromDatabase(supabaseUser.id);
    
    // Get the user's team
    let teamId = supabaseUser.user_metadata?.teamId;
    
    if (!teamId) {
      // Look up team membership
      const membershipResults = await db
        .select({ teamId: teamMembers.teamId })
        .from(teamMembers)
        .where(eq(teamMembers.userId, supabaseUser.id))
        .limit(1);
      
      if (membershipResults.length > 0) {
        teamId = membershipResults[0].teamId;
        
        // Update user metadata with teamId for future use
        await serverClient.auth.updateUser({
          data: { teamId }
        });
      }
    }
    
    // Combine Supabase Auth user and database user
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: dbUser?.name || supabaseUser.user_metadata?.name || (supabaseUser.email ? supabaseUser.email.split('@')[0] : ''),
      role: dbUser?.role || 'member',
      teamId: teamId ? parseInt(teamId.toString(), 10) : undefined,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
} 