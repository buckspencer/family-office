import fs from 'fs';
import path from 'path';
import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get database connection string from environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Connection for migrations
const migrationClient = postgres(connectionString, { max: 1 });

async function applyMigration() {
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'lib', 'db', 'migrations', '0003_add_assets_and_attachments.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('Applying migration...');

    // Split the migration into individual statements
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim().length > 0);

    // Execute each statement
    for (const statement of statements) {
      try {
        await migrationClient.unsafe(statement);
      } catch (error) {
        console.error('Error executing statement:', statement);
        throw error;
      }
    }

    console.log('Migration applied successfully');

    // Update the drizzle metadata
    await migrationClient.unsafe(`
      INSERT INTO "drizzle"."__drizzle_migrations" (id, hash, created_at)
      VALUES ('0003_add_assets_and_attachments', 'add_assets_and_attachments', NOW())
    `);

    console.log('Migration metadata updated');
  } catch (error) {
    console.error('Error applying migration:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await migrationClient.end();
  }
}

// Run the migration
applyMigration(); 