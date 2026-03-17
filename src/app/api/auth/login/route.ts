import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import Institution from '@/models/Institution';
import User from '@/models/User';
import Session from '@/models/Session';
import { signAccessToken, refreshTokenMaxAgeSeconds } from '@/lib/jwt';
import { clearAuthCookies, setAuthCookies } from '@/lib/auth-cookies';
import { isRateLimited } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || '').toLowerCase().trim();
    const password = String(body.password || '');
    const institutionCode = String(body.institutionCode || '').trim().toUpperCase();

    if (!email || !password || !institutionCode) {
      return NextResponse.json(
        { success: false, error: 'email, password, and institutionCode are required' },
        { status: 400 }
      );
    }

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';
    const rateKey = `login:${ip}:${email}:${institutionCode}`;
    const rate = isRateLimited(rateKey);
    if (rate.limited) {
      return NextResponse.json(
        { success: false, error: `Too many attempts. Retry in ${rate.retryAfter}s` },
        { status: 429 }
      );
    }

    await connectDB();

    const institution = await Institution.findOne({ code: institutionCode }).lean<{ _id: string; status?: string }>();

    if (!institution) {
      return NextResponse.json(
        { success: false, error: 'Invalid institution code' },
        { status: 401 }
      );
    }

    if (institution.status === 'suspended') {
      return NextResponse.json(
        { success: false, error: 'Institution is suspended. Contact platform support.' },
        { status: 403 }
      );
    }

    const user = await User.findOne({
      email,
      institutionId: String(institution._id),
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const passwordHash = user.passwordHash || user.password;
    if (!passwordHash) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    const isPasswordValid = await bcrypt.compare(password, passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { success: false, error: 'Please verify your email first' },
        { status: 403 }
      );
    }

    const userId = user._id.toString();
    const institutionId = user.institutionId;

    const accessToken = await signAccessToken({
      sub: userId,
      email: user.email,
      role: user.role,
      institutionId,
    });

    const refreshToken = crypto.randomBytes(48).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    await Session.create({
      userId: user._id,
      refreshToken: refreshTokenHash,
      expiresAt: new Date(Date.now() + refreshTokenMaxAgeSeconds() * 1000),
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        institutionId,
      },
    });

    clearAuthCookies(response);
    setAuthCookies(response, accessToken, refreshToken);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 });
  }
}
