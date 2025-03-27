import { z } from 'zod';

export const TaskPrioritySchema = z.enum(['high', 'medium', 'low']);
export const TaskStatusSchema = z.enum(['pending', 'in_progress', 'completed', 'cancelled']);

export const TaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: TaskPrioritySchema.default('medium'),
  status: TaskStatusSchema.default('pending'),
});

export const ChatActionSchema = z.object({
  type: z.enum([
    'create_task',
    'confirm_action',
    'ignore',
    'error'
  ]),
  data: z.any().optional(),
});

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  timestamp: z.date(),
  action: ChatActionSchema.optional(),
});

export type Task = z.infer<typeof TaskSchema>;
export type ChatAction = z.infer<typeof ChatActionSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>; 