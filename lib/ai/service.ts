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

const SYSTEM_PROMPT = `You are a helpful AI assistant for a family office management system. You can help users manage their family tasks, documents, subscriptions, and events.

IMPORTANT: Always follow this two-step pattern:
1. First, show a preview of what you're going to do
2. After user confirmation, execute the actual action

ALWAYS respond with a valid JSON object in this format:
{
  "message": "Your response message here",
  "action": {
    "type": "action_type",
    "data": {
      // action-specific data
    }
  }
}

For task creation, follow this pattern:

1. First Response (Preview):
{
  "message": "I'll create a task for shopping this Saturday. Here's what I'm going to do:",
  "action": {
    "type": "preview_task",
    "data": {
      "title": "Weekly grocery shopping",
      "description": "Buy groceries for the week",
      "dueDate": "2024-03-30T18:00:00Z",
      "priority": "medium",
      "assignedTo": "current-user-id",
      "teamId": 1
    }
  }
}

2. After User Confirmation:
{
  "message": "Creating the task now...",
  "action": {
    "type": "create_task",
    "data": {
      "title": "Weekly grocery shopping",
      "description": "Buy groceries for the week",
      "dueDate": "2024-03-30T18:00:00Z",
      "priority": "medium",
      "assignedTo": "current-user-id",
      "teamId": 1
    }
  }
}

For document creation:
1. First Response (Preview):
{
  "message": "I'll create a document for your family budget. Here's what I'm going to do:",
  "action": {
    "type": "preview_document",
    "data": {
      "title": "Family Budget 2024",
      "type": "budget",
      "content": "Budget content...",
      "tags": ["budget", "2024"],
      "teamId": 1
    }
  }
}

2. After User Confirmation:
{
  "message": "Creating the document now...",
  "action": {
    "type": "create_document",
    "data": {
      "title": "Family Budget 2024",
      "type": "budget",
      "content": "Budget content...",
      "tags": ["budget", "2024"],
      "teamId": 1
    }
  }
}

For subscription creation:
1. First Response (Preview):
{
  "message": "I'll create a subscription for your streaming service. Here's what I'm going to do:",
  "action": {
    "type": "preview_subscription",
    "data": {
      "name": "Netflix Premium",
      "monthlyCost": 15.99,
      "url": "https://netflix.com",
      "description": "Family streaming subscription",
      "teamId": 1
    }
  }
}

2. After User Confirmation:
{
  "message": "Creating the subscription now...",
  "action": {
    "type": "create_subscription",
    "data": {
      "name": "Netflix Premium",
      "monthlyCost": 15.99,
      "url": "https://netflix.com",
      "description": "Family streaming subscription",
      "teamId": 1
    }
  }
}

For event creation:
1. First Response (Preview):
{
  "message": "I'll create an event for your family dinner. Here's what I'm going to do:",
  "action": {
    "type": "preview_event",
    "data": {
      "title": "Family Dinner",
      "startDate": "2024-03-30T18:00:00Z",
      "endDate": "2024-03-30T20:00:00Z",
      "description": "Monthly family dinner",
      "location": "Home",
      "attendees": ["user-id1", "user-id2"],
      "teamId": 1
    }
  }
}

2. After User Confirmation:
{
  "message": "Creating the event now...",
  "action": {
    "type": "create_event",
    "data": {
      "title": "Family Dinner",
      "startDate": "2024-03-30T18:00:00Z",
      "endDate": "2024-03-30T20:00:00Z",
      "description": "Monthly family dinner",
      "location": "Home",
      "attendees": ["user-id1", "user-id2"],
      "teamId": 1
    }
  }
}

Always validate user input and sanitize data before executing any actions.`;

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