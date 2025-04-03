import { z } from 'zod';
import { ResourceAction } from '../resources/base/types';

// Core chat types
export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  display_data?: any;
  action?: ChatAction;
  isError?: boolean;
  isLoading?: boolean;
  requiresConfirmation?: boolean;
};

export type MessageState = {
  messages: ChatMessage[];
  error?: string;
  isLoading: boolean;
};

export interface AIResponse {
  system: {
    metadata: Record<string, any>;
    db_action?: ResourceAction;
  };
  user: {
    message: string;
  };
  tokensUsed?: number;
}

export type ChatAction = {
  type: 'execute_sql';
  data: {
    query: string;
    params?: any[];
  };
  metadata?: {
    requires_confirmation: boolean;
    action: string;
  };
};

// Resource schemas
export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  assignedTo: z.string().uuid(),
  teamId: z.string().uuid(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  dueDate: z.date().nullable(),
  deletedAt: z.date().nullable()
});

export type Task = z.infer<typeof TaskSchema>;
