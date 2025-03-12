import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function getSupabaseSession() {
  // Get the Supabase session
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  const session = await getSupabaseSession();
  
  if (session) {
    return {
      id: session.user.id,
      email: session.user.email || '',
      name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
    };
  }
  
  return null;
}

export async function signOut() {
  await supabase.auth.signOut();
} 