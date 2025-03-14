'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-provider';
import { SessionUser } from '@/lib/auth/session';
import { getClientSession } from '@/lib/auth/client-session';

export function useSession() {
  const { user: supabaseUser, isLoading: authLoading } = useAuth();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSession() {
      try {
        // If we have a Supabase user from the auth provider, use it directly
        if (supabaseUser) {
          const mappedUser: SessionUser = {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            name: supabaseUser.user_metadata?.name || (supabaseUser.email ? supabaseUser.email.split('@')[0] : ''),
            role: supabaseUser.user_metadata?.role || 'member',
            teamId: supabaseUser.user_metadata?.teamId ? parseInt(supabaseUser.user_metadata.teamId.toString(), 10) : undefined,
          };
          setUser(mappedUser);
          setIsLoading(false);
          return;
        }

        // If no Supabase user from auth provider, try to get it from client session
        const clientSession = await getClientSession();
        if (clientSession?.user) {
          setUser(clientSession.user);
          setIsLoading(false);
          return;
        }

        // If still no user, try the API as a fallback
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated && data.user) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
          if (response.status !== 401) {
            setError('Failed to fetch session');
          }
        }
      } catch (err) {
        console.error('Error fetching session:', err);
        setError('An error occurred while fetching the session');
      } finally {
        setIsLoading(false);
      }
    }

    if (!authLoading) {
      fetchSession();
    }
  }, [supabaseUser, authLoading]);

  return { user, isLoading, error };
} 