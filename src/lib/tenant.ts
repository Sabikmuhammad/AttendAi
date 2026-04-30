import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { ACCESS_COOKIE_NAME } from '@/lib/auth-cookies';
import { verifyAccessToken } from '@/lib/jwt';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export type AppRole =
  | 'super_admin'
  | 'institution_admin'
  | 'department_admin'
  | 'admin'
  | 'faculty'
  | 'student';

export interface TenantContext {
  userId?: string;
  role?: AppRole;
  institutionId?: string;
  departmentIds: string[];
}

async function resolveInstitutionFromUser(userId: string): Promise<string | undefined> {
  try {
    await connectDB();
    const user = await User.findById(userId).select('institutionId').lean<{ institutionId?: string }>();
    return user?.institutionId || undefined;
  } catch {
    return undefined;
  }
}

function normalize(value?: string | null): string | undefined {
  if (!value) return undefined;
  const v = String(value).trim();
  const defaultInstitution = process.env.DEFAULT_INSTITUTION_ID || 'default-institution';
  return v && v !== 'undefined' && v !== 'null' && v !== 'default-institution' && v !== defaultInstitution
    ? v
    : undefined;
}

import { auth } from '@/lib/auth';

/**
 * Resolves the tenant context for an API route request.
 *
 * Resolution order (first wins):
 *   1. NextAuth session
 *   2. NextAuth JWT cookie
 *   3. Legacy access_token cookie
 *   4. User DB lookup (fallback)
 */
export async function getTenantContext(req: NextRequest): Promise<TenantContext> {
  const session = await auth();

  if (session?.user) {
    const jwtInstitutionId = normalize(session.user.institutionId);
    
    const institutionId =
      jwtInstitutionId ||
      (await resolveInstitutionFromUser(session.user.id)) ||
      process.env.DEFAULT_INSTITUTION_ID;

    return {
      userId: session.user.id,
      role: session.user.role as AppRole,
      institutionId,
      departmentIds: session.user.departmentIds || [],
    };
  }

  // ── NextAuth JWT cookie fallback (when session helper cannot resolve) ───────
  try {
    const nextAuthToken = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (nextAuthToken) {
      const tokenUserId = normalize(String(nextAuthToken.id || nextAuthToken.sub || ''));
      const tokenInstitutionId = normalize(String(nextAuthToken.institutionId || ''));

      const institutionId =
        tokenInstitutionId ||
        (tokenUserId ? await resolveInstitutionFromUser(tokenUserId) : undefined) ||
        process.env.DEFAULT_INSTITUTION_ID;

      return {
        userId: tokenUserId,
        role: normalize(String(nextAuthToken.role || '')) as AppRole | undefined,
        institutionId,
        departmentIds: Array.isArray(nextAuthToken.departmentIds)
          ? nextAuthToken.departmentIds.map((id) => String(id))
          : [],
      };
    }
  } catch {
    // Ignore token parsing failures and continue fallback chain
  }

  // ── Legacy JWT cookie fallback (for routes still using access_token flows) ──
  const accessToken = req.cookies.get(ACCESS_COOKIE_NAME)?.value;
  if (accessToken) {
    try {
      const payload = await verifyAccessToken(accessToken);
      const jwtInstitutionId = normalize(payload.institutionId);

      const institutionId =
        jwtInstitutionId ||
        (await resolveInstitutionFromUser(payload.sub)) ||
        process.env.DEFAULT_INSTITUTION_ID;

      return {
        userId: payload.sub,
        role: payload.role,
        institutionId,
        departmentIds: [],
      };
    } catch {
      // Invalid/expired token, fall through to anonymous context
    }
  }

  // ── No auth — return default anonymous context ────────────────────────
  return {
    userId: undefined,
    role: undefined,
    institutionId: process.env.DEFAULT_INSTITUTION_ID,
    departmentIds: [],
  };
}

/**
 * Appends institutionId to any Mongoose filter object.
 * Every DB query must go through this to prevent cross-tenant data leakage.
 */
export function withInstitutionScope<T extends Record<string, unknown>>(
  filter: T,
  institutionId?: string
): T & { institutionId: string } {
  const id = institutionId || process.env.DEFAULT_INSTITUTION_ID || 'default-institution';
  return { ...filter, institutionId: id };
}

export function isSuperAdmin(role?: AppRole): boolean {
  return role === 'super_admin';
}

export function isInstitutionAdmin(role?: AppRole): boolean {
  return role === 'institution_admin' || role === 'admin';
}
