import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getTenantContext } from '@/lib/tenant';
import { getTrialStatus } from '@/lib/trial';
import Student from '@/models/Student';
import Classroom from '@/models/Classroom';
import Camera from '@/models/Camera';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const tenant = await getTenantContext(req);

    if (!tenant.institutionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [trialStatus, studentsCount, classroomsCount, camerasCount] = await Promise.all([
      getTrialStatus(tenant.institutionId),
      Student.countDocuments({ institutionId: tenant.institutionId }),
      Classroom.countDocuments({ institutionId: tenant.institutionId }),
      Camera.countDocuments({ institutionId: tenant.institutionId }),
    ]);

    return NextResponse.json({
      success: true,
      trial: trialStatus,
      usage: {
        students: studentsCount,
        classrooms: classroomsCount,
        cameras: camerasCount,
      },
    });
  } catch (error) {
    console.error('Trial status error:', error);
    return NextResponse.json({ error: 'Failed to fetch trial status' }, { status: 500 });
  }
}
