import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Institution from '@/models/Institution';
import { getTenantContext, isSuperAdmin } from '@/lib/tenant';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const tenant = await getTenantContext(req);

    if (!tenant.role || !isSuperAdmin(tenant.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: super admin only' },
        { status: 403 }
      );
    }

    const institutions = await Institution.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, institutions });
  } catch (error) {
    console.error('Error fetching institutions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch institutions' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const tenant = await getTenantContext(req);

    if (!tenant.role || !isSuperAdmin(tenant.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: super admin only' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, code, subdomain, domain, address, contactEmail, plan } = body;

    const normalizedSubdomain = String(subdomain || domain || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '');

    if (!name || !code || !normalizedSubdomain || !contactEmail) {
      return NextResponse.json(
        { success: false, error: 'name, code, subdomain, and contactEmail are required' },
        { status: 400 }
      );
    }

    const institution = await Institution.create({
      name,
      code: String(code).toUpperCase(),
      subdomain: normalizedSubdomain,
      domain: `${normalizedSubdomain}.platform.local`,
      address,
      contactEmail,
      status: 'trial',
      plan: ['starter', 'professional', 'enterprise'].includes(String(plan)) ? plan : 'starter',
    });

    return NextResponse.json(
      { success: true, institution, message: 'Institution created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating institution:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create institution' },
      { status: 500 }
    );
  }
}
