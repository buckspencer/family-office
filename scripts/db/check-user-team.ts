import { db } from '@/lib/db';
import { users, teams, teamMembers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createServerClient } from '@/lib/supabase-server';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function checkUserTeam() {
  try {
    // Get the current user
    const serverClient = await createServerClient();
    const { data: { user }, error } = await serverClient.auth.getUser();
    
    if (error || !user) {
      console.error('Error getting user:', error);
      console.log('No authenticated user found. Please sign in first.');
      return;
    }
    
    console.log('Current user:', {
      id: user.id,
      email: user.email,
      metadata: user.user_metadata
    });
    
    // Check if user exists in database
    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);
    
    if (dbUser.length === 0) {
      console.log('User does not exist in database. Creating user and team...');
      
      // Create user
      await db.insert(users).values({
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || (user.email ? user.email.split('@')[0] : ''),
        role: 'member',
      });
      
      // Create team
      const userName = user.user_metadata?.name || (user.email ? user.email.split('@')[0] : 'New User');
      const [team] = await db.insert(teams).values({
        name: `${userName}'s Team`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      
      // Add user to team
      await db.insert(teamMembers).values({
        userId: user.id,
        teamId: team.id,
        role: 'admin',
        joinedAt: new Date(),
      });
      
      // Update user metadata
      await serverClient.auth.updateUser({
        data: { teamId: team.id }
      });
      
      console.log('User and team created successfully:', {
        userId: user.id,
        teamId: team.id
      });
    } else {
      console.log('User exists in database:', dbUser[0]);
      
      // Check if user has a team
      const userTeams = await db
        .select({
          team: teams,
          role: teamMembers.role
        })
        .from(teamMembers)
        .innerJoin(teams, eq(teamMembers.teamId, teams.id))
        .where(eq(teamMembers.userId, user.id));
      
      if (userTeams.length === 0) {
        console.log('User does not have a team. Creating team...');
        
        // Create team
        const userName = user.user_metadata?.name || (user.email ? user.email.split('@')[0] : 'New User');
        const [team] = await db.insert(teams).values({
          name: `${userName}'s Team`,
          createdAt: new Date(),
          updatedAt: new Date(),
        }).returning();
        
        // Add user to team
        await db.insert(teamMembers).values({
          userId: user.id,
          teamId: team.id,
          role: 'admin',
          joinedAt: new Date(),
        });
        
        // Update user metadata
        await serverClient.auth.updateUser({
          data: { teamId: team.id }
        });
        
        console.log('Team created successfully:', {
          teamId: team.id
        });
      } else {
        console.log('User teams:', userTeams);
        
        // Check if teamId is in user metadata
        if (!user.user_metadata?.teamId) {
          console.log('TeamId not in user metadata. Updating...');
          
          // Update user metadata
          await serverClient.auth.updateUser({
            data: { teamId: userTeams[0].team.id }
          });
          
          console.log('User metadata updated with teamId:', userTeams[0].team.id);
        }
      }
    }
  } catch (error) {
    console.error('Error checking user team:', error);
  } finally {
    process.exit(0);
  }
}

checkUserTeam(); 