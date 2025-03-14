'use client';

import { SessionUser } from './session';
import { createBrowserClient } from '@/lib/supabase';

/**
 * Get the current user session from Supabase client-side
 */
export async function getClientSession(): Promise<{ user: SessionUser } | null> {
  try {
    // Create a browser client
    const supabase = createBrowserClient();
    
    // Get the user from Supabase Auth
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
        role: user.user_metadata?.role || 'member',
        ...(teamId && { teamId: parseInt(teamId.toString(), 10) }),
      }
    };
  } catch (error) {
    console.error('Error getting client session:', error);
    return null;
  }
} 