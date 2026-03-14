/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import Student from '@/models/Student';
import { auth } from '@/lib/auth';
import { withInstitutionScope } from '@/lib/tenant';

// GET attendance records for current student
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const institutionId =
      (session.user as any).institutionId ||
      process.env.DEFAULT_INSTITUTION_ID ||
      'default-institution';

    // Get studentId from query parameter
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    let targetStudentId = studentId;
    if (!targetStudentId) {
      const student = await Student.findOne(
        withInstitutionScope({ userId: (session.user as any).id }, institutionId)
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
      withInstitutionScope({ studentId: targetStudentId }, institutionId)
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
