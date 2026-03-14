import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { getTenantContext, isSuperAdmin, withInstitutionScope } from '@/lib/tenant';

export async function GET(req: NextRequest) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { success: false, error: 'Not found' },
        { status: 404 }
      );
    }

    const tenant = await getTenantContext(req);

    if (!tenant.role) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Super admins can inspect all tenants, others stay tenant-scoped.
    const filter = isSuperAdmin(tenant.role)
      ? {}
      : withInstitutionScope({}, tenant.institutionId);

    const users = await User.find(filter)
      .select('_id name email role institutionId departmentIds isVerified createdAt')
      .lean();

    return NextResponse.json({
      success: true,
      count: users.length,
      users,
      message:
        users.length === 0
          ? 'No users found in scoped query.'
          : 'Users found',
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
