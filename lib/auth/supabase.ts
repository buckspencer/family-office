import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// Function to sign up a user with Supabase
export async function signUpWithSupabase(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) {
    throw new Error(error.message);
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

// Function to get the current user from Supabase
export async function getCurrentSupabaseUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  
  return user;
}

// Function to get the current session from Supabase
export async function getSupabaseSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  
  return session;
}

// Function to sync Supabase user with our database user
export async function syncSupabaseUser(supabaseUser: any, dbUser: any) {
  // This function will be implemented to sync the Supabase user with our database user
  // For now, we'll just return the users
  return {
    supabaseUser,
    dbUser
  };
} 