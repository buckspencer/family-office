import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { sql } from 'drizzle-orm';
import { ConversationContext } from './context';
import crypto from 'crypto';

export const DatabaseQuerySchema = z.object({
  query: z.string(),
  params: z.array(z.any()).optional(),
  description: z.string(),
  requiresConfirmation: z.boolean().default(true),
  queryHash: z.string().optional()
});

export type DatabaseQuery = z.infer<typeof DatabaseQuerySchema>;

export class DatabaseQueryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseQueryError';
  }
}

// Query whitelist for allowed operations
const ALLOWED_OPERATIONS = [
  'SELECT',
  'INSERT',
  'UPDATE',
  'DELETE'
];

// Query blacklist for dangerous patterns
const DANGEROUS_PATTERNS = [
  /DROP\s+TABLE/i,
  /TRUNCATE\s+TABLE/i,
  /ALTER\s+TABLE/i,
  /CREATE\s+TABLE/i,
  /GRANT\s+/i,
  /REVOKE\s+/i,
  /UNION\s+ALL/i,
  /UNION\s+SELECT/i,
  /;\s*$/i,
  /--/i,
  /\/\*/i,
  /xp_cmdshell/i,
  /exec\s*\(/i,
  /eval\s*\(/i,
  /system\s*\(/i,
  /shell\s*\(/i
];

export function generateQueryHash(query: string, params: any[] = []): string {
  const queryString = query + JSON.stringify(params);
  return crypto.createHash('sha256').update(queryString).digest('hex');
}

function isQuerySafe(query: string): boolean {
  // Check for allowed operations
  const operation = query.trim().split(/\s+/)[0].toUpperCase();
  if (!ALLOWED_OPERATIONS.includes(operation)) {
    return false;
  }

  // Check for dangerous patterns
  return !DANGEROUS_PATTERNS.some(pattern => pattern.test(query));
}

function validateQueryParams(params: any[]): boolean {
  return params.every(param => {
    if (param === null || param === undefined) return true;
    if (typeof param === 'string') return param.length <= 1000;
    if (typeof param === 'number') return !isNaN(param) && isFinite(param);
    if (Array.isArray(param)) return param.length <= 100 && param.every(item => validateQueryParams([item]));
    return false;
  });
}

function enrichQueryWithContext(query: string, context: ConversationContext): string {
  // Add team_id filter if not present
  if (!query.toLowerCase().includes('team_id')) {
    const teamFilter = `AND team_id = '${context.teamId}'`;
    if (query.toLowerCase().includes('where')) {
      query = query.replace(/WHERE/i, `WHERE ${teamFilter}`);
    } else {
      query = query.replace(/FROM/i, `FROM WHERE ${teamFilter}`);
    }
  }

  // Add user filter if not present
  if (!query.toLowerCase().includes('created_by')) {
    const userFilter = `AND created_by = '${context.userId}'`;
    query = query.replace(/WHERE/i, `WHERE ${userFilter}`);
  }

  // Add soft delete filter if not present
  if (!query.toLowerCase().includes('deleted_at')) {
    const softDeleteFilter = 'AND deleted_at IS NULL';
    query = query.replace(/WHERE/i, `WHERE ${softDeleteFilter}`);
  }

  return query;
}

export async function executeDatabaseQuery(
  query: DatabaseQuery,
  context: ConversationContext
): Promise<any> {
  try {
    // Validate query safety
    if (!isQuerySafe(query.query)) {
      throw new DatabaseQueryError('Query contains potentially unsafe operations');
    }

    // Validate parameters
    if (query.params && !validateQueryParams(query.params)) {
      throw new DatabaseQueryError('Invalid query parameters');
    }

    // Generate and verify query hash
    const queryHash = generateQueryHash(query.query, query.params);
    if (query.queryHash && query.queryHash !== queryHash) {
      throw new DatabaseQueryError('Query hash mismatch');
    }

    // Add user context to query
    const enrichedQuery = enrichQueryWithContext(query.query, context);

    // Execute query with parameters
    const result = await db.execute(sql.raw(enrichedQuery));

    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw new DatabaseQueryError('Failed to execute database query');
  }
}

export async function validateQuery(query: DatabaseQuery): Promise<boolean> {
  try {
    // Parse query to check syntax
    await db.execute(sql.raw('EXPLAIN ' + query.query));
    
    // Validate query safety
    if (!isQuerySafe(query.query)) {
      return false;
    }

    // Validate parameters
    if (query.params && !validateQueryParams(query.params)) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Query validation error:', error);
    return false;
  }
}

export function formatQueryResults(results: any[]): string {
  if (!results.length) {
    return 'No results found.';
  }

  // Sanitize result values
  const sanitizedResults = results.map(row => {
    const sanitizedRow: Record<string, any> = {};
    for (const [key, value] of Object.entries(row)) {
      sanitizedRow[key] = typeof value === 'string' 
        ? value.replace(/[<>]/g, '') 
        : value;
    }
    return sanitizedRow;
  });

  const columns = Object.keys(sanitizedResults[0]);
  const rows = sanitizedResults.map(row => 
    columns.map(col => row[col]).join('\t')
  );

  return [
    columns.join('\t'),
    ...rows
  ].join('\n');
} 