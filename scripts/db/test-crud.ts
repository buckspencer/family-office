import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testCRUD() {
  try {
    if (!process.env.POSTGRES_URL) {
      throw new Error('POSTGRES_URL environment variable is not set');
    }

    // Create a connection to the database
    const client = postgres(process.env.POSTGRES_URL);
    const db = drizzle(client);
    
    console.log('Testing CRUD operations on documents table...');
    
    // CREATE - Insert a test document
    console.log('\n1. Creating a test document...');
    const insertResult = await db.execute(sql`
      INSERT INTO documents (
        name, 
        category, 
        file_url, 
        team_id, 
        user_id, 
        created_at, 
        updated_at
      ) 
      VALUES (
        'Test Document', 
        'test', 
        'https://example.com/test.pdf', 
        1, 
        1, 
        CURRENT_TIMESTAMP, 
        CURRENT_TIMESTAMP
      )
      RETURNING id, name, category;
    `);
    
    console.log('Insert result:', insertResult);
    
    if (insertResult.length === 0) {
      throw new Error('Failed to insert test document');
    }
    
    const documentId = insertResult[0].id;
    
    // READ - Get the document by ID
    console.log(`\n2. Reading document with ID ${documentId}...`);
    const readResult = await db.execute(sql`
      SELECT * FROM documents WHERE id = ${documentId};
    `);
    
    console.log('Read result:', readResult);
    
    // UPDATE - Update the document
    console.log(`\n3. Updating document with ID ${documentId}...`);
    const updateResult = await db.execute(sql`
      UPDATE documents 
      SET name = 'Updated Test Document', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${documentId}
      RETURNING id, name, category;
    `);
    
    console.log('Update result:', updateResult);
    
    // DELETE - Delete the document
    console.log(`\n4. Deleting document with ID ${documentId}...`);
    const deleteResult = await db.execute(sql`
      DELETE FROM documents WHERE id = ${documentId}
      RETURNING id;
    `);
    
    console.log('Delete result:', deleteResult);
    
    console.log('\nCRUD operations completed successfully!');
    
    // Close the connection
    await client.end();
  } catch (error) {
    console.error('Error testing CRUD operations:', error);
  } finally {
    process.exit(0);
  }
}

testCRUD(); 