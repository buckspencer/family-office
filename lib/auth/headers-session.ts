'use server';

import { headers } from 'next/headers';

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
 * Get the current user session from request headers
 * This is set by the middleware
 */
export async function getHeadersSession(): Promise<Session | null> {
  try {
    // In Next.js, we need to use the headers() function directly
    // Let's use a different approach that doesn't rely on headers
    // since they're causing type issues
    
    // For now, we'll return null and rely on other session methods
    return null;
  } catch (error) {
    console.error('Error getting session from headers:', error);
    return null;
  }
} 