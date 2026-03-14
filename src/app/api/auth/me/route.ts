import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_COOKIE_NAME } from '@/lib/auth-cookies';
import { verifyAccessToken } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  try {
    const accessToken = req.cookies.get(ACCESS_COOKIE_NAME)?.value;
    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Unauthenticated' }, { status: 401 });
    }

    const payload = await verifyAccessToken(accessToken);

    return NextResponse.json({
      success: true,
      user: {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        institutionId: payload.institutionId,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthenticated' }, { status: 401 });
  }
}
