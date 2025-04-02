import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { MCPConfig, defaultConfig } from '@/lib/mcp/config';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { query, params = [], config = defaultConfig } = await req.json();

    // Validate query
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Invalid query provided' },
        { status: 400 }
      );
    }

    // Execute query with safety checks
    const result = await executeQuery(query, params, config);

    return NextResponse.json({ result });
  } catch (error) {
    console.error('MCP Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}

async function executeQuery(query: string, params: any[], config: MCPConfig) {
  // Check if query is safe
  if (!isQuerySafe(query, config)) {
    throw new Error('Query contains unsafe operations');
  }

  // Execute query
  const { data, error } = await supabase.rpc('execute_sql', {
    query,
    params
  });

  if (error) throw error;
  return data;
}

function isQuerySafe(query: string, config: MCPConfig): boolean {
  // Check query length
  if (query.length > config.safety.maxQueryLength) {
    return false;
  }

  // Check for blocked patterns
  for (const pattern of config.safety.blockedPatterns) {
    if (query.toLowerCase().includes(pattern.toLowerCase())) {
      return false;
    }
  }

  // Check for allowed operations
  const operation = query.trim().split(/\s+/)[0].toUpperCase();
  if (!config.safety.allowedOperations.includes(operation)) {
    return false;
  }

  return true;
} 