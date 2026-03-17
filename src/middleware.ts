import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ACCESS_COOKIE_NAME } from '@/lib/auth-cookies';
import { verifyAccessToken } from '@/lib/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Subdomain routing is disabled. Keep headers untouched.
  const requestHeaders = new Headers(request.headers);

  // ── Public routes ───────────────────────────────────────────────────────
  const isPublicRoute =
    pathname === '/' ||
    pathname === '/docs' ||
    pathname.startsWith('/docs/') ||
    pathname === '/pricing' ||
    pathname === '/demo' ||
    pathname === '/onboarding' ||
    pathname === '/trial-expired' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/verify-otp' ||
    pathname === '/unauthorized' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/sign-up');

  if (isPublicRoute || pathname.startsWith('/_next') || pathname.includes('/api/')) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // ── Auth check ──────────────────────────────────────────────────────────
  const accessToken = request.cookies.get(ACCESS_COOKIE_NAME)?.value;

  let token: { role: string; institutionId: string } | undefined;

  if (accessToken) {
    try {
      const payload = await verifyAccessToken(accessToken);
      token = { role: payload.role, institutionId: payload.institutionId };
    } catch {
      token = undefined;
    }
  }

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { role: userRole, institutionId } = token;

  // Non-super-admin must have tenant context
  if (userRole !== 'super_admin' && !institutionId) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // ── Role-based route guards ─────────────────────────────────────────────
  if (pathname.startsWith('/super-admin') && userRole !== 'super_admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  if (
    pathname.startsWith('/institutionadmin') &&
    userRole !== 'institution_admin' &&
    userRole !== 'admin' &&
    userRole !== 'super_admin'
  ) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  if (
    pathname.startsWith('/admin') &&
    userRole !== 'department_admin' &&
    userRole !== 'institution_admin' &&
    userRole !== 'admin' &&
    userRole !== 'super_admin'
  ) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  if (
    pathname.startsWith('/faculty') &&
    userRole !== 'faculty' &&
    userRole !== 'department_admin' &&
    userRole !== 'institution_admin' &&
    userRole !== 'admin' &&
    userRole !== 'super_admin'
  ) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  if (pathname.startsWith('/student') && userRole !== 'student') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};
