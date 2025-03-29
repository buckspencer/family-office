import { z } from 'zod';

// Base schema for all resources
export const BaseResourceSchema = z.object({
  id: z.number(),
  teamId: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
  type: z.string(),
  status: z.string()
});

export type BaseResource = z.infer<typeof BaseResourceSchema>;

// Resource manager interface
export interface ResourceManager<T extends BaseResource> {
  create(data: Partial<T>): Promise<T>;
  update(id: number, data: Partial<T>): Promise<T>;
  delete(id: number): Promise<void>;
  get(id: number): Promise<T | null>;
  list(teamId: number, filters?: Record<string, any>): Promise<T[]>;
  validate(data: any): T;
}

// Resource action types
export type ResourceAction = {
  type: 'execute_sql' | 'execute_stored_procedure' | 'execute_graphql' | 
        'create_task' | 'create_document' | 'create_subscription' | 'create_event' | 
        'preview_task' | 'preview_document' | 'preview_subscription' | 'preview_event' | 
        'error';
  data?: {
    query?: string;
    params?: any[];
    procedureName?: string;
    variables?: Record<string, any>;
    title?: string;
    description?: string;
    dueDate?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    category?: string;
    assignedTo?: string;
    type?: string;
    content?: string;
    tags?: string[];
    name?: string;
    amount?: number;
    frequency?: 'monthly' | 'quarterly' | 'yearly';
    startDate?: string;
    endDate?: string;
    location?: string;
    attendees?: string[];
    requiresConfirmation?: boolean;
    teamId?: number;
  };
  error?: string;
  requiresConfirmation?: boolean;
};

// AI response type
export interface AIResponse {
  message: string;
  action?: ResourceAction;
} 