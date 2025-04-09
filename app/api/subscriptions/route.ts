import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { familySubscriptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      );
    }

    const teamSubscriptions = await db
      .select()
      .from(familySubscriptions)
      .where(eq(familySubscriptions.teamId, teamId));

    return NextResponse.json(teamSubscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { teamId, name, monthlyCost, description, url } = await request.json();

    if (!teamId || !name || !monthlyCost) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [newSubscription] = await db
      .insert(familySubscriptions)
      .values({
        teamId,
        name,
        monthlyCost,
        description,
        url,
        createdBy: teamId, // TODO: Get actual user ID from session
      })
      .returning();

    return NextResponse.json(newSubscription);
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    await db.delete(familySubscriptions).where(eq(familySubscriptions.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return NextResponse.json(
      { error: 'Failed to delete subscription' },
      { status: 500 }
    );
  }
} 