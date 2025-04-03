import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db/drizzle';
import { familyAIChats, teamMembers } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { generateResponse } from '@/lib/ai/service';
import { executeAction } from '@/lib/ai/actions';
import { createPrompt, parseAIResponse } from '@/lib/ai/prompt';
import { ConversationContext } from '@/lib/ai/context';
import { sendMessage } from '@/app/(dashboard)/dashboard/actions';
import type { FamilyAIChat } from '@/lib/db/schema';
import type { ResourceAction } from '@/lib/resources/base/types';

export async function POST(req: Request) {
  try {
    const { message, context } = await req.json();
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Send message and get response
    const result = await sendMessage(context.teamId, message);

    if (!result.success || !result.chatEntry) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    const chatEntry = result.chatEntry as FamilyAIChat;
    const action = chatEntry.action as ResourceAction | undefined;

    // Return the chat entry with the full message history
    return NextResponse.json({
      message: chatEntry.message,
      result: action?.data,
      chatEntry
    });
  } catch (error) {
    console.error('Error in chat route:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
} 