import { z } from 'zod';

export const TaskPrioritySchema = z.enum(['high', 'medium', 'low']);
export const TaskStatusSchema = z.enum(['pending', 'in_progress', 'completed', 'cancelled']);
export const DocumentStatusSchema = z.enum(['draft', 'active', 'archived', 'deleted']);
export const EventStatusSchema = z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']);

export const TaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: TaskPrioritySchema.default('medium'),
  status: TaskStatusSchema.default('pending'),
});

export const SubscriptionSchema = z.object({
  name: z.string().min(1),
  url: z.string().url().optional(),
  monthlyCost: z.number().min(0),
  description: z.string().optional(),
});

export const EventSchema = z.object({
  title: z.string().min(1),
  date: z.string(),
  type: z.string().min(1),
  description: z.string().optional(),
  recurring: z.boolean().default(false),
});

export const DocumentSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  status: DocumentStatusSchema.default('draft'),
});

export const MemorySchema = z.object({
  category: z.string().min(1),
  key: z.string().min(1),
  value: z.string().min(1),
  context: z.string().optional(),
  importance: z.number().min(1).max(5).default(1),
});

export const FormDataSchema = z.object({
  type: z.enum(['task', 'subscription', 'event', 'document', 'memory']),
  data: z.union([
    TaskSchema,
    SubscriptionSchema,
    EventSchema,
    DocumentSchema,
    MemorySchema
  ]),
  metadata: z.record(z.any()).optional(),
});

export const DBActionSchema = z.object({
  operation: z.enum(['READ', 'WRITE', 'UPDATE', 'DELETE']),
  table: z.string(),
  query: z.string(),
  params: z.array(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
});

export const AIResponseSchema = z.object({
  system: z.object({
    db_action: DBActionSchema.optional(),
    form_data: FormDataSchema.optional(),
    metadata: z.record(z.any()).optional(),
  }),
  user: z.object({
    message: z.string(),
    display_data: z.any().optional(),
  }),
});

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  timestamp: z.date(),
  display_data: z.any().optional(),
});

export type Task = z.infer<typeof TaskSchema>;
export type Subscription = z.infer<typeof SubscriptionSchema>;
export type Event = z.infer<typeof EventSchema>;
export type Document = z.infer<typeof DocumentSchema>;
export type Memory = z.infer<typeof MemorySchema>;
export type FormData = z.infer<typeof FormDataSchema>;
export type DBAction = z.infer<typeof DBActionSchema>;
export type AIResponse = z.infer<typeof AIResponseSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export interface MessageState {
  messages: ChatMessage[];
  error: string | null;
  isLoading: boolean;
} 