import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function migrateToUuid() {
  try {
    if (!process.env.POSTGRES_URL) {
      throw new Error('POSTGRES_URL environment variable is not set');
    }

    // Create a connection to the database
    const client = postgres(process.env.POSTGRES_URL);
    const db = drizzle(client);
    
    console.log('Starting UUID migration...');
    
    // Step 1: Add UUID extension
    console.log('Adding UUID extension...');
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    
    // Step 2: Create a temporary mapping table to store old IDs to new UUIDs
    console.log('Creating ID mapping table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS id_mapping (
        old_id INTEGER PRIMARY KEY,
        new_id UUID NOT NULL DEFAULT uuid_generate_v4()
      )
    `);
    
    // Step 3: Populate the mapping table with all user IDs
    console.log('Populating ID mapping table...');
    await db.execute(sql`
      INSERT INTO id_mapping (old_id)
      SELECT id FROM users
      ON CONFLICT DO NOTHING
    `);
    
    // Step 4: Create a new users table with UUID
    console.log('Creating new users table...');
    await db.execute(sql`
      CREATE TABLE users_new (
        id UUID PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'member',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMP
      )
    `);
    
    // Step 5: Migrate data from old users table to new one
    console.log('Migrating user data...');
    await db.execute(sql`
      INSERT INTO users_new (id, name, email, password_hash, role, created_at, updated_at, deleted_at)
      SELECT m.new_id, u.name, u.email, u.password_hash, u.role, u.created_at, u.updated_at, u.deleted_at
      FROM users u
      JOIN id_mapping m ON u.id = m.old_id
    `);
    
    // Step 6: Update foreign keys in related tables
    const tables = [
      { name: 'team_members', column: 'user_id' },
      { name: 'activity_logs', column: 'user_id' },
      { name: 'invitations', column: 'invited_by' },
      { name: 'documents', column: 'user_id' },
      { name: 'contacts', column: 'user_id' },
      { name: 'events', column: 'user_id' },
      { name: 'subscriptions', column: 'user_id' },
      { name: 'assets', column: 'user_id' },
      { name: 'attachments', column: 'user_id' }
    ];
    
    for (const table of tables) {
      console.log(`Adding UUID column to ${table.name}...`);
      
      // Add a new UUID column
      await db.execute(sql`
        ALTER TABLE ${sql.identifier(table.name)} 
        ADD COLUMN ${sql.identifier(table.column + '_new')} UUID
      `);
      
      // Update the new column with mapped UUIDs
      console.log(`Updating ${table.name} with new UUIDs...`);
      await db.execute(sql`
        UPDATE ${sql.identifier(table.name)} t
        SET ${sql.identifier(table.column + '_new')} = m.new_id
        FROM id_mapping m
        WHERE t.${sql.identifier(table.column)} = m.old_id
      `);
    }
    
    // Step 7: Rename tables and columns (this is a critical step, so we'll do it in a transaction)
    console.log('Finalizing migration (renaming tables and columns)...');
    await db.execute(sql`BEGIN`);
    
    try {
      // Rename the users table
      await db.execute(sql`ALTER TABLE users RENAME TO users_old`);
      await db.execute(sql`ALTER TABLE users_new RENAME TO users`);
      
      // Update foreign key columns in related tables
      for (const table of tables) {
        await db.execute(sql`
          ALTER TABLE ${sql.identifier(table.name)} 
          DROP COLUMN ${sql.identifier(table.column)},
          RENAME COLUMN ${sql.identifier(table.column + '_new')} TO ${sql.identifier(table.column)}
        `);
        
        // Add NOT NULL constraint if needed
        if (table.name !== 'activity_logs') { // activity_logs.user_id can be null
          await db.execute(sql`
            ALTER TABLE ${sql.identifier(table.name)} 
            ALTER COLUMN ${sql.identifier(table.column)} SET NOT NULL
          `);
        }
      }
      
      await db.execute(sql`COMMIT`);
    } catch (error) {
      await db.execute(sql`ROLLBACK`);
      throw error;
    }
    
    console.log('Migration completed successfully!');
    
    // Close the connection
    await client.end();
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    process.exit(0);
  }
}

migrateToUuid(); 