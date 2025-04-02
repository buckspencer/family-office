'use server';

import { AIResponse } from '@/lib/types/chat';
import { getSession } from '@/lib/auth/session';
import { executeDatabaseQuery } from './database';

export async function generateResponse(prompt: string): Promise<AIResponse> {
  const session = await getSession();
  
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }

  // Generate AI response
  const aiResponse = await generateAIResponse(prompt);
  
  // If the response includes a database action, execute it
  if (aiResponse.system?.db_action) {
    const dbAction = aiResponse.system.db_action;
    const results = await executeDatabaseQuery(dbAction.query, dbAction.params || []);
    
    aiResponse.system.db_action.metadata = {
      ...aiResponse.system.db_action.metadata,
      results
    };
  }

  return aiResponse;
}

async function generateAIResponse(prompt: string): Promise<AIResponse> {
  // TODO: Implement direct DeepSeek integration here
  return {
    system: {
      metadata: {}
    },
    user: {
      message: "I understand your request. Let me help you with that."
    }
  };
} 