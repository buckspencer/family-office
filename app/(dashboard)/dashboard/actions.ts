'use server';

import { db } from '@/lib/db/drizzle';
import { familyAIChats, teamMembers, familyTasks } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';
import { generateResponse } from '@/lib/ai/service';
import { executeAction } from '@/lib/ai/actions';
import { ResourceAction, AIResponse } from '@/lib/resources/base/types';

export async function sendMessage(teamId: number, content: string) {
  try {
    console.log('Starting sendMessage with:', { teamId, content });
    const session = await getSession();
    
    if (!session?.user?.id) {
      console.error('No authenticated user found');
      return { success: false, error: 'Not authenticated' };
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

    if (!teamMember.length) {
      console.error('User is not a member of this team');
      return { success: false, error: 'User is not a member of this team' };
    }

    // Store the user's message
    const userChatEntry = await db.insert(familyAIChats).values({
      teamId,
      userId: session.user.id,
      message: content,
      role: 'user',
      status: 'completed',
      timestamp: new Date(),
    }).returning();

    console.log('Stored user message:', { userChatEntry });

    // Generate AI response
    const aiResponse: AIResponse = await generateResponse(content, teamId.toString());
    console.log('Generated AI response:', { aiResponse });

    // Store the AI's response
    let chatEntry;
    if (aiResponse.action) {
      // Validate action data
      if (!aiResponse.action.data) {
        console.error('Invalid action data:', aiResponse.action);
        throw new Error('Invalid action data received from AI');
      }

      const requiresConfirmation = aiResponse.action.requiresConfirmation || aiResponse.action.data.requiresConfirmation || true;

      // Ensure the action data has the correct user ID and team ID
      const actionData = {
        ...aiResponse.action.data,
        assignedTo: session.user.id,
        teamId: teamId,
        requiresConfirmation: requiresConfirmation
      };

      const [newChatEntry] = await db.insert(familyAIChats).values({
        teamId,
        userId: session.user.id,
        message: aiResponse.message,
        role: 'assistant',
        status: 'pending',
        action: {
          type: aiResponse.action.type,
          data: actionData,
          requiresConfirmation: requiresConfirmation
        },
        timestamp: new Date(),
      }).returning();

      chatEntry = newChatEntry;

      // If action doesn't require confirmation, execute it immediately
      if (!requiresConfirmation) {
        console.log('Executing action immediately:', { action: aiResponse.action });
        try {
          const result = await executeAction({
            type: aiResponse.action.type,
            data: {
              ...actionData,
              requiresConfirmation: false
            },
            requiresConfirmation: false
          } as ResourceAction);
          console.log('Action execution result:', { result });
          
          // Update chat entry status
          await db.update(familyAIChats)
            .set({ status: 'completed' })
            .where(eq(familyAIChats.id, newChatEntry.id));
          
          console.log('Updated chat entry status to completed');
        } catch (error) {
          console.error('Error executing action:', error);
          // Update chat entry status to error
          await db.update(familyAIChats)
            .set({ status: 'error' })
            .where(eq(familyAIChats.id, newChatEntry.id));
          throw error;
        }
      }
    } else {
      // Store the AI's response without an action
      const [newChatEntry] = await db.insert(familyAIChats).values({
        teamId,
        userId: session.user.id,
        message: aiResponse.message,
        role: 'assistant',
        status: 'completed',
        timestamp: new Date(),
      }).returning();
      chatEntry = newChatEntry;
    }

    revalidatePath('/dashboard');
    return { success: true, chatEntry };
  } catch (error) {
    console.error('Error in sendMessage:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function confirmAction(entryId: number) {
  console.log('Starting action confirmation for entry:', entryId);
  
  try {
    const entry = await db.query.familyAIChats.findFirst({
      where: eq(familyAIChats.id, entryId),
    });
    
    if (!entry) {
      console.error('Chat entry not found:', entryId);
      return { success: false, error: 'Chat entry not found' };
    }
    
    console.log('Found chat entry:', entry);
    
    if (!entry.action) {
      console.error('No action found in chat entry:', entryId);
      return { success: false, error: 'No action found' };
    }
    
    const action = entry.action as ResourceAction;
    console.log('Processing action:', action);
    
    // Execute the action based on its type
    switch (action.type) {
      case 'create_task':
        console.log('Creating task from action:', action.data);
        if (!action.data?.title || !action.data.assignedTo || !action.data.teamId) {
          console.error('Missing required fields for task creation:', action.data);
          return { success: false, error: 'Missing required fields for task creation' };
        }
        await createTask({
          title: action.data.title,
          description: action.data.description,
          dueDate: action.data.dueDate,
          priority: action.data.priority,
          assignedTo: action.data.assignedTo,
          teamId: action.data.teamId
        });
        break;
      // Add other action types here
      default:
        console.error('Unsupported action type:', action.type);
        return { success: false, error: 'Unsupported action type' };
    }
    
    // Update the chat entry status
    await updateChatEntry(entryId, 'completed');
    console.log('Action confirmed successfully');
    
    return { success: true };
  } catch (error) {
    console.error('Error confirming action:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getChatHistory(teamId: number) {
  try {
    const session = await getSession();
    
    if (!session?.user?.id) {
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

    if (!teamMember.length) {
      throw new Error('User is not a member of this team');
    }

    return await db
      .select()
      .from(familyAIChats)
      .where(eq(familyAIChats.teamId, teamId))
      .orderBy(familyAIChats.timestamp);
  } catch (error) {
    console.error('Error in getChatHistory:', error);
    throw error;
  }
}

export async function getTasks(teamId: number) {
  try {
    const session = await getSession();
    
    if (!session?.user?.id) {
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

    if (!teamMember.length) {
      throw new Error('User is not a member of this team');
    }

    return await db
      .select()
      .from(familyTasks)
      .where(eq(familyTasks.teamId, teamId))
      .orderBy(familyTasks.dueDate);
  } catch (error) {
    console.error('Error in getTasks:', error);
    throw error;
  }
}

export async function createTask(taskData: {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: string;
  assignedTo: string;
  teamId: number;
}) {
  console.log('Starting task creation with data:', taskData);
  
  try {
    const result = await db.insert(familyTasks).values({
      title: taskData.title,
      description: taskData.description || '',
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
      priority: taskData.priority as 'low' | 'medium' | 'high' || 'medium',
      status: 'pending',
      assignedTo: taskData.assignedTo,
      teamId: taskData.teamId,
      createdBy: taskData.assignedTo,
      updatedBy: taskData.assignedTo
    }).returning();
    
    console.log('Task created successfully:', result[0]);
    return result[0];
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}

export async function updateChatEntry(entryId: number, status: 'pending' | 'completed' | 'error') {
  console.log('Updating chat entry:', { entryId, status });
  
  try {
    const result = await db
      .update(familyAIChats)
      .set({ status })
      .where(eq(familyAIChats.id, entryId))
      .returning();
    
    console.log('Chat entry updated successfully:', result[0]);
    return result[0];
  } catch (error) {
    console.error('Error updating chat entry:', error);
    throw error;
  }
} 