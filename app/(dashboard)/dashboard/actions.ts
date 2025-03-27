'use server';

import { db } from '@/lib/db/drizzle';
import { familyAIChats, familyTasks, teamMembers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';
import { generateResponse } from '@/lib/ai/service';
import { z } from 'zod';

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
});

export async function createTask(teamId: number, taskData: z.infer<typeof taskSchema>) {
  const session = await getSession();
  if (!session) throw new Error('Not authenticated');

  try {
    console.log('Server action - Creating task with data:', taskData);
    console.log('Server action - User ID:', session.user.id);
    console.log('Server action - Team ID:', teamId);

    // Check if user is a team member
    const teamMember = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.userId, session.user.id),
          eq(teamMembers.teamId, teamId)
        )
      )
      .limit(1);

    console.log('Server action - Team member check:', teamMember);

    if (teamMember.length === 0) {
      throw new Error('User is not a member of this team');
    }

    // Validate task data
    const validatedData = taskSchema.parse(taskData);
    console.log('Server action - Validated task data:', validatedData);

    // Create task in database
    console.log('Server action - Inserting task into database...');
    const [task] = await db.insert(familyTasks).values({
      teamId,
      title: validatedData.title,
      description: validatedData.description || '',
      status: 'pending',
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
      priority: validatedData.priority,
      createdBy: session.user.id,
    }).returning();

    console.log('Server action - Created task:', task);

    // Log activity
    console.log('Server action - Logging activity...');
    await db.insert(familyAIChats).values({
      teamId,
      userId: session.user.id,
      message: `Task "${validatedData.title}" has been created successfully.`,
      role: 'system',
      action: {
        type: 'confirm_action',
        data: task
      }
    });

    revalidatePath('/dashboard/chat');
    return { success: true, task };
  } catch (error) {
    console.error('Server action - Error creating task:', error);
    throw new Error('Failed to create task');
  }
}

export async function sendMessage(teamId: number, message: string) {
  const session = await getSession();
  if (!session) throw new Error('Not authenticated');

  try {
    // Store user message
    await db.insert(familyAIChats).values({
      teamId,
      userId: session.user.id,
      message,
      role: 'user',
    });

    // Get recent chat history for context
    const recentMessages = await db
      .select()
      .from(familyAIChats)
      .where(eq(familyAIChats.teamId, teamId))
      .orderBy(familyAIChats.timestamp)
      .limit(5);

    // Generate AI response
    const aiResponse = await generateResponse(message, recentMessages.map(m => `${m.role}: ${m.message}`).join('\n'));

    // Parse the AI response
    const parsedResponse = JSON.parse(aiResponse);

    // Store AI response with action if present
    await db.insert(familyAIChats).values({
      teamId,
      userId: session.user.id,
      message: parsedResponse.message,
      role: 'assistant',
      action: parsedResponse.action !== 'ignore' ? {
        type: parsedResponse.action,
        data: parsedResponse.data
      } : null
    });

    revalidatePath('/dashboard/chat');
    return { success: true };
  } catch (error) {
    console.error('Error in sendMessage:', error);
    throw new Error('Failed to send message');
  }
}

export async function getChatHistory(teamId: number) {
  const session = await getSession();
  if (!session) throw new Error('Not authenticated');

  try {
    const messages = await db
      .select()
      .from(familyAIChats)
      .where(eq(familyAIChats.teamId, teamId))
      .orderBy(familyAIChats.timestamp);

    return messages;
  } catch (error) {
    console.error('Error in getChatHistory:', error);
    throw new Error('Failed to load chat history');
  }
} 