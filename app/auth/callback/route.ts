import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');
  const type = requestUrl.searchParams.get('type');
  
  console.log('Auth callback received:', { 
    url: request.url,
    hasCode: !!code,
    type,
    error,
    error_description
  });
  
  // If there's an error in the URL parameters, redirect to the login page with the error
  if (error || error_description) {
    const errorMessage = error_description || error || 'Unknown error';
    console.error('Error in auth callback URL:', errorMessage);
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(errorMessage)}`, requestUrl.origin)
    );
  }
  
  if (!code) {
    console.error('No code provided in auth callback');
    return NextResponse.redirect(
      new URL('/auth?error=No+code+provided', requestUrl.origin)
    );
  }
  
  try {
    console.log('Exchanging code for session...');
    
    // Create a Supabase client for this route handler with proper cookie handling
    const supabaseRouteHandler = createRouteHandlerClient({ cookies });
    
    // Exchange the code for a session
    const { data, error } = await supabaseRouteHandler.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(
        new URL(`/auth?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
      );
    }
    
    console.log('Session created successfully:', {
      hasSession: !!data.session,
      user: data.session?.user?.email,
      type
    });
    
    // If this is an email confirmation, redirect to the success page
    if (type === 'signup' || type === 'recovery') {
      return NextResponse.redirect(
        new URL('/auth-success', requestUrl.origin)
      );
    }
    
    // For all other cases, redirect to dashboard if we have a session
    if (data.session) {
      return NextResponse.redirect(
        new URL('/dashboard', requestUrl.origin)
      );
    } else {
      // If no session was created for some reason, redirect to auth page
      console.error('No session created after code exchange');
      return NextResponse.redirect(
        new URL('/auth?error=Authentication+failed', requestUrl.origin)
      );
    }
  } catch (err) {
    console.error('Unexpected error in auth callback:', err);
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent('An unexpected error occurred')}`, requestUrl.origin)
    );
  }
} 