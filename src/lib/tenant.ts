import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { ACCESS_COOKIE_NAME } from '@/lib/auth-cookies';
import { verifyAccessToken } from '@/lib/jwt';

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

  const institutionId =
    tokenInstitutionId ||
    headerInstitutionId ||
    queryInstitutionId ||
    process.env.DEFAULT_INSTITUTION_ID ||
    'default-institution';

  return {
    userId: token?.id as string | undefined,
    role: tokenRole,
    institutionId,
    departmentIds: tokenDepartmentIds,
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
