import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    // Create a server client that can access cookies
    const serverClient = await createServerClient();
    
    // Use getUser() for more security instead of getSession()
    const { data: { user }, error } = await serverClient.auth.getUser();
    
    if (error || !user) {
      console.error('Error getting Supabase user:', error);
      return NextResponse.json({ 
        authenticated: false,
        message: 'Not authenticated'
      }, { status: 401 });
    }
    
    // Get teamId from user metadata
    const teamId = user.user_metadata?.teamId;
    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || (user.email ? user.email.split('@')[0] : ''),
        ...(teamId && { teamId: parseInt(teamId.toString(), 10) }),
      }
    });
  } catch (error) {
    console.error('Error in session API route:', error);
    return NextResponse.json({ 
      authenticated: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 