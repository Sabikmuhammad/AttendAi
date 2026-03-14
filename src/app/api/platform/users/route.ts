import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Institution from '@/models/Institution';
import { getTenantContext, isSuperAdmin } from '@/lib/tenant';

interface ListedUser {
  _id: unknown;
  name: string;
  email: string;
  role: string;
  institutionId: string;
  isVerified: boolean;
  createdAt: Date;
}

interface ListedInstitution {
  _id: unknown;
  name: string;
  domain: string;
}

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

    const { searchParams } = new URL(req.url);
    const institutionId = searchParams.get('institutionId');

    const filter: Record<string, unknown> = {};
    if (institutionId && institutionId !== 'all') {
      filter.institutionId = institutionId;
    }

    const users = await User.find(filter)
      .select('name email role institutionId isVerified createdAt')
      .sort({ createdAt: -1 })
      .lean<ListedUser[]>();

    const institutions = await Institution.find({})
      .select('name domain')
      .lean<ListedInstitution[]>();

    const institutionMap = new Map(
      institutions.map((inst) => [String(inst._id), { name: inst.name, domain: inst.domain }])
    );

    const normalizedUsers = users.map((user) => {
      const institution = institutionMap.get(user.institutionId);
      return {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        institutionId: user.institutionId,
        institutionName: institution?.name || user.institutionId,
        institutionDomain: institution?.domain || '',
        isVerified: Boolean(user.isVerified),
        createdAt: user.createdAt,
      };
    });

    return NextResponse.json({ success: true, users: normalizedUsers });
  } catch (error) {
    console.error('Error fetching platform users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
