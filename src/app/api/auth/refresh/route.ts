import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import Session from '@/models/Session';
import User from '@/models/User';
import { signAccessToken, refreshTokenMaxAgeSeconds } from '@/lib/jwt';
import {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  clearAuthCookies,
  setAuthCookies,
} from '@/lib/auth-cookies';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;
    if (!refreshToken) {
      return NextResponse.json({ success: false, error: 'Missing refresh token' }, { status: 401 });
    }

    await connectDB();

    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const session = await Session.findOne({ refreshToken: refreshTokenHash });

    if (!session || session.expiresAt < new Date()) {
      const response = NextResponse.json(
        { success: false, error: 'Invalid refresh token' },
        { status: 401 }
      );
      clearAuthCookies(response);
      return response;
    }

    const user = await User.findById(session.userId);
    if (!user) {
      await Session.deleteOne({ _id: session._id });
      const response = NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
      clearAuthCookies(response);
      return response;
    }

    const accessToken = await signAccessToken({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      institutionId: user.institutionId,
    });

    const newRefreshToken = crypto.randomBytes(48).toString('hex');
    const newRefreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

    session.refreshToken = newRefreshTokenHash;
    session.expiresAt = new Date(Date.now() + refreshTokenMaxAgeSeconds() * 1000);
    await session.save();

    const response = NextResponse.json({ success: true });
    response.cookies.set(ACCESS_COOKIE_NAME, '', { path: '/', maxAge: 0 });
    setAuthCookies(response, accessToken, newRefreshToken);

    return response;
  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json({ success: false, error: 'Refresh failed' }, { status: 500 });
  }
}
