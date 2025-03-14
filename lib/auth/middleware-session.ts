import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';

// Define a standard session user type
export type SessionUser = {
  id: string;
  email: string;
  name: string;
  teamId?: number;
};

export type Session = {
  user: SessionUser;
};

/**
 * Get the current user session from middleware context
 * This should be used in middleware.ts
 */
export async function getMiddlewareSession(req: NextRequest, res: NextResponse): Promise<Session | null> {
  try {
    // Create a middleware client that can access cookies
    const supabase = createMiddlewareClient({ req, res });
    
    // Use getUser() for more security instead of getSession()
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }
    
    // Get teamId from user metadata
    const teamId = user.user_metadata?.teamId;
    
    return {
      user: {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || (user.email ? user.email.split('@')[0] : ''),
        ...(teamId && { teamId: parseInt(teamId.toString(), 10) }),
      }
    };
  } catch (error) {
    console.error('Unexpected error in getMiddlewareSession:', error);
    return null;
  }
} 