'use server';

import { z } from 'zod';
import { ChatMessageSchema, TaskSchema } from '@/lib/types/chat';

if (!process.env.DEEPSEEK_API_KEY) {
  throw new Error('Missing DEEPSEEK_API_KEY environment variable');
}

// Cache for model responses
const responseCache = new Map<string, string>();

const TaskDataSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
});

const ConfirmActionSchema = z.object({
  action: z.string(),
  data: TaskDataSchema,
});

const AIResponseSchema = z.object({
  action: z.enum([
    'create_task',
    'confirm_action',
    'ignore',
    'error'
  ]),
  data: z.union([
    TaskDataSchema,
    ConfirmActionSchema,
    z.record(z.any())
  ]).optional(),
  message: z.string(),
});

function cleanAIResponse(response: string): string {
  // Remove markdown code block markers if present
  response = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  // Remove any leading/trailing whitespace
  response = response.trim();
  return response;
}

function extractTaskData(action: string, data: any): any {
  console.log('extractTaskData - Input:', { action, data });
  
  if (action === 'confirm_action') {
    // Handle nested structure
    if (data?.action === 'create_task' && data?.data) {
      console.log('Found nested task data:', data.data);
      const taskData = data.data;
      const result = {
        title: taskData.title,
        description: taskData.description || '',
        dueDate: taskData.dueDate,
        priority: taskData.priority || 'medium',
        status: 'pending'
      };
      console.log('Extracted task data:', result);
      return result;
    }
    // Handle direct task data
    if (data?.title) {
      console.log('Found direct task data:', data);
      const result = {
        title: data.title,
        description: data.description || '',
        dueDate: data.dueDate,
        priority: data.priority || 'medium',
        status: 'pending'
      };
      console.log('Extracted task data:', result);
      return result;
    }
  }
  console.log('No task data found, returning original data:', data);
  return data;
}

export async function generateResponse(prompt: string, context?: string) {
  try {
    // Check cache first
    const cacheKey = `${prompt}:${context || ''}`;
    if (responseCache.has(cacheKey)) {
      return responseCache.get(cacheKey)!;
    }

    const systemPrompt = `You are a family office AI assistant focused on managing family tasks, subscriptions, documents, and information. You must respond in valid JSON format with the following structure:

{
  "action": "<action_type>",
  "data": {
    // Action-specific data fields
  },
  "message": "<user_friendly_message>"
}

IMPORTANT: 
1. Only respond to requests related to family office management. Ignore casual conversation, greetings, or non-task related queries.
2. Return ONLY the JSON object, no markdown formatting or additional text.

Available actions and their required data:
1. create_task
   Required: { "title": string }
   Optional: { "description": string, "dueDate": string, "priority": "high" | "medium" | "low" }
   Use this action when user mentions reminders, tasks, or to-dos
   Example: "remind me to buy bread tomorrow" should trigger create_task with appropriate dueDate
   Message should be: "I can help you create a task for [title]. Would you like me to create this task?"

2. confirm_action
   Required: { "action": string, "data": object }
   Use this when user confirms a previous action (e.g., responds with "yes")
   Example: If user says "yes" after a task creation prompt, respond with:
   {
     "action": "confirm_action",
     "data": { 
       "action": "create_task",
       "data": { 
         "title": "Buy bread",
         "dueDate": "tomorrow"
       }
     },
     "message": "Task has been created successfully."
   }

3. ignore
   Use for non-task related queries or casual conversation
   Example: { "action": "ignore", "message": "I'm here to help with family office tasks." }

4. error
   Use when there's an error or invalid input
   Example: { "action": "error", "message": "I couldn't understand that request." }

Context of previous messages:
${context || 'No previous context'}

User message: ${prompt}`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate response');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Clean and parse the response
    const cleanedResponse = cleanAIResponse(aiResponse);
    console.log('Cleaned AI response:', cleanedResponse);
    
    const parsedResponse = JSON.parse(cleanedResponse);
    console.log('Parsed AI response:', parsedResponse);
    
    const validatedResponse = AIResponseSchema.parse(parsedResponse);
    console.log('Validated AI response:', validatedResponse);

    // Extract task data if needed
    if (validatedResponse.action === 'confirm_action') {
      console.log('Processing confirm_action:', validatedResponse);
      validatedResponse.data = extractTaskData(validatedResponse.action, validatedResponse.data);
      console.log('Final response with extracted data:', validatedResponse);
    }

    // Cache the validated response
    responseCache.set(cacheKey, JSON.stringify(validatedResponse));

    return JSON.stringify(validatedResponse);
  } catch (error) {
    console.error('Error generating response:', error);
    return JSON.stringify({
      action: 'error',
      message: 'I encountered an error processing your request. Please try again.',
    });
  }
} 