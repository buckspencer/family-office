'use server';

import { z } from 'zod';
import { TaskSchema } from '@/lib/types/chat';

if (!process.env.DEEPSEEK_API_KEY) {
  throw new Error('Missing DEEPSEEK_API_KEY environment variable');
}

const TaskDataSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
});

const AIResponseSchema = z.object({
  action: z.enum(['create_task', 'ignore', 'error']),
  data: TaskDataSchema.optional(),
  message: z.string(),
});

type AIResponse = z.infer<typeof AIResponseSchema>;

function cleanAIResponse(response: string): string {
  return response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
}

export async function generateResponse(prompt: string, context?: string): Promise<AIResponse> {
  try {
    const systemPrompt = `You are a family office AI assistant focused on managing family tasks, subscriptions, documents, and information. You must respond in valid JSON format with the following structure:

{
  "action": "<action_type>",
  "data": {
    // Action-specific data fields
  },
  "message": "<user_friendly_message>"
}

Available actions:
- create_task: Create a new task with title, description (optional), and dueDate (optional)
- ignore: No action needed
- error: Something went wrong

Example responses:
1. For task creation:
{
  "action": "create_task",
  "data": {
    "title": "Buy groceries",
    "description": "Get milk, bread, and eggs",
    "dueDate": "tomorrow"
  },
  "message": "I've created a task to buy groceries for tomorrow."
}

2. For no action:
{
  "action": "ignore",
  "message": "I'm not sure what you'd like me to do."
}

3. For errors:
{
  "action": "error",
  "message": "I couldn't understand the date format. Could you please specify the date more clearly?"
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
          { role: 'user', content: context ? `${context}\n\n${prompt}` : prompt }
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
      action: 'error',
      message: 'I encountered an error processing your request. Please try again.'
    };
  }
} 