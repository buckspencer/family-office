import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkTableStructure() {
  try {
    if (!process.env.POSTGRES_URL) {
      throw new Error('POSTGRES_URL environment variable is not set');
    }

    // Create a connection to the database
    const client = postgres(process.env.POSTGRES_URL);
    const db = drizzle(client);
    
    // Tables to check
    const tables = ['documents', 'contacts', 'events', 'subscriptions'];
    
    for (const table of tables) {
      console.log(`\nColumns for table ${table}:`);
      
      const result = await db.execute(sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = ${table}
        ORDER BY ordinal_position;
      `);
      
      console.table(result);
    }
    
    // Close the connection
    await client.end();
  } catch (error) {
    console.error('Error checking table structure:', error);
  } finally {
    process.exit(0);
  }
}

checkTableStructure(); 