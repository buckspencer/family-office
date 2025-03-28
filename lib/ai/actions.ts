'use server';

import { db } from '@/lib/db/drizzle';
import { ResourceAction } from '@/lib/resources/base/types';
import { sql } from 'drizzle-orm';
import { familyTasks, familyDocuments, familySubscriptions, familyEvents } from '@/lib/db/schema';

export async function executeAction(action: ResourceAction) {
  try {
    switch (action.type) {
      case 'create_task':
        return await createTask(action.data);
      case 'create_document':
        return await createDocument(action.data);
      case 'create_subscription':
        return await createSubscription(action.data);
      case 'create_event':
        return await createEvent(action.data);
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

async function createTask(data: any) {
  return await db.insert(familyTasks).values({
    title: data.title,
    description: data.description,
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
    priority: data.priority,
    category: data.category,
    assignedTo: data.assignedTo,
    status: 'pending'
  });
}

async function createDocument(data: any) {
  return await db.insert(familyDocuments).values({
    title: data.title,
    type: data.type,
    content: data.content,
    tags: data.tags,
    status: 'active'
  });
}

async function createSubscription(data: any) {
  return await db.insert(familySubscriptions).values({
    name: data.name,
    amount: data.amount,
    frequency: data.frequency,
    category: data.category,
    status: 'active',
    nextBillingDate: calculateNextBillingDate(data.frequency)
  });
}

async function createEvent(data: any) {
  return await db.insert(familyEvents).values({
    title: data.title,
    startDate: new Date(data.startDate),
    endDate: new Date(data.endDate),
    description: data.description,
    location: data.location,
    attendees: data.attendees,
    status: 'scheduled'
  });
}

function calculateNextBillingDate(frequency: string): Date {
  const now = new Date();
  switch (frequency) {
    case 'monthly':
      return new Date(now.setMonth(now.getMonth() + 1));
    case 'quarterly':
      return new Date(now.setMonth(now.getMonth() + 3));
    case 'yearly':
      return new Date(now.setFullYear(now.getFullYear() + 1));
    default:
      throw new Error(`Invalid frequency: ${frequency}`);
  }
}

async function executeSQL(query: string, params?: any[]) {
  // TODO: Add SQL injection protection and query validation
  if (params) {
    const template = query.replace(/\?/g, '${}');
    return await db.execute(sql.raw(template, ...params));
  }
  return await db.execute(sql.raw(query));
}

async function executeStoredProcedure(procedureName: string, params?: any[]) {
  // TODO: Add stored procedure validation
  const paramString = params ? params.map((_, i) => `$${i + 1}`).join(', ') : '';
  const query = `CALL ${procedureName}(${paramString})`;
  return await executeSQL(query, params);
}

async function executeGraphQL(query: string, variables?: Record<string, any>) {
  // TODO: Implement GraphQL execution
  throw new Error('GraphQL execution not implemented yet');
} 