import { NextRequest } from 'next/server';
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
  return v && v !== 'undefined' && v !== 'null' ? v : undefined;
}

/**
 * Resolves the tenant context for an API route request.
 *
 * Resolution order (first wins):
 *   1. JWT access token cookie (institutionId embedded at login)
 *   2. User DB lookup          (fallback for legacy tokens)
 */
export async function getTenantContext(req: NextRequest): Promise<TenantContext> {
  // ── 1. JWT cookie ─────────────────────────────────────────────────────────
  const accessCookie = req.cookies.get(ACCESS_COOKIE_NAME)?.value;

  if (accessCookie) {
    try {
      const payload = await verifyAccessToken(accessCookie);
      const jwtInstitutionId = normalize(payload.institutionId);

      const institutionId =
        jwtInstitutionId ||
        (await resolveInstitutionFromUser(payload.sub)) ||
        process.env.DEFAULT_INSTITUTION_ID;

      return {
        userId: payload.sub,
        role: payload.role as AppRole,
        institutionId,
        departmentIds: [],
      };
    } catch {
      // Invalid token — fall through
    }
  }

  // ── 2. No auth — return default anonymous context ────────────────────────
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
