import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { requireTenantUser } from '@/lib/auth-guards';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const tenant = await getTenantContext(request);
    const guard = requireTenantUser(tenant, {
      roles: ['super_admin', 'institution_admin', 'department_admin', 'admin', 'faculty'],
    });
    if (guard) return guard;

    const { classId } = await params;

    const upstream = await fetch(`${AI_SERVICE_URL}/stream/video/${classId}`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text();
      return NextResponse.json(
        {
          success: false,
          detail: text || 'Failed to open stream from AI service',
        },
        { status: upstream.status || 502 }
      );
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        'Content-Type':
          upstream.headers.get('content-type') ||
          'multipart/x-mixed-replace; boundary=frame',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Monitor stream proxy error:', error);
    return NextResponse.json(
      { success: false, detail: 'AI monitoring stream is unavailable' },
      { status: 503 }
    );
  }
}
