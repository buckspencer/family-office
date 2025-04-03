import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { confirmAction } from '@/app/(dashboard)/dashboard/actions';

export async function POST(req: Request) {
  try {
    const { taskId } = await req.json();
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const result = await confirmAction(taskId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in confirm route:', error);
    return NextResponse.json(
      { error: 'Failed to confirm action' },
      { status: 500 }
    );
  }
} 