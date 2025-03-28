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
  dueDate: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  category: z.string().optional(),
  assignedTo: z.string().uuid().optional(),
  teamId: z.number(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional()
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
      case 'create_task':
        return await createTask(action.data, session.user.id);
      case 'create_document':
        return await createDocument(action.data, session.user.id);
      case 'create_subscription':
        return await createSubscription(action.data, session.user.id);
      case 'create_event':
        return await createEvent(action.data, session.user.id);
      case 'execute_sql':
        return await executeSQL(action.data.query, action.data.params);
      case 'execute_stored_procedure':
        return await executeStoredProcedure(action.data.procedureName, action.data.params);
      case 'execute_graphql':
        return await executeGraphQL(action.data.query, action.data.variables);
      case 'error':
        throw new Error(action.error);
    }
  } catch (error) {
    console.error('Error executing action:', error);
    throw error;
  }
}

async function createTask(data: any, userId: string) {
  const validatedData = TaskDataSchema.parse({
    ...data,
    createdBy: userId,
    updatedBy: userId
  });

  const taskData = {
    title: validatedData.title,
    description: validatedData.description || null,
    dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
    priority: validatedData.priority || null,
    category: validatedData.category || null,
    assignedTo: validatedData.assignedTo || userId,
    teamId: validatedData.teamId,
    createdBy: validatedData.createdBy,
    updatedBy: validatedData.updatedBy || null,
    status: taskStatusEnum.enumValues[0]
  };

  const result = await db.insert(familyTasks).values(taskData).returning();
  return result[0];
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

async function executeSQL(query: string, params?: unknown[]) {
  if (!params) {
    return await db.execute(sql.raw(query));
  }

  const paramPlaceholders = params.map((_, i) => `$${i + 1}`).join(', ');
  const template = query.replace(/\?/g, () => paramPlaceholders);
  const sqlQuery = sql.raw(template);
  const sqlParams = params.map(param => sql.raw(String(param)));
  const sqlParamsArray = sqlParams.reduce((acc, param) => [...acc, param], [] as unknown[]);
  return await db.execute(sql`${sqlQuery} ${sql.join(sqlParamsArray, sql`, `)}`);
}

async function executeStoredProcedure(procedureName: string, params?: unknown[]) {
  const paramString = params ? params.map((_, i) => `$${i + 1}`).join(', ') : '';
  const query = `CALL ${procedureName}(${paramString})`;
  return await executeSQL(query, params);
}

async function executeGraphQL(query: string, variables?: Record<string, unknown>) {
  throw new Error('GraphQL execution not implemented yet');
} 