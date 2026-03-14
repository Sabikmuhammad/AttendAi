import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import Session from '@/models/Session';
import { REFRESH_COOKIE_NAME, clearAuthCookies } from '@/lib/auth-cookies';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;

    if (refreshToken) {
      await connectDB();
      const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await Session.deleteOne({ refreshToken: hash });
    }

    const response = NextResponse.json({ success: true, message: 'Logged out' });
    clearAuthCookies(response);
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ success: false, error: 'Logout failed' }, { status: 500 });
  }
}
