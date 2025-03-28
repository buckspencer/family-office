import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { signToken, verifyToken } from '@/lib/auth/session';

const protectedRoutes = '/dashboard';
const publicRoutes = ['/sign-in', '/sign-up', '/verify-email', '/verify-prompt'];

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');
  const isProtectedRoute = pathname.startsWith(protectedRoutes);
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isRSC = searchParams.has('_rsc');

  // Skip middleware for RSC requests
  if (isRSC) {
    return NextResponse.next();
  }

  // Allow public routes without verification
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Redirect to sign in if no session on protected routes
  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  let res = NextResponse.next();

  if (sessionCookie && request.method === "GET") {
    try {
      const parsed = await verifyToken(sessionCookie.value);
      const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Check email verification status for protected routes
      if (isProtectedRoute && !parsed.user.emailVerified) {
        return NextResponse.redirect(new URL('/verify-email', request.url));
      }

      res.cookies.set({
        name: 'session',
        value: await signToken({
          ...parsed,
          expires: expiresInOneDay.toISOString(),
        }),
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        expires: expiresInOneDay,
      });
    } catch (error) {
      console.error('Error updating session:', error);
      res.cookies.delete('session');
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
