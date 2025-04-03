import { z } from 'zod';

// Base schema for all resources
export const BaseResourceSchema = z.object({
  id: z.string().uuid(),
  teamId: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().uuid(),
  type: z.string(),
  status: z.string()
});

export type BaseResource = z.infer<typeof BaseResourceSchema>;

// Resource manager interface
export interface ResourceManager<T extends BaseResource> {
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  get(id: string): Promise<T | null>;
  list(teamId: string, filters?: Record<string, any>): Promise<T[]>;
  validate(data: any): T;
}

// Resource action types
export type ResourceAction = {
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

// AI response type
export interface AIResponse {
  message: string;
  action?: ResourceAction;
} 