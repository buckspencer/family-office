import { z } from 'zod';

// Core chat types
export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  display_data?: any;
};

export type MessageState = {
  messages: ChatMessage[];
  error?: string;
  isLoading: boolean;
};

export type AIResponse = {
  system: {
    metadata: Record<string, any>;
    db_action?: {
      query: string;
      params?: any[];
      metadata?: Record<string, any>;
    };
  };
  user: {
    message: string;
    display_data?: any;
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