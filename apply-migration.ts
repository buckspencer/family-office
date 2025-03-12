import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

async function applyMigration() {
  try {
    if (!process.env.POSTGRES_URL) {
      throw new Error('POSTGRES_URL environment variable is not set');
    }

    // Create a connection to the database
    const client = postgres(process.env.POSTGRES_URL);
    const db = drizzle(client);
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'lib', 'db', 'migrations', '0002_add_resource_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Applying migration...');
    
    // Split the SQL into statements
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim().length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      try {
        await db.execute(sql.raw(statement + ';'));
        console.log('Statement executed successfully');
      } catch (error) {
        console.error('Error executing statement:', error);
        console.error('Statement:', statement);
      }
    }
    
    console.log('Migration applied successfully');
    
    // Verify tables were created
    const result = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    const tables = result.map((row: any) => row.table_name);
    console.log('Tables in the database:');
    console.log(tables);
    
    // Close the connection
    await client.end();
  } catch (error) {
    console.error('Error applying migration:', error);
  } finally {
    process.exit(0);
  }
}

applyMigration(); 