import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../schema';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { env } from '@/lib/env';

// Create a test client
const client = postgres(env.POSTGRES_URL);
export const db = drizzle(client, { schema });

// Setup function to run before tests
export async function setupTestDatabase() {
  try {
    // Run migrations
    await migrate(db, { migrationsFolder: 'lib/db/migrations' });
    
    // Clear all tables
    await clearDatabase();
    
    console.log('Test database setup complete');
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
}

// Helper to clear all tables
export async function clearDatabase() {
  const tables = Object.values(schema)
    .filter((table) => 'name' in table)
    .map((table) => table.name);

  for (const table of tables) {
    await db.execute(postgres.sql`TRUNCATE TABLE ${postgres.identifier(table)} CASCADE;`);
  }
}

// Helper to create test data
export async function createTestUser(data: Partial<typeof schema.users.$inferInsert> = {}) {
  const defaultData = {
    email: 'test@example.com',
    name: 'Test User',
    role: 'member',
    ...data,
  };

  const [user] = await db.insert(schema.users).values(defaultData).returning();
  return user;
}

export async function createTestTeam(data: Partial<typeof schema.teams.$inferInsert> = {}) {
  const defaultData = {
    name: 'Test Team',
    description: 'Test Team Description',
    ...data,
  };

  const [team] = await db.insert(schema.teams).values(defaultData).returning();
  return team;
}

export async function createTestTeamMember(
  data: Partial<typeof schema.teamMembers.$inferInsert> = {}
) {
  const user = await createTestUser();
  const team = await createTestTeam();

  const defaultData = {
    teamId: team.id,
    userId: user.id,
    role: 'member',
    ...data,
  };

  const [teamMember] = await db.insert(schema.teamMembers).values(defaultData).returning();
  return { teamMember, user, team };
}

// Cleanup function to run after tests
export async function cleanupTestDatabase() {
  await clearDatabase();
  await client.end();
} 