import { supabase } from '@/lib/supabase';
import { syncUserWithDatabase } from './supabase-sync';

// Function to sign up a user with Supabase
export async function signUpWithSupabase(email: string, password: string, metadata?: Record<string, any>) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  // Sync the new user with our database
  if (data.user) {
    // TODO: Ensure team creation happens reliably on user creation
    // Consider implementing a more robust solution using webhooks
    // See the TODO in lib/auth/supabase-sync.ts for more details
    await syncUserWithDatabase(data.user);
  }
  
  return data;
}

// Function to sign in a user with Supabase
export async function signInWithSupabase(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  // Sync the user with our database
  if (data.user) {
    await syncUserWithDatabase(data.user);
  }
  
  return data;
}

// Function to sign out a user from Supabase
export async function signOutFromSupabase() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return true;
}

// Function to update user metadata in Supabase
export async function updateUserMetadata(metadata: Record<string, any>) {
  const { data, error } = await supabase.auth.updateUser({
    data: metadata
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  // Sync the updated user with our database
  if (data.user) {
    await syncUserWithDatabase(data.user);
  }
  
  return data;
}

// This function is now replaced by the syncUserWithDatabase function in supabase-sync.ts
export async function syncSupabaseUser(supabaseUser: any, dbUser: any) {
  console.warn('This function is deprecated. Use syncUserWithDatabase from supabase-sync.ts instead.');
  return {
    supabaseUser,
    dbUser
  };
} 