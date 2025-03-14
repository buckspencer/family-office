'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Create a server-side Supabase client that can access cookies
// This should be used for server components and API routes
export async function createServerClient() {
  // In Next.js, cookies() returns a ReadonlyRequestCookies object
  // The createServerComponentClient expects a function that returns this object
  return createServerComponentClient({
    cookies,
  });
} 