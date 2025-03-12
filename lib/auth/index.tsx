'use client';

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useAuth } from './auth-provider';

// Define a compatible user type that works with Supabase
type CompatibleUser = {
  id: string;
  email: string | null;
  name: string | null;
};

type UserContextType = {
  user: CompatibleUser | null;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
});

export function useUser(): UserContextType {
  return useContext(UserContext);
}

export function UserProvider({
  children
}: {
  children: ReactNode;
}) {
  const { user: supabaseUser, isLoading: authLoading } = useAuth();
  const [user, setUser] = useState<CompatibleUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!authLoading) {
      if (supabaseUser) {
        const mappedUser: CompatibleUser = {
          id: supabaseUser.id,
          email: supabaseUser.email || null,
          name: supabaseUser.user_metadata?.name || (supabaseUser.email ? supabaseUser.email.split('@')[0] : null),
        };
        setUser(mappedUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    }
  }, [supabaseUser, authLoading]);

  return (
    <UserContext.Provider value={{ user, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}
