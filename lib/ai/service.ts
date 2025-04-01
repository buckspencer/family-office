'use server';

import { z } from 'zod';
import { AIResponse, DBAction, AIResponseSchema } from '@/lib/types/chat';
import { getSession } from '@/lib/auth/session';
import { 
  ConversationContextManager, 
  sanitizeUserInput, 
  validateUserInput,
  RateLimitError,
  IPRateLimiter
} from './context';
import { executeDatabaseQuery, validateQuery, generateQueryHash } from './database';
import { headers } from 'next/headers';

// Define database schema and business rules
const DB_SCHEMA = `
CREATE TABLE family_tasks (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  assigned_to UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TABLE family_subscriptions (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  url TEXT,
  monthly_cost DECIMAL(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TABLE family_events (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  status event_status NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL,
  deleted_at TIMESTAMP,
  created_by UUID NOT NULL,
  updated_by UUID,
  CONSTRAINT family_events_pkey PRIMARY KEY (id),
  CONSTRAINT family_events_team_id_teams_id_fk FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  CONSTRAINT family_events_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT family_events_updated_by_users_id_fk FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE family_documents (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TABLE family_memories (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL,
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  context TEXT,
  importance INTEGER NOT NULL DEFAULT 1,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  metadata JSONB
);
`;

const BUSINESS_RULES = `
1. All resources must have a team_id and created_by
2. Users can only access data for their team
3. Write operations require confirmation
4. Read operations are cached for 1 hour
5. All monetary values must be non-negative
6. Dates must be in ISO 8601 format
7. Priorities must be one of: high, medium, low
8. Statuses must be valid for their resource type
`;

const SYSTEM_PROMPT = `You are a helpful AI assistant for a family office management system. You have access to a PostgreSQL database with the following schema:

family_events:
  - id: serial (primary key)
  - team_id: integer (foreign key to teams.id)
  - title: varchar(255)
  - description: text
  - start_date: timestamp
  - end_date: timestamp
  - status: event_status enum ('scheduled', 'in_progress', 'completed', 'cancelled')
  - location: text
  - attendees: jsonb
  - created_at: timestamp
  - updated_at: timestamp
  - deleted_at: timestamp
  - created_by: uuid (foreign key to users.id)
  - updated_by: uuid (foreign key to users.id)

When creating reminders:
1. Use the family_events table
2. Set status='scheduled'
3. Set end_date to the same as start_date
4. Include team_id and created_by
5. Example query:
   INSERT INTO family_events (team_id, title, start_date, end_date, description, status, created_by) 
   VALUES ($1, $2, $3, $4, $5, $6, $7::uuid)

Database Schema:
${DB_SCHEMA}

Business Rules:
${BUSINESS_RULES}

When handling time-based requests (reminders, events, etc.):
1. Always use ISO 8601 format for dates (YYYY-MM-DDTHH:mm:ssZ)
2. Use the current date for "today" references
3. Set notification_required: true for time-sensitive items
4. Include timezone information in the response

For reminders specifically:
1. Use family_events table with status='scheduled'
2. Set requires_confirmation: true
3. Include notification settings in metadata
4. Use the user's ID for created_by
5. Set end_date to the same as start_date for reminders

Always:
1. Explain what you're doing
2. Use parameterized queries
3. Consider data consistency
4. Follow business rules
5. Request confirmation for writes

Example responses:

For creating a reminder:
{
  "system": {
    "db_action": {
      "operation": "WRITE",
      "table": "family_events",
      "query": "INSERT INTO family_events (team_id, title, start_date, end_date, description, status, created_by) VALUES ($1::uuid, $2, $3, $4, $5, $6, $7::uuid)",
      "params": [
        "2",
        "Take out the trash",
        "2024-04-01T16:00:00Z",
        "2024-04-01T16:00:00Z",
        "Reminder to take out the trash",
        "scheduled",
        "006f9bd4-b8af-448c-a976-5a91303fb30b"
      ],
      "metadata": {
        "requires_confirmation": true,
        "notification_required": true,
        "notification_settings": {
          "type": "reminder",
          "time": "16:00",
          "notify_before": 5
        }
      }
    }
  },
  "user": {
    "message": "I'll create a reminder for you to take out the trash at 4pm today. Would you like me to proceed?",
    "display_data": {
      "event_preview": {
        "title": "Take out the trash",
        "time": "4:00 PM",
        "type": "reminder"
      }
    }
  }
}

For querying upcoming reminders:
{
  "system": {
    "db_action": {
      "operation": "READ",
      "table": "family_events",
      "query": "SELECT * FROM family_events WHERE team_id = $1::uuid AND status = 'scheduled' AND start_date >= NOW() ORDER BY start_date ASC LIMIT 5",
      "params": ["2"],
      "metadata": {
        "cache_duration": "1m"
      }
    }
  },
  "user": {
    "message": "Here are your upcoming reminders:",
    "display_data": {
      "reminders": [
        {
          "title": "Take out the trash",
          "time": "4:00 PM",
          "type": "reminder"
        }
      ]
    }
  }
}`;

function cleanAIResponse(response: string): string {
  // Remove markdown code blocks and any text before/after the JSON
  const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
  
  // Find the JSON object
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No valid JSON object found in response');
  }
  
  let jsonStr = jsonMatch[0];
  
  // Remove SQL comments
  jsonStr = jsonStr.replace(/\s*--[^\n]*/g, '');
  
  // Clean up any trailing commas in arrays/objects
  jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
  
  // Replace newlines in message strings with spaces
  jsonStr = jsonStr.replace(/"message":\s*"([^"]*?)"/g, (match, message) => {
    const cleanedMessage = message.replace(/\n/g, ' ').replace(/\s+/g, ' ');
    return `"message": "${cleanedMessage}"`;
  });
  
  // Validate JSON before returning
  try {
    JSON.parse(jsonStr);
    return jsonStr;
  } catch (error) {
    console.error('Invalid JSON after cleaning:', jsonStr);
    throw new Error('Failed to parse cleaned JSON');
  }
}

export async function generateResponse(prompt: string, context?: string): Promise<AIResponse> {
  const MAX_RETRIES = 3;
  const BASE_DELAY = 1000; // 1 second
  let retries = 0;
  let lastError: Error | null = null;

  while (retries < MAX_RETRIES) {
    try {
      if (!process.env.DEEPSEEK_API_KEY) {
        throw new Error('Missing DEEPSEEK_API_KEY environment variable');
      }

      const session = await getSession();
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      // Get client IP for rate limiting
      const headersList = await headers();
      const ip = headersList.get('x-forwarded-for') || 'unknown';
      const ipRateLimiter = IPRateLimiter.getInstance();
      
      // Check IP rate limit
      if (!(await ipRateLimiter.checkIPLimit(ip))) {
        throw new RateLimitError('Too many requests from this IP address');
      }

      // Sanitize and validate user input
      const sanitizedPrompt = sanitizeUserInput(prompt);
      if (!validateUserInput(sanitizedPrompt)) {
        throw new Error('Invalid input');
      }

      // Get conversation context
      const contextManager = ConversationContextManager.getInstance();
      const conversationContext = await contextManager.getContext(
        session.user.id,
        context || '2' // Use provided context or default to team ID 2
      );

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `User ID: ${session.user.id}\nTeam ID: ${context || '2'}\n\n${sanitizedPrompt}` }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API request failed: ${response.statusText}. Details: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      const tokensUsed = data.usage?.total_tokens || 0;

      // Update conversation context with token usage
      await contextManager.updateContext(conversationContext, tokensUsed);

      console.log('Raw AI response:', aiResponse);

      const cleanedResponse = cleanAIResponse(aiResponse);
      console.log('Cleaned AI response:', cleanedResponse);

      const parsedResponse = JSON.parse(cleanedResponse);
      console.log('Parsed AI response:', parsedResponse);

      // Ensure the response has the required structure
      const validatedResponse = AIResponseSchema.parse(parsedResponse);

      // If the response includes a database action, validate and execute it
      if (validatedResponse.system?.db_action) {
        const dbAction = validatedResponse.system.db_action;
        
        // Validate query
        const isValid = await validateQuery({
          query: dbAction.query,
          description: dbAction.metadata?.description || 'Database operation',
          requiresConfirmation: dbAction.metadata?.requires_confirmation || true,
          params: dbAction.params,
          queryHash: generateQueryHash(dbAction.query, dbAction.params)
        });

        if (!isValid) {
          throw new Error('Invalid database query');
        }

        // Execute query if confirmation is not required
        if (!dbAction.metadata?.requires_confirmation) {
          const results = await executeDatabaseQuery({
            query: dbAction.query,
            description: dbAction.metadata?.description || 'Database operation',
            requiresConfirmation: false,
            params: dbAction.params
          }, conversationContext);
          
          validatedResponse.system.db_action.metadata = {
            ...validatedResponse.system.db_action.metadata,
            results
          };
        }
      }

      return validatedResponse;

    } catch (error) {
      lastError = error as Error;
      console.error(`Error in generateResponse (attempt ${retries + 1}/${MAX_RETRIES}):`, error);
      retries++;
      if (retries < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, BASE_DELAY * Math.pow(2, retries)));
      }
    }
  }

  // If all retries failed, return a friendly error response
  return {
    system: {
      metadata: {
        error: lastError?.message || 'Unknown error occurred'
      }
    },
    user: {
      message: 'I apologize, but I encountered an error processing your request. Please try rephrasing your request or try again later.'
    }
  };
} 