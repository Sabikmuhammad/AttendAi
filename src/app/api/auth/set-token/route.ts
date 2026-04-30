import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { signAccessToken } from '@/lib/jwt';
import { setAuthCookies } from '@/lib/auth-cookies';

/**
 * Sets access_token and refresh_token cookies after NextAuth login
 * Called from client after successful signIn to bridge NextAuth session with legacy token system
 */
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - no session' },
        { status: 401 }
      );
    }

    // Generate access token JWT
    const accessToken = await signAccessToken({
      sub: session.user.id,
      email: session.user.email || '',
      role: session.user.role,
      institutionId: session.user.institutionId,
    });

    // Generate a dummy refresh token (just a JWT with longer expiry, not actually rotated)
    const refreshToken = await signAccessToken({
      sub: session.user.id,
      email: session.user.email || '',
      role: session.user.role,
      institutionId: session.user.institutionId,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Access token set',
    });

    // Set both cookies
    setAuthCookies(response, accessToken, refreshToken);

    return response;
  } catch (error) {
    console.error('Error setting auth tokens:', error);
    return NextResponse.json(
      { error: 'Failed to set auth tokens' },
      { status: 500 }
    );
  }
}
