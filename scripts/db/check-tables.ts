import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkTables() {
  try {
    if (!process.env.POSTGRES_URL) {
      throw new Error('POSTGRES_URL environment variable is not set');
    }

    // Create a connection to the database
    const client = postgres(process.env.POSTGRES_URL);
    const db = drizzle(client);
    
    // Query to list all tables in the public schema
    const result = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    // Convert the result to an array of table names
    const tables = result.map((row: any) => row.table_name);
    
    console.log('Tables in the database:');
    console.log(tables);
    
    // Check if specific tables exist
    const resourceTables = ['documents', 'contacts', 'events', 'subscriptions'];
    for (const table of resourceTables) {
      const exists = tables.includes(table);
      console.log(`Table ${table} exists: ${exists}`);
    }

    // Close the connection
    await client.end();
  } catch (error) {
    console.error('Error checking tables:', error);
  } finally {
    process.exit(0);
  }
}

checkTables(); 