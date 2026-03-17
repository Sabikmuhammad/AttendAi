import { NextResponse } from 'next/server';
import type { AppRole } from '@/lib/jwt';
import type { TenantContext } from '@/lib/tenant';

export interface GuardOptions {
  roles?: AppRole[];
}

export function requireTenantUser(
  tenant: TenantContext,
  options?: GuardOptions
): NextResponse | null {
  if (!tenant.userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (options?.roles && (!tenant.role || !options.roles.includes(tenant.role))) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }

  return null;
}

export function requireServiceToken(
  headers: Headers,
  token?: string,
  headerName = 'x-ai-service-token'
): NextResponse | null {
  if (!token) {
    console.warn('Service token guard triggered but ATTENDANCE_SERVICE_TOKEN is not configured.');
    return NextResponse.json(
      { error: 'Service unavailable' },
      { status: 503 }
    );
  }

  const incoming = headers.get(headerName);
  if (!incoming || incoming !== token) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 401 }
    );
  }

  return null;
}
