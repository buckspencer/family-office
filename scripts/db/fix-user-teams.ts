import { users, teams, teamMembers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function fixUserTeams() {
  try {
    console.log('Starting to fix user teams...');
    
    // Check if POSTGRES_URL is set
    if (!process.env.POSTGRES_URL) {
      throw new Error('POSTGRES_URL environment variable is not set');
    }
    
    // Create a connection to the database
    const client = postgres(process.env.POSTGRES_URL);
    const db = drizzle(client);
    
    // Get all users
    const allUsers = await db.select().from(users);
    console.log(`Found ${allUsers.length} users in the database`);
    
    for (const user of allUsers) {
      console.log(`Processing user: ${user.email} (${user.id})`);
      
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
        console.log(`User ${user.email} does not have a team. Creating team...`);
        
        // Create team
        const userName = user.name || user.email.split('@')[0];
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
        
        console.log(`Team created successfully for user ${user.email}: Team ID ${team.id}`);
      } else {
        console.log(`User ${user.email} already has ${userTeams.length} teams:`);
        userTeams.forEach((membership, index) => {
          console.log(`  ${index + 1}. Team: ${membership.team.name} (${membership.team.id}), Role: ${membership.role}`);
        });
      }
    }
    
    // Close the connection
    await client.end();
    
    console.log('Finished fixing user teams');
  } catch (error) {
    console.error('Error fixing user teams:', error);
  }
}

// Run the function
fixUserTeams().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
}); 