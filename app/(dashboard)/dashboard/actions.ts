'use server';

import { db } from '@/lib/db/drizzle';
import { familyAIChats } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';
import { generateResponse } from '@/lib/ai/service';

export async function sendMessage(teamId: number, message: string) {
  const session = await getSession();
  if (!session) throw new Error('Not authenticated');

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

  // Store AI response
  await db.insert(familyAIChats).values({
    teamId,
    userId: session.user.id,
    message: aiResponse,
    role: 'assistant',
  });

  revalidatePath('/dashboard');
  return { success: true };
}

export async function getChatHistory(teamId: number) {
  const session = await getSession();
  if (!session) throw new Error('Not authenticated');

  const messages = await db
    .select()
    .from(familyAIChats)
    .where(eq(familyAIChats.teamId, teamId))
    .orderBy(familyAIChats.timestamp);

  return messages;
} 