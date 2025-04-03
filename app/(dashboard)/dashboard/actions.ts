'use server';

import { db } from '@/lib/db/drizzle';
import { familyAIChats, teamMembers } from '@/lib/db/schema';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import { generateResponse } from '@/lib/ai/service';
import { logger } from '@/lib/ai/logger';
import { ConversationContextManager } from '@/lib/ai/context';

export async function sendMessage(teamId: string, content: string) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' };
    }

    const contextManager = ConversationContextManager.getInstance();
    const context = await contextManager.getContext(session.user.id, teamId);

    // Add user message to context
    await contextManager.addMessage(context, 'user', content);

    // Normal message processing
    const aiResponse = await generateResponse(content, teamId);

    // Store the chat entry
    const [chatEntry] = await db.insert(familyAIChats).values({
      teamId,
      userId: session.user.id,
      message: aiResponse.user.message,
      role: 'assistant',
      status: 'completed',
      timestamp: new Date().toISOString(),
    }).returning();

    return {
      success: true,
      chatEntry
    };
  } catch (error) {
    logger.error('Error in sendMessage:', error);
    return { success: false, error: 'Failed to process message' };
  }
}

export async function getChatHistory(teamId: string) {
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

    // Get the latest 10 messages
    const messages = await db
      .select()
      .from(familyAIChats)
      .where(
        and(
          eq(familyAIChats.teamId, teamId),
          isNull(familyAIChats.deletedAt)
        )
      )
      .orderBy(desc(familyAIChats.timestamp))
      .limit(10);

    return messages.reverse();
  } catch (error) {
    logger.error('Error in getChatHistory:', error);
    throw error;
  }
}
