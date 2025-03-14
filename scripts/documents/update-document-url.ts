import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

async function updateDocumentUrl() {
  try {
    // Check if POSTGRES_URL is defined
    if (!process.env.POSTGRES_URL) {
      console.error('POSTGRES_URL environment variable is not defined');
      process.exit(1);
    }

    // Connect to the database
    const client = postgres(process.env.POSTGRES_URL);
    const db = drizzle(client);

    // Update the document URL
    const result = await db.execute(sql`
      UPDATE documents
      SET file_url = 'https://example.com/placeholder.pdf'
      WHERE file_url LIKE 'blob:%'
      RETURNING id, name, file_url
    `);

    console.log('Updated documents:');
    console.log(JSON.stringify(result, null, 2));
    console.log(`Total documents updated: ${result.length}`);

    // Close the connection
    await client.end();
  } catch (error) {
    console.error('Error updating document URL:', error);
  }
}

updateDocumentUrl(); 