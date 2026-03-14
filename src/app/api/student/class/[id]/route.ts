/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Class from '@/models/Class';
import Attendance from '@/models/Attendance';
import Student from '@/models/Student';
import User from '@/models/User';
import { getTenantContext, withInstitutionScope } from '@/lib/tenant';

// GET specific class details for student
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenant = await getTenantContext(request);

    if (!tenant.userId || !tenant.institutionId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(tenant.userId).select('role institutionId').lean<{
      role?: string;
      institutionId?: string;
    }>();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.role !== 'student') {
      return NextResponse.json(
        { success: false, error: 'User is not a student' },
        { status: 403 }
      );
    }

    const effectiveInstitutionId = String(user.institutionId || tenant.institutionId);

    // Find the student record
    const student: any = await Student.findOne(
      withInstitutionScope({ userId: tenant.userId }, effectiveInstitutionId)
    ).lean();

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student record not found' },
        { status: 404 }
      );
    }

    // Get class details
    const classData: any = await Class.findOne(withInstitutionScope({ _id: id }, effectiveInstitutionId))
      .populate('facultyId', 'name email')
      .populate('studentIds', 'name registerNumber')
      .lean();

    if (!classData) {
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 404 }
      );
    }

    // Check if student is enrolled in this class
    const isEnrolled = classData.studentIds.some(
      (s: any) => s._id.toString() === student._id.toString()
    );

    if (!isEnrolled) {
      return NextResponse.json(
        { success: false, error: 'Not enrolled in this class' },
        { status: 403 }
      );
    }

    // Get attendance record for this class
    const attendanceRecord = await Attendance.findOne({
      ...withInstitutionScope({ classId: id, studentId: student._id }, effectiveInstitutionId),
    }).lean();

    return NextResponse.json({
      success: true,
      class: classData,
      attendance: attendanceRecord,
    });
  } catch (error) {
    console.error('Error fetching class details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch class details' },
      { status: 500 }
    );
  }
}
