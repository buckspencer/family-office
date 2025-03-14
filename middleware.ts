import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { getMiddlewareSession } from '@/lib/auth/middleware-session';

export async function middleware(request: NextRequest) {
  console.log('Middleware executing for path:', request.nextUrl.pathname);
  
  // Create a response object
  const res = NextResponse.next();
  
  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient({ req: request, res });
  
  // Use getUser() for more security instead of getSession()
  const { data: { user }, error } = await supabase.auth.getUser();
  
  console.log('Middleware: Supabase user check result:', {
    hasUser: !!user,
    user: user?.email || 'none',
    error: error?.message || 'none'
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
    
    // Check if user is authenticated
    if (user) {
      // User is authenticated with Supabase
      console.log('Middleware: User authenticated with Supabase', {
        user: user.email,
        user_id: user.id,
      });
      
      // Get the formatted session
      const session = await getMiddlewareSession(request, res);
      
      // Set the user ID in the request headers for use in the API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', user.id);
      
      // Create a response with the updated headers
      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
      
      // Copy all cookies from the original response
      res.headers.getSetCookie().forEach(cookie => {
        response.headers.append('Set-Cookie', cookie);
      });
      
      // We don't need to set a custom session cookie anymore
      // Supabase Auth handles session cookies automatically
      
      return response;
    }
    
    // If no authenticated user, redirect to auth page
    console.log('Middleware: No authenticated user found, redirecting to auth');
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
