import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ACCESS_COOKIE_NAME } from '@/lib/auth-cookies';
import { verifyAccessToken } from '@/lib/jwt';

/**
 * Middleware - Role-Based Access Control
 * Protects routes based on user authentication and role
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicRoute =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/verify-otp' ||
    pathname === '/unauthorized' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/sign-up');

  // Allow public routes and static files
  if (isPublicRoute || pathname.startsWith('/_next') || pathname.includes('/api/')) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ACCESS_COOKIE_NAME)?.value;

  let token:
    | {
        role: string;
        institutionId: string;
      }
    | undefined;

  if (accessToken) {
    try {
      const payload = await verifyAccessToken(accessToken);
      token = {
        role: payload.role,
        institutionId: payload.institutionId,
      };
    } catch {
      token = undefined;
    }
  }

  // Redirect to login if not authenticated
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control
  const userRole = token.role as string;
  const institutionId = token.institutionId as string | undefined;

  // All non-super-admin users must have tenant context in SaaS mode.
  if (userRole !== 'super_admin' && !institutionId) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // Super admin routes
  if (pathname.startsWith('/super-admin')) {
    if (userRole !== 'super_admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Institution admin routes
  if (pathname.startsWith('/institutionadmin')) {
    if (
      userRole !== 'institution_admin' &&
      userRole !== 'admin' &&
      userRole !== 'super_admin'
    ) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Department admin routes (legacy admin path)
  if (pathname.startsWith('/admin')) {
    if (
      userRole !== 'department_admin' &&
      userRole !== 'institution_admin' &&
      userRole !== 'admin' &&
      userRole !== 'super_admin'
    ) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Faculty routes - faculty and admin roles can access
  if (pathname.startsWith('/faculty')) {
    if (
      userRole !== 'faculty' &&
      userRole !== 'department_admin' &&
      userRole !== 'institution_admin' &&
      userRole !== 'admin' &&
      userRole !== 'super_admin'
    ) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Student routes - student only
  if (pathname.startsWith('/student')) {
    if (userRole !== 'student') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};
