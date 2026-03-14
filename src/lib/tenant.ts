import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { auth } from '@/lib/auth';
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

async function resolveInstitutionIdFromUser(userId?: string): Promise<string | undefined> {
  if (!userId) {
    return undefined;
  }

  try {
    await connectDB();
    const user = await User.findById(userId).select('institutionId').lean<{ institutionId?: string }>();
    return user?.institutionId;
  } catch {
    return undefined;
  }
}

export async function getTenantContext(req: NextRequest): Promise<TenantContext> {
  const accessCookie = req.cookies.get(ACCESS_COOKIE_NAME)?.value;

  if (accessCookie) {
    try {
      const payload = await verifyAccessToken(accessCookie);
      return {
        userId: payload.sub,
        role: payload.role,
        institutionId: payload.institutionId,
        departmentIds: [],
      };
    } catch {
      // Fall back to legacy NextAuth token handling for compatibility.
    }
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const { searchParams } = new URL(req.url);
  const headerInstitutionId = req.headers.get('x-institution-id') || undefined;
  const queryInstitutionId = searchParams.get('institutionId') || undefined;

  const tokenRole = token?.role as AppRole | undefined;
  const tokenInstitutionId = token?.institutionId as string | undefined;
  const tokenDepartmentIds = (token?.departmentIds as string[] | undefined) || [];
  const tokenUserId = (token?.id as string | undefined) || (token?.sub as string | undefined);
  const explicitInstitutionId = tokenInstitutionId || headerInstitutionId || queryInstitutionId;

  let resolvedInstitutionId = explicitInstitutionId;
  if (!resolvedInstitutionId && tokenUserId) {
    resolvedInstitutionId = await resolveInstitutionIdFromUser(tokenUserId);
  }

  const institutionId =
    resolvedInstitutionId ||
    process.env.DEFAULT_INSTITUTION_ID ||
    'default-institution';

  if (tokenUserId || tokenRole || tokenInstitutionId) {
    return {
      userId: tokenUserId,
      role: tokenRole,
      institutionId,
      departmentIds: tokenDepartmentIds,
    };
  }

  try {
    const session = await auth();
    if (session?.user) {
      const sessionInstitutionId =
        session.user.institutionId ||
        headerInstitutionId ||
        queryInstitutionId ||
        (await resolveInstitutionIdFromUser(session.user.id));

      return {
        userId: session.user.id,
        role: session.user.role,
        institutionId:
          sessionInstitutionId ||
          process.env.DEFAULT_INSTITUTION_ID ||
          'default-institution',
        departmentIds: Array.isArray(session.user.departmentIds)
          ? session.user.departmentIds
          : [],
      };
    }
  } catch {
    // Ignore auth() fallback errors and continue with anonymous context.
  }

  return {
    userId: undefined,
    role: undefined,
    institutionId,
    departmentIds: [],
  };
}

export function withInstitutionScope<T extends Record<string, unknown>>(
  filter: T,
  institutionId?: string
): T & { institutionId: string } {
  return {
    ...filter,
    institutionId: institutionId || process.env.DEFAULT_INSTITUTION_ID || 'default-institution',
  };
}

export function isSuperAdmin(role?: AppRole): boolean {
  return role === 'super_admin';
}

export function isInstitutionAdmin(role?: AppRole): boolean {
  return role === 'institution_admin' || role === 'admin';
}
