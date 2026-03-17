import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { requireTenantUser } from '@/lib/auth-guards';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const tenant = await getTenantContext(request);
    const guard = requireTenantUser(tenant, {
      roles: ['super_admin', 'institution_admin', 'department_admin', 'admin', 'faculty'],
    });
    if (guard) return guard;

    const response = await fetch(`${AI_SERVICE_URL}/monitor/active`, {
      method: 'GET',
      cache: 'no-store',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Monitor active proxy error:', error);
    return NextResponse.json(
      { success: false, detail: 'AI monitoring service is unavailable' },
      { status: 503 }
    );
  }
}
