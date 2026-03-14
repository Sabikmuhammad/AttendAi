import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Institution from '@/models/Institution';
import User from '@/models/User';
import Student from '@/models/Student';
import Faculty from '@/models/Faculty';
import Camera from '@/models/Camera';
import ClassModel from '@/models/Class';
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

async function authorize(req: NextRequest) {
  const tenant = await getTenantContext(req);
  if (!tenant.role || !isSuperAdmin(tenant.role)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }
  return null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ institutionId: string }> }) {
  try {
    await connectDB();
    const denied = await authorize(req);
    if (denied) return denied;

    const { institutionId } = await params;

    const institution = await Institution.findById(institutionId).lean<{
      _id: string;
      plan?: Plan;
      [key: string]: unknown;
    }>();
    if (!institution) {
      return NextResponse.json({ success: false, error: 'Institution not found' }, { status: 404 });
    }

    const [totalStudents, totalFaculty, totalCameras, totalClasses] = await Promise.all([
      Student.countDocuments({ institutionId }),
      Faculty.countDocuments({ institutionId }),
      Camera.countDocuments({ institutionId }),
      ClassModel.countDocuments({ institutionId }),
    ]);

    return NextResponse.json({
      success: true,
      institution,
      usage: {
        totalStudents,
        totalFaculty,
        totalCameras,
        totalClasses,
      },
      limits:
        planLimits[(institution.plan as Plan) || 'starter'] || planLimits.starter,
    });
  } catch (error) {
    console.error('Error fetching institution details:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch institution' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ institutionId: string }> }) {
  try {
    await connectDB();
    const denied = await authorize(req);
    if (denied) return denied;

    const { institutionId } = await params;
    const body = await req.json();

    const update: Record<string, unknown> = {};
    if (body.name) update.name = String(body.name).trim();
    if (body.subdomain) {
      update.subdomain = normalizeSubdomain(String(body.subdomain));
      update.domain = `${update.subdomain}.platform.local`;
    }
    if (body.code) update.code = String(body.code).trim().toUpperCase();
    if (body.contactEmail) update.contactEmail = String(body.contactEmail).trim().toLowerCase();

    if (body.status) {
      const allowed = ['active', 'suspended', 'trial'];
      if (!allowed.includes(String(body.status))) {
        return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
      }
      update.status = body.status;
    }

    if (body.plan) {
      const allowedPlans = ['starter', 'professional', 'enterprise'];
      const normalizedPlan = String(body.plan) as Plan;
      if (!allowedPlans.includes(normalizedPlan)) {
        return NextResponse.json({ success: false, error: 'Invalid plan' }, { status: 400 });
      }
      update.plan = normalizedPlan;
      update.planLimits = planLimits[normalizedPlan];
    }

    const institution = await Institution.findByIdAndUpdate(institutionId, update, {
      new: true,
      runValidators: true,
    }).lean();

    if (!institution) {
      return NextResponse.json({ success: false, error: 'Institution not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, institution, message: 'Institution updated' });
  } catch (error) {
    console.error('Error updating institution:', error);
    return NextResponse.json({ success: false, error: 'Failed to update institution' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ institutionId: string }> }) {
  try {
    await connectDB();
    const denied = await authorize(req);
    if (denied) return denied;

    const { institutionId } = await params;

    const institution = await Institution.findById(institutionId).lean();
    if (!institution) {
      return NextResponse.json({ success: false, error: 'Institution not found' }, { status: 404 });
    }

    const userCount = await User.countDocuments({ institutionId });
    if (userCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete institution with existing users. Suspend it instead.',
        },
        { status: 409 }
      );
    }

    await Institution.findByIdAndDelete(institutionId);

    return NextResponse.json({ success: true, message: 'Institution deleted' });
  } catch (error) {
    console.error('Error deleting institution:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete institution' }, { status: 500 });
  }
}
