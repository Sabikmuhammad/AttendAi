import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getTenantContext } from '@/lib/tenant';
import Institution from '@/models/Institution';

const PLAN_LIMITS: Record<string, { students: number; cameras: number; classes: number }> = {
  starter:    { students: 500,       cameras: 5,         classes: 5 },
  growth:     { students: 5000,      cameras: 25,        classes: 50 },
  enterprise: { students: 999999999, cameras: 999999999, classes: 999999999 },
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const tenant = await getTenantContext(req);

    if (!tenant.institutionId || (tenant.role !== 'admin' && tenant.role !== 'institution_admin' && tenant.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await req.json();

    if (!plan || !PLAN_LIMITS[plan]) {
      return NextResponse.json({ error: 'Invalid plan. Choose: starter, growth, or enterprise.' }, { status: 400 });
    }

    const limits = PLAN_LIMITS[plan];

    await Institution.findByIdAndUpdate(tenant.institutionId, {
      plan,
      status: 'active',
      'planLimits.students': limits.students,
      'planLimits.cameras': limits.cameras,
      'planLimits.classes': limits.classes,
      'trial.isActive': false,
    });

    return NextResponse.json({ success: true, plan, limits });
  } catch (error) {
    console.error('Upgrade error:', error);
    return NextResponse.json({ error: 'Upgrade failed. Please try again.' }, { status: 500 });
  }
}
