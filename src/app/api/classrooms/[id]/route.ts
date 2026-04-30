import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Classroom from '@/models/Classroom';
import User from '@/models/User';
import { getTenantContext, withInstitutionScope } from '@/lib/tenant';
import { requireTenantUser } from '@/lib/auth-guards';

async function resolveInstitutionId(userId?: string, fallbackInstitutionId?: string): Promise<string> {
  if (!userId) {
    throw new Error('Missing authenticated user context');
  }

  const authUser = await User.findById(userId).select('institutionId').lean<{ institutionId?: string }>();
  const resolved = authUser?.institutionId || fallbackInstitutionId;
  if (!resolved || resolved === 'default-institution' || resolved === process.env.DEFAULT_INSTITUTION_ID) {
    throw new Error('No valid institution context found for this account');
  }

  return resolved;
}

// GET - Fetch single classroom
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const tenant = await getTenantContext(request);
    const guard = requireTenantUser(tenant, {
      roles: ['super_admin', 'institution_admin', 'department_admin', 'admin'],
    });
    if (guard) return guard;
    const institutionId = await resolveInstitutionId(tenant.userId, tenant.institutionId);
    const { id } = await params;

    const classroom = await Classroom.findOne(
      withInstitutionScope({ _id: id }, institutionId)
    );

    if (!classroom) {
      return NextResponse.json(
        { success: false, error: 'Classroom not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      classroom,
    });
  } catch (error) {
    console.error('Error fetching classroom:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch classroom' },
      { status: 500 }
    );
  }
}
