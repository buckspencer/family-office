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
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
});

export async function createTask(teamId: number, taskData: z.infer<typeof taskSchema>) {
  try {
    console.log('Server action - Starting task creation...');
    console.log('Server action - Team ID:', teamId);
    console.log('Server action - Raw task data:', taskData);
    
    // Get the current user's ID from the session
    const session = await getSession();
    console.log('Server action - Session:', session);
    
    if (!session?.user?.id) {
      console.error('Server action - No user ID in session');
      throw new Error('User not authenticated');
    }

    // Validate task data
    const validatedData = taskSchema.parse(taskData);
    console.log('Server action - Validated task data:', validatedData);

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
      console.error('Server action - User is not a team member');
      throw new Error('User is not a member of this team');
    }

    console.log('Server action - Inserting task into database...');
    const result = await db.insert(familyTasks).values({
      teamId,
      title: validatedData.title,
      description: validatedData.description || '',
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
      priority: validatedData.priority,
      status: validatedData.status,
      createdBy: session.user.id
    }).returning();
    
    console.log('Server action - Task created successfully:', result);

    // Log activity
    console.log('Server action - Logging activity...');
    await db.insert(familyAIChats).values({
      teamId,
      userId: session.user.id,
      message: `Task "${validatedData.title}" has been created successfully.`,
      role: 'system',
      action: {
        type: 'confirm_action',
        data: result[0]
      }
    });

    revalidatePath('/dashboard/chat');
    return { success: true, task: result[0] };
  } catch (error) {
    console.error('Server action - Error creating task:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create task' };
  }
}

export async function sendMessage(teamId: number, content: string) {
  try {
    console.log('Server action - Starting message processing...');
    console.log('Server action - Team ID:', teamId);
    console.log('Server action - Content:', content);
    
    // Get the current user's ID from the session
    const session = await getSession();
    console.log('Server action - Session:', session);
    
    if (!session?.user?.id) {
      console.error('Server action - No user ID in session');
      throw new Error('User not authenticated');
    }

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
      console.error('Server action - User is not a team member');
      throw new Error('User is not a member of this team');
    }

    // Get recent messages for context
    const recentMessages = await db
      .select()
      .from(familyAIChats)
      .where(eq(familyAIChats.teamId, teamId))
      .orderBy(familyAIChats.timestamp)
      .limit(5);

    console.log('Server action - Recent messages:', recentMessages);

    // Save user message
    await db.insert(familyAIChats).values({
      teamId,
      userId: session.user.id,
      message: content,
      role: 'user'
    });

    // Generate AI response
    const aiResponse = await generateResponse(content, recentMessages.map(m => `${m.role}: ${m.message}`).join('\n'));
    console.log('Server action - AI Response:', aiResponse);

    // Create task if needed
    if (aiResponse.action === 'create_task' && aiResponse.data) {
      console.log('Server action - Creating task with data:', aiResponse.data);
      const taskData = {
        ...aiResponse.data,
        status: 'pending' as const,
        priority: aiResponse.data.priority || 'medium' as const
      };
      const taskResult = await createTask(teamId, taskData);
      console.log('Server action - Task creation result:', taskResult);
      
      if (!taskResult.success) {
        throw new Error(taskResult.error || 'Failed to create task');
      }
    }

    // Save AI response
    await db.insert(familyAIChats).values({
      teamId,
      userId: session.user.id,
      message: aiResponse.message,
      role: 'assistant',
      action: aiResponse.action === 'create_task' ? {
        type: aiResponse.action,
        data: aiResponse.data
      } : null
    });

    revalidatePath('/dashboard/chat');
    return { 
      success: true,
      message: aiResponse.message,
      action: aiResponse.action === 'create_task' ? {
        type: aiResponse.action,
        data: aiResponse.data
      } : undefined
    };
  } catch (error) {
    console.error('Server action - Error sending message:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send message' 
    };
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

export async function getTasks(teamId: number) {
  try {
    const tasks = await db
      .select()
      .from(familyTasks)
      .where(eq(familyTasks.teamId, teamId))
      .orderBy(familyTasks.createdAt);

    return { success: true, tasks };
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch tasks' 
    };
  }
} 