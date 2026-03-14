/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import Student from '@/models/Student';
import User from '@/models/User';
import { getTenantContext, withInstitutionScope } from '@/lib/tenant';

// GET attendance records for current student
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

    // Get studentId from query parameter
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    let targetStudentId = studentId;
    if (!targetStudentId) {
      const student = await Student.findOne(
        withInstitutionScope({ userId: tenant.userId }, effectiveInstitutionId)
      )
        .select('_id')
        .lean();

      if (!student) {
        return NextResponse.json(
          { success: false, error: 'Student record not found' },
          { status: 404 }
        );
      }

      targetStudentId = (student as any)._id.toString();
    }

    // Find attendance records for specific student
    const attendanceRecords = await Attendance.find(
      withInstitutionScope({ studentId: targetStudentId }, effectiveInstitutionId)
    )
      .populate('classId', 'courseName courseCode classroomNumber startTime endTime facultyName')
      .populate({
        path: 'studentId',
        select: 'studentId department userId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .sort({ detectedTime: -1 })
      .lean();

    // Transform to include detectedAt for compatibility
    const transformed = attendanceRecords.map((record: any) => ({
      ...record,
      detectedAt: record.detectedTime || record.createdAt,
    }));

    return NextResponse.json({
      success: true,
      attendance: transformed,
    });
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch attendance' },
      { status: 500 }
    );
  }
}
