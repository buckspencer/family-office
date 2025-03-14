import { compare, hash } from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { createServerClient } from '@/lib/supabase-server';
import { getCurrentUser, syncUserWithDatabase } from './supabase-sync';
import { db } from '@/lib/db';
import { teamMembers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const SALT_ROUNDS = 10;

// Define a standard session user type
export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role?: string;
  teamId?: number;
  passwordHash?: string;
};

export type Session = {
  user: SessionUser;
};

/**
 * Password utility functions
 */
export async function hashPassword(password: string) {
  return hash(password, SALT_ROUNDS);
}

export async function comparePasswords(
  plainTextPassword: string,
  hashedPassword: string | null | undefined
) {
  if (!hashedPassword) {
    return false;
  }
  return compare(plainTextPassword, hashedPassword);
}

/**
 * Get the current user session
 * This is the single source of truth for user authentication on the server
 */
export async function getSession(): Promise<Session | null> {
  try {
    // Get the current user with database sync
    const user = await getCurrentUser();
    
    if (!user) {
      return null;
    }
    
    // If user doesn't have a teamId yet, try to find one from team_members table
    let teamId = user.teamId;
    
    if (!teamId) {
      // Look up team membership
      const membershipResults = await db
        .select({ teamId: teamMembers.teamId })
        .from(teamMembers)
        .where(eq(teamMembers.userId, user.id))
        .limit(1);
      
      if (membershipResults.length > 0) {
        teamId = membershipResults[0].teamId;
        
        // Update user metadata with teamId for future use
        await supabase.auth.updateUser({
          data: { teamId }
        });
      }
    }
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        teamId
      }
    };
  } catch (error) {
    console.error('Unexpected error in getSession:', error);
    return null;
  }
}

/**
 * Get the current user
 */
export async function getUser(): Promise<SessionUser | null> {
  try {
    // Get the current user with database sync
    const user = await getCurrentUser();
    
    if (!user) {
      return null;
    }
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      teamId: user.teamId
    };
  } catch (error) {
    console.error('Error in getUser:', error);
    return null;
  }
}

/**
 * Set a session for a user
 */
export async function setSession(user: { id?: string, email: string, passwordHash?: string | null }) {
  if (!user.email) {
    throw new Error('Email is required to set session');
  }
  
  try {
    // For users with passwordHash, we need to use a different approach
    // This is a workaround for the existing code structure
    if (user.id && !user.passwordHash) {
      // Just sync the user with our database
      const serverClient = await createServerClient();
      const { data: { user: supabaseUser }, error } = await serverClient.auth.getUser();
      
      if (error || !supabaseUser) {
        throw new Error('Failed to get user from Supabase');
      }
      
      await syncUserWithDatabase(supabaseUser);
      return true;
    }
    
    // Original flow for password-based authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.passwordHash || '',
    });
    
    if (error) throw error;
    
    // Sync the user with our database
    if (data.user) {
      await syncUserWithDatabase(data.user);
    }
    
    return true;
  } catch (error) {
    console.error('Error setting session:', error);
    throw error;
  }
}
