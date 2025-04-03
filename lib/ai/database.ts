import { db } from '../db/drizzle';
import { isNull } from 'drizzle-orm';
import { familyTasks } from '../db/schema';

export async function executeDatabaseQuery(query: string, params: any[] = []): Promise<any> {
  try {
    // Using Drizzle's query builder instead of raw SQL
    const result = await db.query.familyTasks.findMany({
      where: isNull(familyTasks.deletedAt)
    });
    return { result };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export function formatQueryResults(results: any[]): Array<{
  title: string;
  dueDate: string | null;
  status: string;
}> {
  if (!results.length) {
    return [];
  }

  return results.map(row => ({
    title: row.title || '',
    dueDate: row.dueDate || null,
    status: row.status || 'pending'
  }));
} 