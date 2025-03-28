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

    // Store the user's message
    await db.insert(familyAIChats).values({
      teamId,
      userId: session.user.id,
      message: content,
      role: 'user',
      status: 'completed',
      timestamp: new Date(),
    });

    // Generate AI response
    const aiResponse: AIResponse = await generateResponse(content, teamId.toString());

    // Store the AI's response
    if (aiResponse.action) {
      // Validate action data
      if (!aiResponse.action.data) {
        console.error('Invalid action data:', aiResponse.action);
        throw new Error('Invalid action data received from AI');
      }

      const requiresConfirmation = aiResponse.action.requiresConfirmation || aiResponse.action.data.requiresConfirmation || true;

      const [chatEntry] = await db.insert(familyAIChats).values({
        teamId,
        userId: session.user.id,
        message: aiResponse.message,
        role: 'assistant',
        status: requiresConfirmation ? 'pending' : 'completed',
        action: aiResponse.action as ResourceAction,
        timestamp: new Date(),
      }).returning();

      // If action doesn't require confirmation, execute it immediately
      if (!requiresConfirmation) {
        await executeAction(aiResponse.action as ResourceAction);
      }

      return { success: true, chatEntry };
    }

    revalidatePath('/dashboard');
    return aiResponse;
  } catch (error) {
    console.error('Error in sendMessage:', error);
    throw error;
  }
}

export async function confirmAction(chatId: number) {
  try {
    const session = await getSession();
    
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    // Get the chat entry
    const [chat] = await db
      .select()
      .from(familyAIChats)
      .where(eq(familyAIChats.id, chatId))
      .limit(1);

    if (!chat) {
      throw new Error('Chat entry not found');
    }

    // Check if user is a team member
    const teamMember = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.userId, session.user.id),
          eq(teamMembers.teamId, chat.teamId)
        )
      )
      .limit(1);

    if (!teamMember.length) {
      throw new Error('User is not a member of this team');
    }

    // Execute the action
    if (chat.action) {
      try {
        await executeAction(chat.action as ResourceAction);
        // Update chat entry status to completed
        await db
          .update(familyAIChats)
          .set({ status: 'completed' })
          .where(eq(familyAIChats.id, chatId));
      } catch (error) {
        console.error('Error executing action:', error);
        // Update chat entry status to failed
        await db
          .update(familyAIChats)
          .set({ 
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          })
          .where(eq(familyAIChats.id, chatId));
        throw error;
      }
    }

    revalidatePath('/dashboard');
  } catch (error) {
    console.error('Error in confirmAction:', error);
    throw error;
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