'use server';

import { db } from '@/lib/db/drizzle';
import { familyAIChats, teamMembers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';
import { generateResponse } from '@/lib/ai/service';

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
    });

    // Generate AI response
    const aiResponse = await generateResponse(content, teamId.toString());

    // Store the AI's response
    if (aiResponse.action) {
      await db.insert(familyAIChats).values({
        teamId,
        userId: session.user.id,
        message: aiResponse.message,
        role: 'assistant',
        action: aiResponse.action,
      });
    }

    revalidatePath('/dashboard');
    return aiResponse;
  } catch (error) {
    console.error('Error in sendMessage:', error);
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