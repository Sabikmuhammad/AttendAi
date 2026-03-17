import { NextResponse } from 'next/server';

const isProd = process.env.NODE_ENV === 'production';

export const ACCESS_COOKIE_NAME = 'access_token';
export const REFRESH_COOKIE_NAME = 'refresh_token';

// Subdomain-based routing is disabled, so we do not need cross-subdomain cookies.
const sameSite = 'lax' as const;

export function setAuthCookies(response: NextResponse, accessToken: string, refreshToken: string) {
  response.cookies.set(ACCESS_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite,
    path: '/',
    maxAge: 15 * 60,
  });

  response.cookies.set(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite,
    path: '/api/auth/refresh',
    maxAge: 30 * 24 * 60 * 60,
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_COOKIE_NAME, '', {
    httpOnly: true,
    secure: isProd,
    sameSite,
    path: '/',
    maxAge: 0,
  });

  response.cookies.set(REFRESH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: isProd,
    sameSite,
    path: '/api/auth/refresh',
    maxAge: 0,
  });
}
