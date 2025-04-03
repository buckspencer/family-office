'use server';

import { getSession } from '@/lib/auth/session';
import { logger } from './logger';
import { AIResponse } from '@/lib/types/chat';
import { ConversationContextManager } from './context';
import { createPrompt, parseAIResponse } from './prompt';

export async function generateResponse(prompt: string, teamId: string): Promise<AIResponse> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    const contextManager = ConversationContextManager.getInstance();
    const context = await contextManager.getContext(session.user.id, teamId);

    // Format messages for DeepSeek
    const messages = [
      {
        role: 'system',
        content: 'You are an AI assistant for a family office management system. Your role is to help users manage their family\'s information, tasks, events, subscriptions, and memories.'
      },
      // Add context as a system message
      {
        role: 'system',
        content: `Current Context:\n${JSON.stringify({
          recentTasks: context.recentTasks,
          importantDates: context.importantDates
        }, null, 2)}`
      },
      // Add previous messages from context
      ...context.messages.slice(-5), // Keep last 5 messages for context
      // Add the new message
      {
        role: 'user',
        content: prompt
      }
    ];

    // Call the DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        max_tokens: 2000,
        temperature: 0.7,
        top_p: 0.95,
        repetition_penalty: 1.1,
        stream: false
      })
    });

    if (!response.ok) {
      const error = await response.json();
      logger.error('DeepSeek API error', { error });
      throw new Error(error.error?.message || 'Failed to generate response');
    }

    const data = await response.json();
    const parsedResponse = parseAIResponse(data.choices[0].message.content);

    // Add the AI's response to the context
    await contextManager.addMessage(context, 'assistant', parsedResponse.message);

    // Update context with tokens used
    await contextManager.updateContext(context, data.usage?.total_tokens || 0);

    const aiResponse: AIResponse = {
      system: {
        metadata: {
          tokensUsed: data.usage?.total_tokens || 0
        }
      },
      user: {
        message: parsedResponse.message || "I apologize, but I couldn't process your request."
      }
    };

    return aiResponse;
  } catch (error) {
    logger.error('Error generating response:', error);
    throw error;
  }
}

async function generateAIResponse(prompt: string, context: any): Promise<AIResponse> {
  try {
    // Create the prompt
    const fullPrompt = createPrompt(prompt, context);
    logger.debug('Created AI prompt', { fullPrompt });

    // Call DeepSeek API
    logger.info('Calling DeepSeek API');
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant for a family office management system. Your role is to help users manage their family\'s information, tasks, events, and memories.'
          },
          {
            role: 'user',
            content: fullPrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
        top_p: 0.95,
        repetition_penalty: 1.1,
        stream: false
      })
    });

    if (!response.ok) {
      const error = await response.json();
      logger.error('DeepSeek API error', { error });
      throw new Error(`DeepSeek API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    logger.debug('Received DeepSeek API response', { data });

    // Parse the AI response
    const output = data.choices[0].message.content;
    const parsedResponse = parseAIResponse(output);
    logger.debug('Parsed AI response', { parsedResponse });

    return {
      system: {
        metadata: {
          tokensUsed: data.usage?.total_tokens || 0
        }
      },
      user: {
        message: parsedResponse.message
      }
    };
  } catch (error) {
    logger.error('Error generating AI response', { error });
    return {
      system: {
        metadata: {}
      },
      user: {
        message: "I'm sorry, I encountered an error while processing your request. Please try again."
      }
    };
  }
}
