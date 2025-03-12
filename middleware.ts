import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function middleware(request: NextRequest) {
  console.log('Middleware executing for path:', request.nextUrl.pathname);
  
  // Create a response object
  const res = NextResponse.next();
  
  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient({ req: request, res });
  
  // Refresh session if expired - required for Server Components
  const { data: { session: supabaseSession } } = await supabase.auth.getSession();
  
  console.log('Middleware: Supabase session check result:', {
    hasSession: !!supabaseSession,
    user: supabaseSession?.user?.email || 'none',
    expires: supabaseSession?.expires_at ? new Date(supabaseSession.expires_at * 1000).toISOString() : 'none'
  });
  
  // Check if the request is for a protected route
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');
  
  // Allow access to test-auth page without authentication
  if (request.nextUrl.pathname === '/test-auth') {
    console.log('Middleware: Allowing access to test-auth page');
    return res;
  }
  
  if (isProtectedRoute) {
    console.log('Middleware: Checking authentication for protected route:', request.nextUrl.pathname);
    
    // First check Supabase Auth
    if (supabaseSession) {
      // User is authenticated with Supabase
      console.log('Middleware: User authenticated with Supabase', {
        user: supabaseSession.user.email,
        user_id: supabaseSession.user.id,
        expires_at: supabaseSession.expires_at ? new Date(supabaseSession.expires_at * 1000).toISOString() : 'unknown'
      });
      
      // Set the user ID in the request headers for use in the API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', supabaseSession.user.id);
      
      // Return the response with the updated headers
      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
      
      // Copy all cookies from the original response
      res.headers.getSetCookie().forEach(cookie => {
        response.headers.append('Set-Cookie', cookie);
      });
      
      return response;
    }
    
    // If no Supabase session, redirect to auth page
    console.log('Middleware: No Supabase session found, redirecting to auth');
    return NextResponse.redirect(new URL('/auth', request.url));
  }
  
  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
    '/test-auth',
  ],
};
