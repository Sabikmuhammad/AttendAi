import { SignJWT, jwtVerify } from 'jose';

export type AppRole =
  | 'super_admin'
  | 'institution_admin'
  | 'department_admin'
  | 'admin'
  | 'faculty'
  | 'student';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: AppRole;
  institutionId: string;
}

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_SECONDS = 30 * 24 * 60 * 60;

function getJwtSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing NEXTAUTH_SECRET/JWT_SECRET');
  }
  return new TextEncoder().encode(secret);
}

export async function signAccessToken(payload: AccessTokenPayload): Promise<string> {
  return new SignJWT({
    email: payload.email,
    role: payload.role,
    institutionId: payload.institutionId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(getJwtSecret());
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, getJwtSecret());
  return {
    sub: String(payload.sub),
    email: String(payload.email),
    role: payload.role as AppRole,
    institutionId: String(payload.institutionId),
  };
}

export function refreshTokenMaxAgeSeconds(): number {
  return REFRESH_TOKEN_EXPIRY_SECONDS;
}
