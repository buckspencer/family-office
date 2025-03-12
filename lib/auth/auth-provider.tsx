'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [browserClient, setBrowserClient] = useState<any>(null);
  
  useEffect(() => {
    // Initialize the browser client
    const client = createBrowserClient();
    setBrowserClient(client);
    
    // Check for existing session
    const checkUser = async () => {
      try {
        const { data: { session } } = await client.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error('Error checking auth session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Set up auth state listener
    let subscription: { unsubscribe: () => void } | null = null;
    
    if (client) {
      const { data } = client.auth.onAuthStateChange(
        (event, session) => {
          console.log('Auth state changed:', event);
          setUser(session?.user || null);
          setIsLoading(false);
        }
      );
      
      subscription = data.subscription;
      checkUser();
    }

    // Clean up subscription
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signOut = async () => {
    if (!browserClient) return;
    
    try {
      await browserClient.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 