import { ConversationContext } from './context';
import { ResourceAction } from '../resources/base/types';
import { logger } from './logger';

export function createPrompt(prompt: string, context: ConversationContext): string {
  // Format recent messages for the prompt
  const recentMessagesText = context.recentMessages && context.recentMessages.length > 0
    ? `\nRecent Conversation History:\n${context.recentMessages.map(msg =>
        `${msg.role === 'user' ? 'User' : 'Assistant'} (${new Date(msg.timestamp).toLocaleTimeString()}): ${msg.content}`
      ).join('\n')}`
    : '';

  // Format pending action if present
  const pendingActionText = context.pendingAction
    ? `\nPending Action: ${context.pendingAction.description || context.pendingAction.type}\nThis action requires confirmation from the user.`
    : '';

  return `You are an AI assistant for a family office management system. Your role is to help users manage their family's information, tasks, events, subscriptions, and memories.

Context:
${JSON.stringify({
  userId: context.userId,
  teamId: context.teamId,
  recentTasks: context.recentTasks,
  importantDates: context.importantDates,
  pendingAction: context.pendingAction ? {
    type: context.pendingAction.type,
    description: context.pendingAction.description,
    requiresConfirmation: context.pendingAction.requiresConfirmation,
    confirmed: context.pendingAction.confirmed
  } : null
}, null, 2)}
${recentMessagesText}${pendingActionText}

Available Database Tables and Columns (Note: Use snake_case for column names in SQL queries):
- family_tasks:
  - id (serial, primary key)
  - team_id (uuid, not null)
  - title (varchar(255), not null)
  - description (text)
  - status (text, default 'pending', not null) - Valid values: 'pending', 'in_progress', 'completed', 'cancelled'
  - priority (text, default 'medium', not null) - Valid values: 'low', 'medium', 'high', 'urgent'
  - due_date (timestamp)
  - assigned_to (uuid, not null)
  - created_at (timestamp, default now(), not null)
  - updated_at (timestamp, default now(), not null)
  - deleted_at (timestamp)
  - created_by (uuid, not null)
  - updated_by (uuid)

- family_events:
  - id (serial, primary key)
  - team_id (uuid, not null)
  - title (varchar(255), not null)
  - description (text)
  - start_date (timestamp, not null)
  - end_date (timestamp, not null)
  - status (text, default 'scheduled', not null) - Valid values: 'scheduled', 'in_progress', 'completed', 'cancelled'
  - created_at (timestamp, default now(), not null)
  - updated_at (timestamp, default now(), not null)
  - deleted_at (timestamp)
  - created_by (uuid, not null)
  - updated_by (uuid)

- family_subscriptions:
  - id (serial, primary key)
  - team_id (uuid, not null)
  - name (varchar(255), not null)
  - url (text)
  - monthly_cost (numeric(10,2), not null)
  - description (text)
  - created_at (timestamp, default now(), not null)
  - updated_at (timestamp, default now(), not null)
  - deleted_at (timestamp)
  - created_by (uuid, not null)
  - updated_by (uuid)

- family_memories:
  - id (serial, primary key)
  - team_id (uuid, not null)
  - category (varchar(50), not null)
  - key (varchar(255), not null)
  - value (text, not null)
  - context (text)
  - last_accessed (timestamp, default now(), not null)
  - importance (integer, default 1, not null)
  - created_at (timestamp, default now(), not null)
  - updated_at (timestamp, default now(), not null)
  - deleted_at (timestamp)
  - created_by (uuid, not null)
  - updated_by (uuid)
  - metadata (jsonb)

IMPORTANT INSTRUCTIONS FOR GENERATING SQL:

1. ALWAYS use parameterized queries with $1, $2, etc. for values to prevent SQL injection.
2. NEVER use string concatenation for user input.
3. For INSERT operations, always include team_id and created_by fields.
4. For UPDATE operations, always include updated_by field.
5. For SELECT operations, always filter by team_id to ensure data isolation.
6. Use ISO format for dates (YYYY-MM-DD).
7. For tasks, valid status values are: 'pending', 'in_progress', 'completed', 'cancelled'.
8. For tasks, valid priority values are: 'low', 'medium', 'high', 'urgent'.
9. For events, valid status values are: 'scheduled', 'in_progress', 'completed', 'cancelled'.

EXAMPLES OF CORRECT SQL QUERIES:

1. Creating a task:
   INSERT INTO family_tasks (team_id, title, description, status, priority, due_date, assigned_to, created_by)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8)

2. Updating a task:
   UPDATE family_tasks
   SET title = $1, description = $2, status = $3, priority = $4, due_date = $5, updated_by = $6, updated_at = NOW()
   WHERE id = $7 AND team_id = $8

3. Fetching tasks:
   SELECT id, title, description, status, priority, due_date, assigned_to
   FROM family_tasks
   WHERE team_id = $1 AND deleted_at IS NULL
   ORDER BY due_date ASC

4. Creating a subscription:
   INSERT INTO family_subscriptions (team_id, name, url, monthly_cost, description, created_by)
   VALUES ($1, $2, $3, $4, $5, $6)

When a user requests information or data, you should:
1. Generate a response with a db_action that executes the appropriate SQL query
2. Format the response like this:
   {
     "message": "Here's what I found",
     "db_action": {
       "type": "execute_sql",
       "data": {
         "query": "SELECT * FROM family_tasks WHERE team_id = $1 AND deleted_at IS NULL",
         "params": ["team-id-value"]
       },
       "metadata": {
         "requires_confirmation": false,
         "action": "fetch_data"
       }
     }
   }

When a user requests to create or modify data, you should:
1. Generate a response with a db_action that executes the appropriate SQL query
2. Format the response like this:
   {
     "message": "I'll help you with that!",
     "db_action": {
       "type": "execute_sql",
       "data": {
         "query": "INSERT INTO family_tasks (team_id, title, description, status, priority, due_date, assigned_to, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
         "params": ["team-id-value", "Task title", "Task description", "pending", "medium", "2023-12-31", "assigned-user-id", "creator-user-id"]
       },
       "metadata": {
         "requires_confirmation": true,
         "action": "modify_data"
       }
     }
   }

User Request: ${prompt}

A:`;
}

export function parseAIResponse(response: string): {
  message: string;
  db_action?: ResourceAction;
  tokensUsed?: number;
} {
  try {
    // First, try to extract JSON from markdown code blocks
    const jsonMatch = response.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      const jsonStr = jsonMatch[1].trim();
      try {
        const parsed = JSON.parse(jsonStr);
        return processJsonResponse(parsed);
      } catch (jsonError) {
        logger.warn('Failed to parse JSON from code block', { error: jsonError, content: jsonStr });
        // Continue to try other parsing methods
      }
    }

    // Next, try to find JSON-like content with curly braces
    const curlyBraceMatch = response.match(/\{[\s\S]*\}/);
    if (curlyBraceMatch) {
      try {
        const parsed = JSON.parse(curlyBraceMatch[0]);
        return processJsonResponse(parsed);
      } catch (jsonError) {
        logger.warn('Failed to parse JSON from curly braces', { error: jsonError, content: curlyBraceMatch[0] });
        // Continue to try other parsing methods
      }
    }

    // As a last resort, try to parse the entire response as JSON
    try {
      const parsed = JSON.parse(response);
      return processJsonResponse(parsed);
    } catch (jsonError) {
      // If all parsing attempts fail, return the raw response as a message
      const cleanResponse = cleanupResponse(response);
      return {
        message: cleanResponse || "I understand your request."
      };
    }
  } catch (error) {
    // If any unexpected error occurs during parsing
    logger.error('Error parsing AI response', { error });
    const cleanResponse = cleanupResponse(response);
    return {
      message: cleanResponse || "I understand your request."
    };
  }
}

// Helper function to process a successfully parsed JSON response
function processJsonResponse(parsed: any): {
  message: string;
  db_action?: ResourceAction;
  tokensUsed?: number;
} {
  // Ensure the response has a message
  if (!parsed.message && parsed.db_action) {
    parsed.message = "I'll process your request.";
  }

  // Ensure metadata is present for db_action
  if (parsed.db_action && !parsed.db_action.metadata) {
    parsed.db_action.metadata = {
      requires_confirmation: shouldRequireConfirmation(parsed.db_action),
      action: getActionType(parsed.db_action)
    };
  }

  // Validate and sanitize the db_action
  if (parsed.db_action) {
    validateDbAction(parsed.db_action);
  }

  return {
    message: parsed.message || "I understand your request.",
    db_action: parsed.db_action,
    tokensUsed: parsed.tokensUsed
  };
}

// Helper function to determine if an action should require confirmation
function shouldRequireConfirmation(dbAction: ResourceAction): boolean {
  if (!dbAction.data || !dbAction.data.query) {
    return true; // Require confirmation if we can't determine the query
  }

  const query = dbAction.data.query.toUpperCase();

  // Data modification operations should require confirmation
  if (query.startsWith('INSERT') ||
      query.startsWith('UPDATE') ||
      query.startsWith('DELETE')) {
    return true;
  }

  return false;
}

// Helper function to determine the action type
function getActionType(dbAction: ResourceAction): string {
  if (!dbAction.data || !dbAction.data.query) {
    return 'unknown';
  }

  const query = dbAction.data.query.toUpperCase();

  if (query.startsWith('SELECT')) {
    return 'fetch_data';
  } else if (query.startsWith('INSERT')) {
    return 'create_data';
  } else if (query.startsWith('UPDATE')) {
    return 'update_data';
  } else if (query.startsWith('DELETE')) {
    return 'delete_data';
  }

  return 'execute_sql';
}

// Helper function to validate a db_action
function validateDbAction(dbAction: ResourceAction): void {
  // Ensure the action has the required properties
  if (!dbAction.type) {
    dbAction.type = 'execute_sql';
  }

  if (!dbAction.data) {
    throw new Error('db_action is missing data property');
  }

  if (!dbAction.data.query) {
    throw new Error('db_action is missing query property');
  }

  // Ensure params is an array
  if (!dbAction.data.params) {
    dbAction.data.params = [];
  } else if (!Array.isArray(dbAction.data.params)) {
    throw new Error('db_action params must be an array');
  }
}

// Helper function to clean up response text
function cleanupResponse(response: string): string {
  // Remove markdown code block markers
  let cleaned = response.replace(/```(?:json)?\n?|\n?```/g, '');

  // Remove any JSON-like structures that might confuse the user
  cleaned = cleaned.replace(/\{[\s\S]*\}/g, '');

  // Trim whitespace and ensure there's some content
  cleaned = cleaned.trim();

  if (!cleaned) {
    return "I understand your request.";
  }

  return cleaned;
}
