'use server';

import { db } from '@/lib/db/drizzle';
import { ResourceAction } from '@/lib/resources/base/types';
import { sql } from 'drizzle-orm';
import { familyTasks, familyDocuments, familySubscriptions, familyEvents, taskPriorityEnum, taskStatusEnum, documentStatusEnum, eventStatusEnum } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';
import { NewFamilyTask, NewFamilyDocument, NewFamilySubscription, NewFamilyEvent } from '@/lib/db/schema';

// TODO: Type issues to resolve:
// 1. SQL parameter handling in executeSQL needs proper type safety
// 2. ResourceAction data types need to be properly defined to handle undefined cases
// 3. SQLChunk type casting in sql.join needs to be addressed

// Validation schemas
const TaskDataSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  teamId: z.number(),
  assignedTo: z.string().uuid(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  dueDate: z.string().optional(),
});

const DocumentDataSchema = z.object({
  title: z.string(),
  type: z.string(),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
  teamId: z.number(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional()
});

const SubscriptionDataSchema = z.object({
  name: z.string(),
  monthlyCost: z.number(),
  url: z.string().optional(),
  description: z.string().optional(),
  teamId: z.number(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional()
});

const EventDataSchema = z.object({
  title: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string().optional(),
  location: z.string().optional(),
  attendees: z.array(z.string()).optional(),
  teamId: z.number(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional()
});

export async function executeAction(action: ResourceAction) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    if (!action.data) {
      throw new Error('Action data is required');
    }

    switch (action.type) {
      case 'preview_task':
      case 'preview_document':
      case 'preview_subscription':
      case 'preview_event':
        // Preview actions don't need to do anything
        return { status: 'preview', data: action.data };
        
      case 'create_task':
        if (!action.data.title) {
          throw new Error('Task title is required');
        }
        return await createTask({
          title: action.data.title,
          description: action.data.description,
          teamId: action.data.teamId,
          assignedTo: action.data.assignedTo || session.user.id,
          priority: action.data.priority,
          dueDate: action.data.dueDate
        }, session.user.id);
        
      case 'create_document':
        if (!action.data.title) {
          throw new Error('Document title is required');
        }
        return await createDocument(action.data, session.user.id);
        
      case 'create_subscription':
        if (!action.data.name) {
          throw new Error('Subscription name is required');
        }
        return await createSubscription(action.data, session.user.id);
        
      case 'create_event':
        if (!action.data.title) {
          throw new Error('Event title is required');
        }
        return await createEvent(action.data, session.user.id);
        
      case 'execute_sql':
        if (!action.data.query) {
          throw new Error('SQL query is required');
        }
        return await executeSQL(action.data.query);
        
      case 'execute_stored_procedure':
        if (!action.data.procedureName) {
          throw new Error('Stored procedure name is required');
        }
        return await executeStoredProcedure(action.data.procedureName);
        
      case 'execute_graphql':
        if (!action.data.query) {
          throw new Error('GraphQL query is required');
        }
        return await executeGraphQL(action.data.query, action.data.variables || {});
        
      case 'error':
        throw new Error(action.error);
        
      default:
        throw new Error('Invalid action type');
    }
  } catch (error) {
    console.error('Error executing action:', error);
    throw error;
  }
}

export async function createTask(data: { 
  title: string; 
  description?: string; 
  teamId?: number;
  assignedTo?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
}, userId: string) {
  console.log('Starting createTask with data:', { data, userId });
  
  // Validate input data
  const validatedData = TaskDataSchema.parse({
    ...data,
    assignedTo: data.assignedTo || userId,
    teamId: data.teamId || 2  // Default to team ID 2
  });
  console.log('Validated task data:', validatedData);

  const newTask = {
    title: validatedData.title,
    description: validatedData.description || null,
    status: taskStatusEnum.enumValues[0], // 'pending'
    priority: validatedData.priority,
    assignedTo: validatedData.assignedTo,
    teamId: validatedData.teamId,
    createdBy: userId,
    updatedBy: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null
  };

  console.log('Creating task with data:', newTask);
  try {
    const result = await db.insert(familyTasks).values(newTask).returning();
    console.log('Task creation result:', result);
    return result[0];
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}

async function createDocument(data: any, userId: string) {
  const validatedData = DocumentDataSchema.parse({
    ...data,
    createdBy: userId,
    updatedBy: userId
  });

  const documentData = {
    title: validatedData.title,
    type: validatedData.type,
    content: validatedData.content || null,
    tags: validatedData.tags || null,
    teamId: validatedData.teamId,
    createdBy: validatedData.createdBy,
    updatedBy: validatedData.updatedBy || null,
    status: documentStatusEnum.enumValues[1]
  };

  const result = await db.insert(familyDocuments).values(documentData).returning();
  return result[0];
}

async function createSubscription(data: any, userId: string) {
  const validatedData = SubscriptionDataSchema.parse({
    ...data,
    createdBy: userId,
    updatedBy: userId
  });

  const subscriptionData = {
    name: validatedData.name,
    monthlyCost: validatedData.monthlyCost.toString(),
    url: validatedData.url || null,
    description: validatedData.description || null,
    teamId: validatedData.teamId,
    createdBy: validatedData.createdBy,
    updatedBy: validatedData.updatedBy || null
  };

  const result = await db.insert(familySubscriptions).values(subscriptionData).returning();
  return result[0];
}

async function createEvent(data: any, userId: string) {
  const validatedData = EventDataSchema.parse({
    ...data,
    createdBy: userId,
    updatedBy: userId
  });

  const eventData = {
    title: validatedData.title,
    startDate: new Date(validatedData.startDate),
    endDate: new Date(validatedData.endDate),
    description: validatedData.description || null,
    location: validatedData.location || null,
    attendees: validatedData.attendees || null,
    teamId: validatedData.teamId,
    createdBy: validatedData.createdBy,
    updatedBy: validatedData.updatedBy || null,
    status: eventStatusEnum.enumValues[0]
  };

  const result = await db.insert(familyEvents).values(eventData).returning();
  return result[0];
}

export async function executeSQL(query: string) {
  try {
    return await db.execute(sql.raw(query));
  } catch (error) {
    console.error('Error executing SQL:', error);
    throw error;
  }
}

export async function executeStoredProcedure(procedureName: string) {
  try {
    const query = `CALL ${procedureName}()`;
    return await db.execute(sql.raw(query));
  } catch (error) {
    console.error('Error executing stored procedure:', error);
    throw error;
  }
}

async function executeGraphQL(query: string, variables?: Record<string, unknown>) {
  throw new Error('GraphQL execution not implemented yet');
} 