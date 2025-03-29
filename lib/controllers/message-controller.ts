import { ChatMessage, Task, ChatAction } from '@/lib/types/chat';
import { sendMessage } from '@/app/(dashboard)/dashboard/actions';
import { createTask } from '@/lib/ai/actions';
import { AIResponse, ResourceAction } from '@/lib/resources/base/types';

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

  private convertResourceActionToChatAction(action: ResourceAction): ChatAction {
    return {
      type: action.type === 'create_task' ? 'create_task' : 'ignore',
      data: action.data
    };
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
      
      if ('message' in response) {
        const aiMessage: ChatMessage = {
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
          action: response.action ? this.convertResourceActionToChatAction(response.action) : undefined
        };
        this.state.messages.push(aiMessage);

        // Handle any actions
        if (response.action?.type === 'create_task' && response.action.data) {
          const taskData = {
            title: response.action.data.title || 'New Task',
            description: response.action.data.description,
            teamId: this.teamId
          };
          const result = await createTask(taskData, this.teamId.toString());
          if (result) {
            const taskMessage: ChatMessage = {
              role: 'system',
              content: `Task created: ${taskData.title}`,
              timestamp: new Date()
            };
            this.state.messages.push(taskMessage);
          }
        }
      } else if (response.success && response.chatEntry) {
        const aiMessage: ChatMessage = {
          role: 'assistant',
          content: response.chatEntry.message,
          timestamp: response.chatEntry.timestamp,
          action: response.chatEntry.action ? this.convertResourceActionToChatAction(response.chatEntry.action as ResourceAction) : undefined
        };
        this.state.messages.push(aiMessage);
      }

      this.updateState({ isLoading: false });
      return { success: true };
    } catch (error) {
      this.updateState({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'An error occurred' 
      });
      return { success: false, error: error instanceof Error ? error : new Error('An error occurred') };
    }
  }

  getState(): MessageState {
    return { ...this.state };
  }
} 