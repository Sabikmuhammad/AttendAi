/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Class from '@/models/Class';
import Student from '@/models/Student';
import { getTenantContext, withInstitutionScope } from '@/lib/tenant';

// GET classes for current student
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const tenant = await getTenantContext(request);

    if (!tenant.userId || !tenant.institutionId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const student = await Student.findOne(
      withInstitutionScope({ userId: tenant.userId }, tenant.institutionId)
    ).lean();

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student record not found' },
        { status: 404 }
      );
    }

    const studentData = student as any;

    // Find classes where this student is enrolled
    const classes = await Class.find(
      withInstitutionScope({ studentIds: studentData._id }, tenant.institutionId)
    )
      .populate('facultyId', 'name email')
      .sort({ startTime: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      classes,
    });
  } catch (error) {
    console.error('Error fetching student classes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}
