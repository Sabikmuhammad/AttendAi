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
  trial:      { students: 200,    faculty: 10,   cameras: 3,    classes: 3 },
  starter:    { students: 500,    faculty: 25,   cameras: 5,    classes: 5 },
  growth:     { students: 5000,   faculty: 250,  cameras: 25,   classes: 50 },
  enterprise: { students: 999999, faculty: 9999, cameras: 9999, classes: 9999 },
} as const;

type Plan = keyof typeof planLimits;

type InstitutionLimits = {
  students: number;
  faculty: number;
  cameras: number;
  classes: number;
};

type InstitutionDetail = {
  _id: string;
  plan?: Plan;
  planLimits?: InstitutionLimits;
  [key: string]: unknown;
};

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

    const institution = await Institution.findById(institutionId).lean<InstitutionDetail>();
    if (!institution) {
      return NextResponse.json({ success: false, error: 'Institution not found' }, { status: 404 });
    }

    const [totalStudents, totalFaculty, totalCameras, totalClasses] = await Promise.all([
      Student.countDocuments({ institutionId }),
      Faculty.countDocuments({ institutionId }),
      Camera.countDocuments({ institutionId }),
      ClassModel.countDocuments({ institutionId }),
    ]);

    const planKey: Plan =
      institution.plan && institution.plan in planLimits
        ? (institution.plan as Plan)
        : 'trial';
    const limits = institution.planLimits ?? planLimits[planKey];

    return NextResponse.json({
      success: true,
      institution,
      usage: {
        totalStudents,
        totalFaculty,
        totalCameras,
        totalClasses,
      },
      // Use the limits stored on the institution document first (reflects actual trial/plan limits),
      // fall back to the plan defaults if not set.
      limits,
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
      const allowedPlans = ['trial', 'starter', 'growth', 'enterprise'];
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
