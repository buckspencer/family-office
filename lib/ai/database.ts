import { db } from '@/lib/db/drizzle';
import { sql } from 'drizzle-orm';

export async function executeDatabaseQuery(query: string, params: any[] = []): Promise<any> {
  try {
    return await db.execute(sql.raw(query));
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export function formatQueryResults(results: any[]): string {
  if (!results.length) {
    return 'No results found.';
  }

  const columns = Object.keys(results[0]);
  const rows = results.map(row => 
    columns.map(col => row[col]).join('\t')
  );

  return [
    columns.join('\t'),
    ...rows
  ].join('\n');
} 