import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import Institution from '@/models/Institution';
import User from '@/models/User';
import { getTenantContext, isSuperAdmin } from '@/lib/tenant';
import { activateTrial } from '@/lib/trial';

const planLimits = {
  trial:      { students: 200,   faculty: 10,   cameras: 3,    classes: 3 },
  starter:    { students: 500,   faculty: 25,   cameras: 5,    classes: 5 },
  growth:     { students: 5000,  faculty: 250,  cameras: 25,   classes: 50 },
  enterprise: { students: 999999, faculty: 9999, cameras: 9999, classes: 9999 },
} as const;

type Plan = keyof typeof planLimits;

function normalizeSubdomain(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
}

async function generateUniqueSubdomain(seed: string): Promise<string> {
  const base = normalizeSubdomain(seed) || 'institution';
  let candidate = base;
  let suffix = 1;
  while (await Institution.exists({ subdomain: candidate })) {
    candidate = `${base}${suffix++}`;
  }
  return candidate;
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
    const requestedSubdomain = normalizeSubdomain(String(body.subdomain || ''));
    const code = String(body.code || '').trim().toUpperCase();
    const contactEmail = String(body.contactEmail || '').trim().toLowerCase();
    const plan = String(body.plan || 'starter') as Plan;
    const adminEmail = String(body.adminEmail || '').trim().toLowerCase();
    const subdomain = await generateUniqueSubdomain(requestedSubdomain || code || name);

    if (!name || !code || !contactEmail || !adminEmail) {
      return NextResponse.json(
        { success: false, error: 'name, code, contactEmail and adminEmail are required' },
        { status: 400 }
      );
    }

    if (!['trial', 'starter', 'growth', 'enterprise'].includes(plan)) {
      return NextResponse.json({ success: false, error: 'Invalid plan' }, { status: 400 });
    }

    const exists = await Institution.findOne({ code }).lean();
    if (exists) {
      return NextResponse.json(
        { success: false, error: 'Institution with this code already exists' },
        { status: 409 }
      );
    }

    const institution = await Institution.create({
      name,
      subdomain,
      code,
      contactEmail,
      status: plan === 'trial' ? 'trial' : 'active',
      plan,
      planLimits: planLimits[plan],
      domain: `${subdomain}.attendai.com`,
    });

    if (plan === 'trial') {
      await activateTrial(String(institution._id));
    }

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
