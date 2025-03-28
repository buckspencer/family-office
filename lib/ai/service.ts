'use server';

import { z } from 'zod';
import { AIResponse, ResourceAction } from '@/lib/resources/base/types';

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
  try {
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error('Missing DEEPSEEK_API_KEY environment variable');
    }

    const currentYear = new Date().getFullYear();
    const systemPrompt = `You are a family office AI assistant focused on managing family tasks, subscriptions, documents, and information. You must respond with EXACTLY ONE JSON object in the following structure:

{
  "message": "<user_friendly_message>",
  "action": {
    "type": "<action_type>",
    "data": {
      // Action-specific data fields
    }
  }
}

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

Available actions:
- create_task: Create a new task with title, description (optional), and dueDate (optional)
- create_subscription: Create a new subscription with name, amount, and frequency
- create_document: Create a new document with title, type, and content
- create_event: Create a new event with title, startDate, endDate, and description (optional)
- execute_sql: Execute a SQL query (requires confirmation)
- execute_stored_procedure: Execute a stored procedure (requires confirmation)
- execute_graphql: Execute a GraphQL query (requires confirmation)
- error: Something went wrong

Example responses:
1. For task creation with date and time:
{
  "message": "I've created a task for your doctor's appointment on March 29th, 2024 at 1:00 PM.",
  "action": {
    "type": "create_task",
    "data": {
      "title": "Doctor's appointment",
      "description": "Annual checkup",
      "dueDate": "${currentYear}-03-29T13:00:00Z",
      "priority": "high",
      "category": "health"
    }
  }
}

2. For subscription creation:
{
  "message": "I've added your monthly Netflix subscription to the family expenses.",
  "action": {
    "type": "create_subscription",
    "data": {
      "name": "Netflix",
      "amount": 15.99,
      "frequency": "monthly",
      "category": "entertainment"
    }
  }
}

3. For document creation:
{
  "message": "I've created a new document for your family's emergency contact information.",
  "action": {
    "type": "create_document",
    "data": {
      "title": "Emergency Contacts",
      "type": "contact_list",
      "content": "Emergency contact information...",
      "tags": ["emergency", "contacts"]
    }
  }
}

4. For event creation:
{
  "message": "I've added the family reunion to the calendar for July 15th, 2024.",
  "action": {
    "type": "create_event",
    "data": {
      "title": "Family Reunion",
      "startDate": "${currentYear}-07-15T10:00:00Z",
      "endDate": "${currentYear}-07-15T18:00:00Z",
      "description": "Annual family reunion",
      "location": "Central Park",
      "attendees": ["Family members"]
    }
  }
}

5. For no action:
{
  "message": "I'm not sure what you'd like me to do."
}

6. For errors:
{
  "message": "I couldn't understand the date format. Please specify the date and time clearly.",
  "action": {
    "type": "error",
    "error": "Invalid date format"
  }
}`;

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
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    console.log('Raw AI response:', aiResponse);

    const cleanedResponse = cleanAIResponse(aiResponse);
    console.log('Cleaned AI response:', cleanedResponse);

    const parsedResponse = JSON.parse(cleanedResponse);
    console.log('Parsed AI response:', parsedResponse);

    return AIResponseSchema.parse(parsedResponse);
  } catch (error) {
    console.error('Error in generateResponse:', error);
    return {
      message: 'I encountered an error processing your request. Please try again.',
      action: {
        type: 'error',
        error: 'Internal server error'
      }
    };
  }
} 