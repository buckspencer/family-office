'use server';

import { db } from '@/lib/db/drizzle';
import { ResourceAction } from '@/lib/resources/base/types';
import { sql } from 'drizzle-orm';
import {
  familyTasks,
  familyDocuments,
  familySubscriptions,
  familyEvents,
  familyMemories,
  taskPriorityEnum,
  taskStatusEnum,
  documentStatusEnum,
  eventStatusEnum
} from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';
import { NewFamilyTask, NewFamilyDocument, NewFamilySubscription, NewFamilyEvent } from '@/lib/db/schema';
import { and, eq, inArray } from 'drizzle-orm';
import { logger } from '@/lib/ai/logger';

// TODO: Type issues to resolve:
// 1. SQL parameter handling in executeSQL needs proper type safety
// 2. ResourceAction data types need to be properly defined to handle undefined cases
// 3. SQLChunk type casting in sql.join needs to be addressed

// Validation schemas
const TaskDataSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  teamId: z.string().uuid(),
  assignedTo: z.string().uuid(),
  priority: z.enum(['low', 'medium', 'high', 'urgent'] as const),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled'] as const).default('pending'),
  dueDate: z.string().datetime().optional(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional()
});

const DocumentDataSchema = z.object({
  title: z.string(),
  content: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived', 'deleted'] as const).default('draft'),
  teamId: z.string().uuid(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional()
});

const SubscriptionDataSchema = z.object({
  name: z.string(),
  monthlyCost: z.number(),
  url: z.string().url().optional(),
  description: z.string().optional(),
  teamId: z.string().uuid(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional()
});

const EventDataSchema = z.object({
  title: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  description: z.string().optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled'] as const).default('scheduled'),
  teamId: z.string().uuid(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional()
});

export async function executeAction(dbAction: ResourceAction): Promise<any> {
  logger.info('Executing database action', { dbAction });

  try {
    if (!dbAction.data) {
      throw new Error('Action data is required');
    }

    // Validate the action type
    if (dbAction.type !== 'execute_sql') {
      throw new Error(`Unsupported action type: ${dbAction.type}`);
    }

    // Validate query and params
    const { query, params = [] } = dbAction.data;
    if (!query || typeof query !== 'string') {
      throw new Error('Invalid query: Query must be a non-empty string');
    }

    // Sanitize and validate the query
    const sanitizedQuery = sanitizeQuery(query);
    if (!sanitizedQuery) {
      throw new Error('Invalid or unsafe SQL query');
    }

    // Handle different types of operations using specialized handlers
    const operation = getOperationType(sanitizedQuery);
    logger.info(`Detected operation type: ${operation}`);

    switch (operation) {
      case 'INSERT':
        return await handleInsertOperation(sanitizedQuery, params);
      case 'UPDATE':
        return await handleUpdateOperation(sanitizedQuery, params);
      case 'SELECT':
        return await handleSelectOperation(sanitizedQuery, params);
      case 'DELETE':
        return await handleDeleteOperation(sanitizedQuery, params);
      default:
        throw new Error(`Unsupported SQL operation: ${operation}`);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error('Error executing action: ' + errorMessage);
    throw error;
  }
}

// Helper function to determine the type of SQL operation
function getOperationType(query: string): string {
  const upperQuery = query.trim().toUpperCase();
  if (upperQuery.startsWith('INSERT')) return 'INSERT';
  if (upperQuery.startsWith('UPDATE')) return 'UPDATE';
  if (upperQuery.startsWith('SELECT')) return 'SELECT';
  if (upperQuery.startsWith('DELETE')) return 'DELETE';
  return 'UNKNOWN';
}

// Helper function to sanitize and validate SQL queries
function sanitizeQuery(query: string): string | null {
  // Basic validation
  if (!query || query.length > 2000) {
    return null;
  }

  // Check for dangerous operations
  const upperQuery = query.trim().toUpperCase();
  const blockedPatterns = [
    'DROP', 'TRUNCATE', 'ALTER', 'GRANT', 'REVOKE',
    'CREATE USER', 'CREATE ROLE', 'EXECUTE', 'EXEC',
    'INFORMATION_SCHEMA', 'PG_', 'SYS.'
  ];

  if (blockedPatterns.some(pattern => upperQuery.includes(pattern))) {
    logger.warn('Blocked SQL query containing dangerous pattern', { query });
    return null;
  }

  return query;
}

// Handler for INSERT operations
async function handleInsertOperation(query: string, params: any[]): Promise<any> {
  logger.info('Handling INSERT operation');

  // Handle specific table inserts with specialized logic
  if (query.toLowerCase().includes('insert into family_tasks')) {
    return await handleTaskCreation(params);
  } else if (query.toLowerCase().includes('insert into family_events')) {
    return await handleEventCreation(params);
  } else if (query.toLowerCase().includes('insert into family_subscriptions')) {
    return await handleSubscriptionCreation(params);
  } else if (query.toLowerCase().includes('insert into family_memories')) {
    return await handleMemoryCreation(params);
  }

  // For other inserts, use the general SQL execution
  return await executeSQL(query, params);
}

// Handler for task creation
async function handleTaskCreation(params: any[]): Promise<any> {
  logger.info('Creating a new task');

  try {
    const task = {
      title: params[1] || '', // title
      description: params[2] || null, // description
      teamId: params[0] || '', // teamId
      status: params[3] || 'pending', // status
      priority: params[4] || 'medium', // priority
      dueDate: params[5] ? new Date(params[5]).toISOString() : null, // dueDate
      assignedTo: params[6] || '', // assignedTo
      createdBy: params[7] || '', // createdBy
      updatedBy: params[8] || null // updatedBy
    } satisfies NewFamilyTask;

    // Validate task data
    if (!task.title || !task.teamId || !task.assignedTo || !task.createdBy) {
      throw new Error('Missing required fields for task creation');
    }

    const result = await db.insert(familyTasks).values(task).returning();
    return result[0];
  } catch (error) {
    logger.error('Error creating task:', error);
    throw error;
  }
}

// Handler for event creation
async function handleEventCreation(params: any[]): Promise<any> {
  logger.info('Creating a new event');

  try {
    // Map params to event object based on your SQL query structure
    const event = {
      teamId: params[0] || '', // teamId
      title: params[1] || '', // title
      description: params[2] || null, // description
      startDate: params[3] ? new Date(params[3]).toISOString() : null, // startDate
      endDate: params[4] ? new Date(params[4]).toISOString() : null, // endDate
      status: params[5] || 'scheduled', // status
      createdBy: params[6] || '', // createdBy
      updatedBy: params[7] || null // updatedBy
    } satisfies NewFamilyEvent;

    // Validate event data
    if (!event.title || !event.teamId || !event.startDate || !event.endDate || !event.createdBy) {
      throw new Error('Missing required fields for event creation');
    }

    const result = await db.insert(familyEvents).values(event).returning();
    return result[0];
  } catch (error) {
    logger.error('Error creating event:', error);
    throw error;
  }
}

// Handler for subscription creation
async function handleSubscriptionCreation(params: any[]): Promise<any> {
  logger.info('Creating a new subscription');

  try {
    const subscription = {
      teamId: params[0] || '', // teamId
      name: params[1] || '', // name
      url: params[2] || null, // url
      monthlyCost: params[3] ? params[3].toString() : '0', // monthlyCost
      description: params[4] || null, // description
      createdBy: params[5] || '', // createdBy
      updatedBy: params[6] || null // updatedBy
    } satisfies NewFamilySubscription;

    // Validate subscription data
    if (!subscription.name || !subscription.teamId || !subscription.createdBy) {
      throw new Error('Missing required fields for subscription creation');
    }

    const result = await db.insert(familySubscriptions).values(subscription).returning();
    return result[0];
  } catch (error) {
    logger.error('Error creating subscription:', error);
    throw error;
  }
}

// Handler for memory creation
async function handleMemoryCreation(params: any[]): Promise<any> {
  // Implement memory creation logic
  return await executeSQL(`INSERT INTO family_memories (team_id, category, key, value, context, importance, created_by)
                          VALUES ($1, $2, $3, $4, $5, $6, $7)`, params);
}

// Handler for UPDATE operations
async function handleUpdateOperation(query: string, params: any[]): Promise<any> {
  logger.info('Handling UPDATE operation');

  // Handle task updates specifically
  if (query.toLowerCase().includes('update family_tasks')) {
    logger.info('Handling task update operation');

    // Check if we have enough parameters
    if (params.length < 3) {
      throw new Error(`Missing parameters for task update. Expected at least 3 params, got ${params.length}`);
    }

    // Extract the task ID and team ID
    let taskId, teamId, updatedBy;

    // Try to find the parameters based on the query structure
    if (query.includes('WHERE id =')) {
      // The query is likely in the format: UPDATE family_tasks SET ... WHERE id = $x AND team_id = $y
      // Find the parameter index for id and team_id
      const idParamMatch = query.match(/WHERE\s+id\s*=\s*\$(\d+)/i);
      const teamIdParamMatch = query.match(/AND\s+team_id\s*=\s*\$(\d+)/i);

      if (idParamMatch && teamIdParamMatch) {
        const idParamIndex = parseInt(idParamMatch[1]) - 1; // Convert from 1-based to 0-based
        const teamIdParamIndex = parseInt(teamIdParamMatch[1]) - 1;

        // Get the values from the params array
        taskId = params[idParamIndex];
        teamId = params[teamIdParamIndex];

        // Find the updated_by parameter
        const updatedByParamMatch = query.match(/updated_by\s*=\s*\$(\d+)/i);
        if (updatedByParamMatch) {
          const updatedByParamIndex = parseInt(updatedByParamMatch[1]) - 1;
          updatedBy = params[updatedByParamIndex];
        } else {
          // If not found, use the first parameter as a fallback
          updatedBy = params[0];
        }
      }
    }

    // If we couldn't extract the parameters from the query, use default positions
    if (!taskId || !teamId) {
      // Log the params array to help with debugging
      logger.info('Parameters array:', { params });

      // Check if params array has enough elements
      if (params.length < 3) {
        // Handle the case where we don't have enough parameters
        logger.error('Not enough parameters for task update');

        // Try to find the task by title if params[1] is missing
        if (!params[1] && params[0] && typeof params[0] === 'string') {
          // The first parameter might be the task title
          const taskTitle = params[0];
          logger.info('Trying to find task by title:', { taskTitle });

          try {
            // Find the task by title
            const tasks = await db.select()
              .from(familyTasks)
              .where(
                and(
                  eq(familyTasks.teamId, params[params.length - 1] || ''),
                  like(familyTasks.title, `%${taskTitle}%`)
                )
              )
              .limit(1);

            if (tasks.length > 0) {
              taskId = tasks[0].id;
              teamId = tasks[0].teamId;
              updatedBy = params[0];
              logger.info('Found task by title:', { taskId, teamId, title: tasks[0].title });
            } else {
              throw new Error(`Could not find task with title containing "${taskTitle}"`);
            }
          } catch (error) {
            logger.error('Error finding task by title:', error);
            throw new Error(`Could not find task parameters: ${error.message}`);
          }
        } else {
          throw new Error('Not enough parameters for task update');
        }
      } else {
        // Use default positions if we have enough parameters
        updatedBy = params[0];
        taskId = params[1];
        teamId = params[2];
      }
    }

    logger.info('Extracted parameters for task update:', { updatedBy, taskId, teamId });

    // Determine what fields to update based on the query
    const updateFields: any = {
      updatedBy,
      updatedAt: new Date().toISOString()
    };

    // Check if we're updating the status
    if (query.toLowerCase().includes("status = 'cancelled'")) {
      updateFields.status = 'cancelled';
    } else if (query.match(/status\s*=\s*\$(\d+)/i)) {
      const statusParamMatch = query.match(/status\s*=\s*\$(\d+)/i);
      if (statusParamMatch) {
        const statusParamIndex = parseInt(statusParamMatch[1]) - 1;
        updateFields.status = params[statusParamIndex];
      }
    }

    // Update the task using Drizzle
    try {
      const result = await db.update(familyTasks)
        .set(updateFields)
        .where(
          and(
            eq(familyTasks.id, taskId),
            eq(familyTasks.teamId, teamId)
          )
        )
        .returning();

      return result;
    } catch (error) {
      logger.error('Error updating task:', error);
      throw error;
    }
  }

  // For other updates, use the general SQL execution
  return await executeSQL(query, params);
}

// Handler for SELECT operations
async function handleSelectOperation(query: string, params: any[]): Promise<any> {
  logger.info('Handling SELECT operation');
  return await executeSQL(query, params);
}

// Handler for DELETE operations
async function handleDeleteOperation(query: string, params: any[]): Promise<any> {
  logger.info('Handling DELETE operation');
  logger.info('Delete parameters:', { params });

  // For safety, we'll implement soft deletes by updating the deleted_at field
  if (query.toLowerCase().includes('delete from family_tasks')) {
    // Check if we have enough parameters
    if (params.length < 1) {
      throw new Error('Not enough parameters for task deletion');
    }

    // If the first parameter is a string, it might be a task title
    if (typeof params[0] === 'string' && isNaN(parseInt(params[0]))) {
      const taskTitle = params[0];
      const teamId = params.length > 1 ? params[1] : null;

      logger.info('Searching for task by title for deletion:', { taskTitle, teamId });

      // Find tasks that match the title
      const tasks = await db.select()
        .from(familyTasks)
        .where(
          and(
            teamId ? eq(familyTasks.teamId, teamId) : undefined,
            like(familyTasks.title, `%${taskTitle}%`),
            isNull(familyTasks.deletedAt)
          )
        )
        .limit(1);

      if (tasks.length > 0) {
        // Use the first matching task
        const task = tasks[0];
        logger.info('Found task by title for deletion:', { task });

        // Soft delete the task
        return await db.update(familyTasks)
          .set({
            deletedAt: new Date().toISOString(),
            status: 'cancelled',
            updatedBy: params[params.length - 1] || task.createdBy
          })
          .where(
            and(
              eq(familyTasks.id, task.id),
              eq(familyTasks.teamId, task.teamId)
            )
          )
          .returning();
      } else {
        throw new Error(`No tasks found matching title "${taskTitle}"`);
      }
    } else {
      // Use the parameters directly
      const taskId = params[0];
      const teamId = params.length > 1 ? params[1] : null;

      const whereConditions = [];
      whereConditions.push(eq(familyTasks.id, taskId));
      if (teamId) {
        whereConditions.push(eq(familyTasks.teamId, teamId));
      }

      return await db.update(familyTasks)
        .set({
          deletedAt: new Date().toISOString(),
          status: 'cancelled',
          updatedBy: params[params.length - 1] || null
        })
        .where(and(...whereConditions))
        .returning();
    }
  } else if (query.toLowerCase().includes('delete from family_events')) {
    return await executeSQL(
      `UPDATE family_events SET deleted_at = NOW() WHERE id = $1 AND team_id = $2`,
      [params[0], params[1]]
    );
  } else if (query.toLowerCase().includes('delete from family_subscriptions')) {
    return await executeSQL(
      `UPDATE family_subscriptions SET deleted_at = NOW() WHERE id = $1 AND team_id = $2`,
      [params[0], params[1]]
    );
  } else if (query.toLowerCase().includes('delete from family_memories')) {
    return await executeSQL(
      `UPDATE family_memories SET deleted_at = NOW() WHERE id = $1 AND team_id = $2`,
      [params[0], params[1]]
    );
  }

  // For other tables, use the general SQL execution
  return await executeSQL(query, params);
}

async function createTask(data: ResourceAction): Promise<NewFamilyTask> {
  const validatedData = TaskDataSchema.parse(data.data);
  const task = {
    title: validatedData.title,
    description: validatedData.description || null,
    status: validatedData.status,
    priority: validatedData.priority,
    assignedTo: validatedData.assignedTo,
    teamId: validatedData.teamId,
    createdBy: validatedData.createdBy,
    updatedBy: validatedData.updatedBy || null,
    dueDate: validatedData.dueDate ? new Date(validatedData.dueDate).toISOString() : null,
  } satisfies NewFamilyTask;

  const result = await db.insert(familyTasks).values(task).returning();
  return result[0];
}

async function createDocument(data: ResourceAction): Promise<NewFamilyDocument> {
  const validatedData = DocumentDataSchema.parse(data.data);
  const document = {
    title: validatedData.title,
    content: validatedData.content || null,
    status: validatedData.status,
    teamId: validatedData.teamId,
    createdBy: validatedData.createdBy,
    updatedBy: validatedData.updatedBy || null,
  } satisfies NewFamilyDocument;

  const result = await db.insert(familyDocuments).values(document).returning();
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

async function createEvent(data: ResourceAction): Promise<NewFamilyEvent> {
  const validatedData = EventDataSchema.parse(data.data);
  const event = {
    title: validatedData.title,
    startDate: new Date(validatedData.startDate),
    endDate: new Date(validatedData.endDate),
    description: validatedData.description || null,
    status: validatedData.status,
    teamId: validatedData.teamId,
    createdBy: validatedData.createdBy,
    updatedBy: validatedData.updatedBy || null,
  } satisfies NewFamilyEvent;

  const result = await db.insert(familyEvents).values(event).returning();
  return result[0];
}

async function executeSQL(query: string, params: any[] = []): Promise<any> {
  try {
    logger.info('Executing SQL query:', { query, params });

    // Handle UPDATE operations for tasks
    if (query.includes('UPDATE family_tasks') && query.includes('status =')) {
      // First, try to find the task by title if we don't have enough parameters
      if (params.length < 2) {
        logger.info('Not enough parameters for task update, trying to find by title');

        // Try to find the task by title
        if (params.length > 0 && typeof params[0] === 'string') {
          const taskTitle = params[0];
          const teamIdParam = params.length > 1 ? params[1] : null;

          logger.info('Searching for task by title:', { taskTitle, teamIdParam });

          // Find tasks that match the title
          const tasks = await db.select()
            .from(familyTasks)
            .where(
              and(
                teamIdParam ? eq(familyTasks.teamId, teamIdParam) : undefined,
                like(familyTasks.title, `%${taskTitle}%`),
                isNull(familyTasks.deletedAt)
              )
            )
            .limit(5);

          if (tasks.length > 0) {
            // Use the first matching task
            const task = tasks[0];
            logger.info('Found task by title:', { task });

            // Update the task
            const result = await db.update(familyTasks)
              .set({
                status: 'cancelled',
                updatedBy: params[0],
                updatedAt: new Date().toISOString()
              })
              .where(
                and(
                  eq(familyTasks.id, task.id),
                  eq(familyTasks.teamId, task.teamId)
                )
              )
              .returning();

            return result;
          } else {
            throw new Error(`No tasks found matching title "${taskTitle}"`);
          }
        } else {
          throw new Error(`Missing parameters for task update. Expected at least 2 params, got ${params.length}`);
        }
      }

      // If we have enough parameters, use them directly
      const updatedBy = params[0];
      const taskId = params[1];
      const teamId = params.length > 2 ? params[2] : null;

      logger.info('Updating task status:', { updatedBy, taskId, teamId });

      // Build the where clause
      const whereConditions = [];
      whereConditions.push(eq(familyTasks.id, taskId));
      if (teamId) {
        whereConditions.push(eq(familyTasks.teamId, teamId));
      }

      // Update the task using Drizzle
      const result = await db.update(familyTasks)
        .set({
          status: 'cancelled',
          updatedBy: updatedBy,
          updatedAt: new Date().toISOString()
        })
        .where(and(...whereConditions))
        .returning();

      return result;
    }

    // For task queries, use Drizzle's query builder
    if (query.includes('family_tasks')) {
      const conditions = [];
      if (query.includes('teamId')) {
        conditions.push(eq(familyTasks.teamId, params[0]));
      }
      if (query.includes("status != 'completed'")) {
        conditions.push(sql`${familyTasks.status} != 'completed'`);
      }
      if (query.includes('ORDER BY dueDate')) {
        const tasks = await db.select().from(familyTasks)
          .where(and(...conditions))
          .orderBy(familyTasks.dueDate);

        // Format tasks for display
        return tasks.map(task => ({
          title: task.title,
          description: task.description || 'No description',
          dueDate: task.dueDate ? new Date(task.dueDate).toLocaleString() : 'No due date',
          status: task.status,
          priority: task.priority,
          isOverdue: task.dueDate && new Date(task.dueDate) < new Date()
        }));
      }
    }

    // For document queries
    if (query.includes('family_documents')) {
      const conditions = [];
      if (query.includes('teamId')) {
        conditions.push(eq(familyDocuments.teamId, params[0]));
      }
      if (query.includes("status != 'deleted'")) {
        conditions.push(sql`${familyDocuments.status} != 'deleted'`);
      }
      const documents = await db.select().from(familyDocuments)
        .where(and(...conditions));

      return documents.map(doc => ({
        title: doc.title,
        content: doc.content || 'No content',
        status: doc.status,
        createdAt: new Date(doc.createdAt).toLocaleString()
      }));
    }

    // For subscription queries
    if (query.includes('family_subscriptions')) {
      const conditions = [];
      if (query.includes('teamId')) {
        conditions.push(eq(familySubscriptions.teamId, params[0]));
      }
      const subscriptions = await db.select().from(familySubscriptions)
        .where(and(...conditions));

      return subscriptions.map(sub => ({
        name: sub.name,
        monthlyCost: sub.monthlyCost,
        url: sub.url || 'No URL',
        description: sub.description || 'No description'
      }));
    }

    // For event queries
    if (query.includes('family_events')) {
      const conditions = [];
      if (query.includes('teamId')) {
        conditions.push(eq(familyEvents.teamId, params[0]));
      }
      if (query.includes("status != 'cancelled'")) {
        conditions.push(sql`${familyEvents.status} != 'cancelled'`);
      }
      const events = await db.select().from(familyEvents)
        .where(and(...conditions));

      return events.map(event => ({
        title: event.title,
        startDate: new Date(event.startDate).toLocaleString(),
        endDate: new Date(event.endDate).toLocaleString(),
        description: event.description || 'No description',
        status: event.status
      }));
    }

    // For any other queries, use raw SQL
    const sqlQuery = sql.raw(query);
    const result = await db.execute(sqlQuery);
    return result;
  } catch (error) {
    logger.error('Error executing SQL query:', error);
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
