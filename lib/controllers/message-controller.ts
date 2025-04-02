import { ChatMessage, MessageState } from '@/lib/types/chat';
import { sendMessage } from '@/app/(dashboard)/dashboard/actions';
import { AIResponse } from '@/lib/types/chat';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db/drizzle';
import { sql } from 'drizzle-orm';

export class MessageController {
  private state: MessageState;

  constructor() {
    this.state = {
      messages: []
    };
  }

  private async processDBAction(action: AIResponse['system']['db_action']) {
    if (!action) return;

    const { query } = action;
    return await db.execute(sql.raw(query));
  }

  async handleMessage(response: AIResponse) {
    if (response.system?.db_action) {
      return await this.processDBAction(response.system.db_action);
    }
    return null;
  }

  async processMessage(content: string): Promise<{ success: boolean; error?: Error }> {
    this.state.messages.push({ role: 'user', content, timestamp: new Date() });

    try {
      const session = await getSession();
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      // Get AI response
      const response = await sendMessage(content);
      
      if (response.success && response.chatEntry) {
        // Add AI message with user-facing content
        const aiMessage: ChatMessage = {
          role: 'assistant',
          content: response.chatEntry.message || response.chatEntry.response || 'I apologize, but I encountered an error processing your request.',
          timestamp: new Date(),
          display_data: response.chatEntry.action
        };
        this.state.messages.push(aiMessage);
      }

      return { success: true };
    } catch (error) {
      console.error('Error in processMessage:', error);
      this.state.messages.push({ role: 'user', content: 'An error occurred', timestamp: new Date() });
      return { success: false, error: error instanceof Error ? error : new Error('An error occurred') };
    }
  }

  getState(): MessageState {
    return { ...this.state };
  }
} 