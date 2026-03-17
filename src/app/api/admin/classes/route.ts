/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Class from '@/models/Class';
import { getTenantContext, withInstitutionScope } from '@/lib/tenant';
import { synchronizeClassStatuses } from '@/lib/class-status';
import { requireTenantUser } from '@/lib/auth-guards';

// GET all classes for admin dashboard
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const tenant = await getTenantContext(request);
    const guard = requireTenantUser(tenant, {
      roles: ['super_admin', 'institution_admin', 'department_admin', 'admin'],
    });
    if (guard) return guard;

    await synchronizeClassStatuses(
      tenant.institutionId || process.env.DEFAULT_INSTITUTION_ID || 'default-institution'
    );

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const department = searchParams.get('department');
    const facultyId = searchParams.get('facultyId');

    // Build filter
    const filter: any = withInstitutionScope({}, tenant.institutionId);
    if (status) filter.status = status;
    if (department) filter.department = department;
    if (facultyId) filter.facultyId = facultyId;

    // Fetch classes with populated data
    const classes = await Class.find(filter)
      .populate('facultyId', 'name email')
      .populate('studentIds', 'studentId')
      .populate({
        path: 'studentIds',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .sort({ startTime: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      classes,
    });
  } catch (error) {
    console.error('Error fetching admin classes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}
