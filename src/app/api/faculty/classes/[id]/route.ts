import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Class from '@/models/Class';
import { getTenantContext, withInstitutionScope } from '@/lib/tenant';
import { requireTenantUser } from '@/lib/auth-guards';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await connectDB();
    const tenant = await getTenantContext(request);
    const guard = requireTenantUser(tenant, {
      roles: ['super_admin', 'institution_admin', 'department_admin', 'admin', 'faculty'],
    });
    if (guard) return guard;

    const classData = await Class.findOne(withInstitutionScope({ _id: id }, tenant.institutionId))
      .populate('studentIds', 'name registerNumber email department')
      .lean();

    if (!classData) {
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      class: classData,
    });
  } catch (error) {
    console.error('Error fetching class details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch class details' },
      { status: 500 }
    );
  }
}
