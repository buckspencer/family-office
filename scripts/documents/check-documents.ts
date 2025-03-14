import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

async function checkDocuments() {
  try {
    // Check if POSTGRES_URL is defined
    if (!process.env.POSTGRES_URL) {
      console.error('POSTGRES_URL environment variable is not defined');
      process.exit(1);
    }

    // Connect to the database
    const client = postgres(process.env.POSTGRES_URL);
    const db = drizzle(client);

    // Query the documents table
    const documents = await db.execute(sql`SELECT * FROM documents`);

    console.log('Documents in the database:');
    console.log(JSON.stringify(documents, null, 2));
    console.log(`Total documents: ${documents.length}`);

    // Close the connection
    await client.end();
  } catch (error) {
    console.error('Error checking documents:', error);
  }
}

// Import sql from drizzle-orm
import { sql } from 'drizzle-orm';

checkDocuments(); 