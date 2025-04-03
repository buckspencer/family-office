import { ChatMessage, MessageState } from '@/lib/types/chat';
import { getSession } from '@/lib/auth/session';

export class MessageController {
  private state: MessageState;
  private teamId: string;

  constructor(teamId: string) {
    this.state = {
      messages: [],
      isLoading: false
    };
    this.teamId = teamId;
  }

  async processMessage(content: string): Promise<{ success: boolean; error?: Error }> {
    this.state.messages.push({ role: 'user', content, timestamp: new Date() });
    this.state.isLoading = true;

    try {
      const session = await getSession();
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      // Send message to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId: this.teamId,
          content
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to process message');
      }

      if (data.chatEntry) {
        // Add AI message with user-facing content
        const aiMessage: ChatMessage = {
          role: 'assistant',
          content: data.chatEntry.message || data.chatEntry.response || 'I apologize, but I encountered an error processing your request.',
          timestamp: new Date(),
          display_data: data.chatEntry.action
        };
        this.state.messages.push(aiMessage);
      }

      return { success: true };
    } catch (error) {
      console.error('Error in processMessage:', error);
      this.state.messages.push({ role: 'user', content: 'An error occurred', timestamp: new Date() });
      return { success: false, error: error instanceof Error ? error : new Error('An error occurred') };
    } finally {
      this.state.isLoading = false;
    }
  }

  getState(): MessageState {
    return { ...this.state };
  }
} 