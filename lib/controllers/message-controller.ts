import { ChatMessage, Task } from '@/lib/types/chat';
import { sendMessage, createTask } from '@/app/(dashboard)/dashboard/actions';

export type MessageState = {
  messages: ChatMessage[];
  error: string | null;
  isLoading: boolean;
};

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

  async processMessage(content: string): Promise<{ success: boolean; error?: Error }> {
    this.updateState({ isLoading: true, error: null });

    try {
      // Add user message
      const userMessage: ChatMessage = {
        role: 'user',
        content,
        timestamp: new Date()
      };
      this.state.messages.push(userMessage);

      // Get AI response
      const response = await sendMessage(this.teamId, content);
      console.log('MessageController - AI Response:', response);
      
      if (response.success) {
        const aiMessage: ChatMessage = {
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
          action: response.action
        };
        this.state.messages.push(aiMessage);

        // Handle task creation if needed
        if (response.action?.type === 'create_task') {
          const taskData = response.action.data as Task;
          console.log('MessageController - Creating task:', taskData);
          const result = await createTask(this.teamId, taskData);
          
          if (!result.success) {
            throw new Error(result.error || 'Failed to create task');
          }
        }
      }

      return { success: true };
    } catch (error) {
      console.error('MessageController - Message processing error:', error);
      this.updateState({ 
        error: error instanceof Error ? error.message : 'Failed to process message' 
      });
      return { success: false, error: error instanceof Error ? error : new Error('Failed to process message') };
    } finally {
      this.updateState({ isLoading: false });
    }
  }

  getState(): MessageState {
    return { ...this.state };
  }
} 