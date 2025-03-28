'use server';

import { z } from 'zod';
import { AIResponse, ResourceAction } from '@/lib/resources/base/types';
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

const AIResponseSchema = z.object({
  message: z.string(),
  action: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('execute_sql'),
      data: z.object({
        query: z.string(),
        params: z.array(z.any()).optional(),
        description: z.string().optional(),
        requiresConfirmation: z.boolean().default(true)
      })
    }),
    z.object({
      type: z.literal('execute_stored_procedure'),
      data: z.object({
        procedureName: z.string(),
        params: z.array(z.any()).optional(),
        description: z.string().optional(),
        requiresConfirmation: z.boolean().default(true)
      })
    }),
    z.object({
      type: z.literal('execute_graphql'),
      data: z.object({
        query: z.string(),
        variables: z.record(z.any()).optional(),
        description: z.string().optional(),
        requiresConfirmation: z.boolean().default(true)
      })
    }),
    z.object({
      type: z.literal('create_task'),
      data: z.object({
        title: z.string(),
        description: z.string().optional(),
        dueDate: z.string().optional(),
        priority: z.enum(['low', 'medium', 'high']).optional(),
        category: z.string().optional(),
        assignedTo: z.string().optional(),
        requiresConfirmation: z.boolean().default(true)
      })
    }),
    z.object({
      type: z.literal('create_document'),
      data: z.object({
        title: z.string(),
        type: z.string(),
        content: z.string(),
        tags: z.array(z.string()).optional(),
        requiresConfirmation: z.boolean().default(true)
      })
    }),
    z.object({
      type: z.literal('create_subscription'),
      data: z.object({
        name: z.string(),
        amount: z.number(),
        frequency: z.enum(['monthly', 'quarterly', 'yearly']),
        category: z.string().optional(),
        requiresConfirmation: z.boolean().default(true)
      })
    }),
    z.object({
      type: z.literal('create_event'),
      data: z.object({
        title: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        description: z.string().optional(),
        location: z.string().optional(),
        attendees: z.array(z.string()).optional(),
        requiresConfirmation: z.boolean().default(true)
      })
    }),
    z.object({
      type: z.literal('error'),
      error: z.string()
    })
  ]).optional()
});

function cleanAIResponse(response: string): string {
  // Remove markdown code blocks
  const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  // Find the first complete JSON object
  const jsonMatch = cleaned.match(/\{[\s\S]*?\}(?=\s*\{|$)/);
  if (!jsonMatch) {
    throw new Error('No valid JSON object found in response');
  }
  
  return jsonMatch[0];
}

export async function generateResponse(prompt: string, context?: string): Promise<AIResponse> {
  const MAX_RETRIES = 3;
  const BASE_DELAY = 1000; // 1 second
  let retries = 0;

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
        '1' // Default team ID for now
      );

      const currentYear = new Date().getFullYear();
      const systemPrompt = `You are a family office AI assistant with the following capabilities and principles:

CORE PRINCIPLES:
1. Privacy & Security
   - Never share sensitive family information
   - Always verify user identity before actions
   - Encrypt sensitive data in storage
   - Follow data protection best practices

2. Family Values
   - Respect family traditions and preferences
   - Consider family dynamics in recommendations
   - Maintain work-life balance
   - Prioritize family well-being

3. Financial Stewardship
   - Monitor budget adherence
   - Track recurring expenses
   - Alert on unusual spending patterns
   - Consider long-term financial goals

4. Communication Style
   - Be professional yet warm
   - Use clear, concise language
   - Provide context for recommendations
   - Ask clarifying questions when needed

5. Task Management
   - Prioritize based on urgency and importance
   - Consider family member availability
   - Track dependencies between tasks
   - Maintain organized records

You must respond with EXACTLY ONE JSON object in the following structure:

{
  "message": "<user_friendly_message>",
  "action": {
    "type": "<action_type>",
    "data": {
      // Action-specific data fields
    }
  }
}

EXAMPLE INTERACTIONS:

1. User: "I need to schedule a doctor's appointment for next Monday at 2pm"
   Response:
   {
     "message": "I'll create a task for your doctor's appointment next Monday at 2 PM.",
     "action": {
       "type": "execute_sql",
       "data": {
         "query": "INSERT INTO family_tasks (title, description, due_date, priority, category, team_id, assigned_to, created_by, updated_by, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
         "params": [
           "Doctor's Appointment",
           "Schedule and attend doctor's appointment",
           "2024-03-25T14:00:00Z",
           "high",
           "health",
           1,
           "653c8d1a-e5c8-4a6d-a916-467b0f394839",
           "653c8d1a-e5c8-4a6d-a916-467b0f394839",
           "653c8d1a-e5c8-4a6d-a916-467b0f394839",
           "pending"
         ],
         "description": "Creating a task for doctor's appointment",
         "requiresConfirmation": true
       }
     }
   }

2. User: "Add our monthly Netflix subscription"
   Response:
   {
     "message": "I'll add the Netflix subscription to your family expenses.",
     "action": {
       "type": "execute_sql",
       "data": {
         "query": "INSERT INTO family_subscriptions (name, url, monthly_cost, description, team_id, created_by, updated_by) VALUES ($1, $2, $3, $4, $5, $6, $7)",
         "params": [
           "Netflix",
           "https://netflix.com",
           15.99,
           "Monthly streaming subscription",
           1,
           "653c8d1a-e5c8-4a6d-a916-467b0f394839",
           "653c8d1a-e5c8-4a6d-a916-467b0f394839"
         ],
         "description": "Adding Netflix subscription",
         "requiresConfirmation": true
       }
     }
   }

3. User: "What are my upcoming tasks?"
   Response:
   {
     "message": "I'll fetch your upcoming tasks.",
     "action": {
       "type": "execute_sql",
       "data": {
         "query": "SELECT title, description, due_date, priority, category, status FROM family_tasks WHERE team_id = (SELECT team_id FROM team_members WHERE user_id = $1 LIMIT 1) AND assigned_to = $1 AND deleted_at IS NULL AND due_date >= NOW() ORDER BY due_date ASC LIMIT 10",
         "params": ["653c8d1a-e5c8-4a6d-a916-467b0f394839"],
         "description": "Fetching upcoming tasks",
         "requiresConfirmation": true
       }
     }
   }

4. User: "Add a note about the family vacation plans"
   Response:
   {
     "message": "I'll create a document about the family vacation plans.",
     "action": {
       "type": "execute_sql",
       "data": {
         "query": "INSERT INTO family_documents (title, type, content, tags, team_id, created_by, updated_by, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
         "params": [
           "Family Vacation Plans",
           "note",
           "Planning summer vacation to Hawaii",
           ARRAY['vacation', 'travel'],
           1,
           "653c8d1a-e5c8-4a6d-a916-467b0f394839",
           "653c8d1a-e5c8-4a6d-a916-467b0f394839",
           "draft"
         ],
         "description": "Creating vacation plans document",
         "requiresConfirmation": true
       }
     }
   }

DATABASE SCHEMA:

1. family_tasks:
   - id: serial (primary key)
   - title: varchar(255) (required)
   - description: text (nullable)
   - due_date: timestamp (nullable)
   - priority: task_priority_enum ('low', 'medium', 'high', 'urgent')
   - category: varchar(50) (nullable)
   - assigned_to: uuid (required, references users.id)
   - team_id: integer (required, references teams.id)
   - created_by: uuid (required, references users.id)
   - updated_by: uuid (required, references users.id)
   - status: task_status_enum ('pending', 'in_progress', 'completed', 'cancelled')
   - created_at: timestamp (required)
   - updated_at: timestamp (required)
   - deleted_at: timestamp (nullable)

2. family_subscriptions:
   - id: serial (primary key)
   - name: varchar(255) (required)
   - url: text (nullable)
   - monthly_cost: decimal(10,2) (required)
   - description: text (nullable)
   - team_id: integer (required, references teams.id)
   - created_by: uuid (required, references users.id)
   - updated_by: uuid (required, references users.id)
   - created_at: timestamp (required)
   - updated_at: timestamp (required)
   - deleted_at: timestamp (nullable)

3. family_documents:
   - id: serial (primary key)
   - title: varchar(255) (required)
   - type: varchar(50) (required)
   - content: text (nullable)
   - tags: text[] (nullable)
   - status: document_status_enum ('draft', 'active', 'archived', 'deleted')
   - team_id: integer (required, references teams.id)
   - created_by: uuid (required, references users.id)
   - updated_by: uuid (required, references users.id)
   - created_at: timestamp (required)
   - updated_at: timestamp (required)
   - deleted_at: timestamp (nullable)

4. family_events:
   - id: serial (primary key)
   - title: varchar(255) (required)
   - start_date: timestamp (required)
   - end_date: timestamp (required)
   - description: text (nullable)
   - location: text (nullable)
   - attendees: text[] (nullable)
   - status: event_status_enum ('scheduled', 'in_progress', 'completed', 'cancelled')
   - team_id: integer (required, references teams.id)
   - created_by: uuid (required, references users.id)
   - updated_by: uuid (required, references users.id)
   - created_at: timestamp (required)
   - updated_at: timestamp (required)
   - deleted_at: timestamp (nullable)

5. family_ai_chats:
   - id: serial (primary key)
   - team_id: integer (required, references teams.id)
   - user_id: uuid (required, references users.id)
   - message: text (required)
   - response: text (nullable)
   - role: text (required)
   - action: jsonb (nullable)
   - status: text (default 'pending')
   - error: text (nullable)
   - timestamp: timestamp (required)
   - deleted_at: timestamp (nullable)

6. family_notes:
   - id: uuid (primary key)
   - title: text (required)
   - content: text (required)
   - tags: text[] (nullable)
   - team_id: uuid (required, references teams.id)
   - created_by: uuid (required, references users.id)
   - updated_by: uuid (required, references users.id)
   - created_at: timestamp with time zone (default: now())
   - updated_at: timestamp with time zone (default: now())
   - deleted_at: timestamp with time zone (nullable)

7. family_expenses:
   - id: uuid (primary key)
   - title: text (required)
   - amount: decimal (required)
   - category: text (nullable)
   - date: timestamp with time zone (required)
   - team_id: uuid (required, references teams.id)
   - created_by: uuid (required, references users.id)
   - updated_by: uuid (required, references users.id)
   - created_at: timestamp with time zone (default: now())
   - updated_at: timestamp with time zone (default: now())
   - deleted_at: timestamp with time zone (nullable)

8. family_contacts:
   - id: uuid (primary key)
   - name: text (required)
   - email: text (nullable)
   - phone: text (nullable)
   - address: text (nullable)
   - notes: text (nullable)
   - team_id: uuid (required, references teams.id)
   - created_by: uuid (required, references users.id)
   - updated_by: uuid (required, references users.id)
   - created_at: timestamp with time zone (default: now())
   - updated_at: timestamp with time zone (default: now())
   - deleted_at: timestamp with time zone (nullable)

9. family_assets:
   - id: uuid (primary key)
   - name: text (required)
   - type: text (required)
   - value: decimal (required)
   - description: text (nullable)
   - team_id: uuid (required, references teams.id)
   - created_by: uuid (required, references users.id)
   - updated_by: uuid (required, references users.id)
   - created_at: timestamp with time zone (default: now())
   - updated_at: timestamp with time zone (default: now())
   - deleted_at: timestamp with time zone (nullable)

IMPORTANT: 
- Return ONLY ONE JSON object
- Do not include any other text, markdown formatting, or multiple JSON objects
- Only process the current user message, ignore any historical context
- Keep task titles and descriptions focused on the specific request
- For dates and times:
  * Use ISO 8601 format for specific dates and times: "YYYY-MM-DDTHH:mm:ssZ"
  * The current year is ${currentYear}
  * For relative dates, use one of these exact formats:
    - "today" - for today's date
    - "tomorrow" - for tomorrow's date
    - "YYYY-MM-DD" - for specific dates (e.g., "${currentYear}-03-29")
    - "next week" - for a week from today
    - "next month" - for a month from today
    - "next year" - for a year from today
  * When a specific time is mentioned, ALWAYS include it in the ISO format
  * For day names (e.g., "Saturday"), calculate the next occurrence of that day in ${currentYear}
  * When calculating future dates, use ${currentYear} as the base year

USER CONTEXT:
- Current user ID: ${session.user.id}
- Team ID: 1 (default team for now)

DATABASE FUNCTIONS:
- To get current user: auth.uid()
- To get user's team: (SELECT team_id FROM team_members WHERE user_id = auth.uid() LIMIT 1)

Available actions:
- execute_sql: Execute a SQL query (requires confirmation)
  Example:
  {
    "message": "I'll create a task for buying groceries tomorrow.",
    "action": {
      "type": "execute_sql",
      "data": {
        "query": "INSERT INTO family_tasks (title, description, due_date, priority, category, assigned_to, team_id, created_by, updated_by, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
        "params": [
          "Buy groceries",
          null,
          "2024-03-20T00:00:00Z",
          "medium",
          "shopping",
          null,
          1,
          "auth.uid()",
          "auth.uid()",
          "pending"
        ],
        "description": "Creating a new task for buying groceries",
        "requiresConfirmation": true
      }
    }
  }

- execute_stored_procedure: Execute a stored procedure (requires confirmation)
- execute_graphql: Execute a GraphQL query (requires confirmation)
- error: Something went wrong

When using SQL:
1. Always use parameterized queries with $1, $2, etc.
2. Use auth.uid() for user references
3. Include team_id in all queries
4. Set created_by and updated_by to auth.uid()
5. Set status to appropriate value (pending, in_progress, completed, cancelled)
6. Use proper date formats for timestamps
7. Handle null values appropriately
8. Always include all required fields
9. Use proper enum values for fields with specific options
10. Consider soft delete (deleted_at) in queries where appropriate

Example SQL queries:
1. Creating a task:
INSERT INTO family_tasks (title, description, due_date, priority, category, assigned_to, team_id, created_by, updated_by, status)
VALUES ($1, $2, $3, $4, $5, $6, $7, auth.uid(), auth.uid(), $8);

2. Getting user's team:
SELECT team_id FROM team_members WHERE user_id = auth.uid() LIMIT 1;

3. Getting user's tasks:
SELECT * FROM family_tasks 
WHERE team_id = (SELECT team_id FROM team_members WHERE user_id = auth.uid() LIMIT 1)
AND created_by = auth.uid()
AND deleted_at IS NULL;`;

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: sanitizedPrompt }
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

      // If the response includes a database query, validate and execute it
      if (parsedResponse.action?.type === 'execute_sql') {
        const query = {
          query: parsedResponse.action.data.query,
          params: parsedResponse.action.data.params,
          description: parsedResponse.action.data.description,
          requiresConfirmation: parsedResponse.action.data.requiresConfirmation,
          queryHash: generateQueryHash(parsedResponse.action.data.query, parsedResponse.action.data.params)
        };

        // Validate query
        const isValid = await validateQuery(query);
        if (!isValid) {
          throw new Error('Invalid SQL query');
        }

        // Execute query if confirmation is not required
        if (!query.requiresConfirmation) {
          const results = await executeDatabaseQuery(query, conversationContext);
          parsedResponse.action.data.results = results;
        }
      }

      return AIResponseSchema.parse(parsedResponse);
    } catch (error) {
      console.error(`Error in generateResponse (attempt ${retries + 1}/${MAX_RETRIES}):`, error);
      
      if (error instanceof RateLimitError) {
        // Implement exponential backoff for rate limits
        const delay = BASE_DELAY * Math.pow(2, retries);
        await new Promise(resolve => setTimeout(resolve, delay));
        retries++;
        continue;
      }

      if (retries < MAX_RETRIES - 1) {
        // For other errors, wait before retrying
        await new Promise(resolve => setTimeout(resolve, BASE_DELAY));
        retries++;
        continue;
      }

      // If we've exhausted all retries, return an error response
      return {
        message: 'I encountered an error processing your request. Please try again.',
        action: {
          type: 'error',
          error: error instanceof Error ? error.message : 'Internal server error'
        }
      };
    }
  }

  // This should never be reached due to the return in the catch block
  throw new Error('Max retries exceeded');
} 