import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import Institution from '@/models/Institution';
import User from '@/models/User';
import { getTenantContext, isSuperAdmin } from '@/lib/tenant';

const planLimits = {
  starter: { students: 500, faculty: 25, cameras: 10, classes: 50 },
  professional: { students: 5000, faculty: 250, cameras: 100, classes: 500 },
  enterprise: { students: 50000, faculty: 2500, cameras: 1000, classes: 5000 },
} as const;

type Plan = keyof typeof planLimits;

function normalizeSubdomain(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const tenant = await getTenantContext(req);

    if (!tenant.role || !isSuperAdmin(tenant.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const institutions = await Institution.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, institutions });
  } catch (error) {
    console.error('Error listing institutions:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch institutions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const tenant = await getTenantContext(req);

    if (!tenant.role || !isSuperAdmin(tenant.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const name = String(body.name || '').trim();
    const subdomain = normalizeSubdomain(String(body.subdomain || ''));
    const code = String(body.code || '').trim().toUpperCase();
    const contactEmail = String(body.contactEmail || '').trim().toLowerCase();
    const plan = String(body.plan || 'starter') as Plan;
    const adminEmail = String(body.adminEmail || '').trim().toLowerCase();

    if (!name || !subdomain || !code || !contactEmail || !adminEmail) {
      return NextResponse.json(
        { success: false, error: 'name, subdomain, code, contactEmail and adminEmail are required' },
        { status: 400 }
      );
    }

    if (!['starter', 'professional', 'enterprise'].includes(plan)) {
      return NextResponse.json({ success: false, error: 'Invalid subscription plan' }, { status: 400 });
    }

    const exists = await Institution.findOne({ $or: [{ code }, { subdomain }] }).lean();
    if (exists) {
      return NextResponse.json(
        { success: false, error: 'Institution with this code or subdomain already exists' },
        { status: 409 }
      );
    }

    const institution = await Institution.create({
      name,
      subdomain,
      code,
      contactEmail,
      status: 'trial',
      plan,
      planLimits: planLimits[plan],
      // legacy compatibility field
      domain: `${subdomain}.platform.local`,
    });

    const existingAdmin = await User.findOne({
      email: adminEmail,
      institutionId: String(institution._id),
    });

    let temporaryPassword = '';
    if (!existingAdmin) {
      temporaryPassword = `Temp-${crypto.randomBytes(6).toString('base64url')}!`;
      const passwordHash = await bcrypt.hash(temporaryPassword, 12);

      await User.create({
        name: `${name} Admin`,
        email: adminEmail,
        passwordHash,
        password: passwordHash,
        role: 'institution_admin',
        institutionId: String(institution._id),
        isVerified: true,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Institution created successfully',
        institution,
        adminCredentials: existingAdmin
          ? null
          : {
              email: adminEmail,
              temporaryPassword,
            },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating institution:', error);
    return NextResponse.json({ success: false, error: 'Failed to create institution' }, { status: 500 });
  }
}
