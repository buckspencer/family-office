import { ChatMessage, MessageState } from '@/lib/types/chat';
import { sendMessage } from '@/app/(dashboard)/dashboard/actions';
import { AIResponse } from '@/lib/types/chat';
import { FamilyAIChat } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db/drizzle';
import { sql } from 'drizzle-orm';

export class MessageController {
  private state: MessageState;
  private teamId: number;

  constructor(teamId: number) {
    this.teamId = teamId;
    this.state = {
      messages: [],
      error: null,
      isLoading: false
    };
  }

  private updateState(updates: Partial<MessageState>) {
    this.state = { ...this.state, ...updates };
  }

  private async processDBAction(action: AIResponse['system']['db_action']) {
    if (!action) return;

    const { operation, table, query, params, metadata } = action;
    
    // Execute through Drizzle
    const result = await db.execute(sql.raw(query));
      
    // Handle notifications if needed
    if (metadata?.notification_required) {
      await this.notifyRelevantUsers(result);
    }

    return result;
  }

  private async notifyRelevantUsers(data: any) {
    // Implement notification logic here
    console.log('Notifying users about:', data);
  }

  async processMessage(content: string): Promise<{ success: boolean; error?: Error }> {
    this.updateState({ isLoading: true, error: null });

    try {
      const session = await getSession();
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      // Add user message
      const userMessage: ChatMessage = {
        role: 'user',
        content,
        timestamp: new Date()
      };
      this.state.messages.push(userMessage);

      // Get AI response
      const response = await sendMessage(this.teamId, content);
      
      if (response.success && response.chatEntry) {
        // Add AI message with user-facing content
        const aiMessage: ChatMessage = {
          role: 'assistant',
          content: response.chatEntry.message,
          timestamp: response.chatEntry.timestamp,
          display_data: response.chatEntry.action
        };
        this.state.messages.push(aiMessage);
      }

      this.updateState({ isLoading: false });
      return { success: true };
    } catch (error) {
      console.error('Error in processMessage:', error);
      this.updateState({ isLoading: false, error: error instanceof Error ? error.message : 'An error occurred' });
      return { success: false, error: error instanceof Error ? error : new Error('An error occurred') };
    }
  }

  getState(): MessageState {
    return { ...this.state };
  }
} 