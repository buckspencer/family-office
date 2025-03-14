import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function resetDatabaseWithUuid() {
  try {
    if (!process.env.POSTGRES_URL) {
      throw new Error('POSTGRES_URL environment variable is not set');
    }

    // Create a connection to the database
    const client = postgres(process.env.POSTGRES_URL);
    const db = drizzle(client);
    
    console.log('Starting database reset with UUID schema...');
    
    // Step 1: Drop all tables (in reverse order of creation to handle foreign keys)
    console.log('Dropping all tables...');
    
    const tables = [
      'attachments',
      'assets',
      'subscriptions',
      'events',
      'contacts',
      'documents',
      'activity_logs',
      'invitations',
      'team_members',
      'teams',
      'users'
    ];
    
    for (const table of tables) {
      console.log(`Dropping table ${table}...`);
      await db.execute(sql`DROP TABLE IF EXISTS ${sql.identifier(table)} CASCADE`);
    }
    
    // Step 2: Add UUID extension
    console.log('Adding UUID extension...');
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    
    // Step 3: Run the Drizzle migrations to recreate the schema
    console.log('Database tables dropped. Now run the following command to recreate the schema:');
    console.log('npx drizzle-kit push');
    
    // Close the connection
    await client.end();
    
    console.log('Database reset completed successfully!');
  } catch (error) {
    console.error('Error during database reset:', error);
  } finally {
    process.exit(0);
  }
}

resetDatabaseWithUuid(); 