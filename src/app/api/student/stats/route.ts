/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Class from '@/models/Class';
import Attendance from '@/models/Attendance';
import Student from '@/models/Student';
import User from '@/models/User';
import { withInstitutionScope } from '@/lib/tenant';

// GET statistics for current student
export async function GET() {
  try {
    // Get session
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const institutionId =
      (session.user as any).institutionId ||
      process.env.DEFAULT_INSTITUTION_ID ||
      'default-institution';

    // Find the user
    const user = await User.findOne(
      withInstitutionScope({ _id: session.user.id }, institutionId)
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is a student
    if (user.role !== 'student') {
      return NextResponse.json(
        { success: false, error: 'User is not a student' },
        { status: 403 }
      );
    }

    // Find the student record
    const student: any = await Student.findOne(
      withInstitutionScope({ userId: user._id }, institutionId)
    ).lean();

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student record not found' },
        { status: 404 }
      );
    }

    // Get total enrolled classes
    const totalClasses = await Class.countDocuments(
      withInstitutionScope(
        {
          studentIds: student._id,
          status: { $in: ['completed', 'active'] },
        },
        institutionId
      )
    );

    // Get total attendance records
    const attendedClasses = await Attendance.countDocuments(
      withInstitutionScope({ studentId: student._id, status: 'present' }, institutionId)
    );

    // Get today's classes
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayClasses = await Class.find(
      withInstitutionScope(
        {
          studentIds: student._id,
          startTime: {
            $gte: todayStart,
            $lte: todayEnd,
          },
        },
        institutionId
      )
    )
      .populate('facultyId', 'name')
      .sort({ startTime: 1 })
      .lean();

    // Calculate attendance percentage
    const attendancePercentage = totalClasses > 0 
      ? ((attendedClasses / totalClasses) * 100).toFixed(1)
      : '0.0';

    // Get subject-wise attendance
    const attendanceRecords = await Attendance.find(
      withInstitutionScope({ studentId: student._id }, institutionId)
    )
      .populate('classId', 'courseName')
      .lean();

    const subjectWiseAttendance: any = {};
    
    attendanceRecords.forEach((record: any) => {
      if (record.classId?.courseName) {
        const courseName = record.classId.courseName;
        if (!subjectWiseAttendance[courseName]) {
          subjectWiseAttendance[courseName] = {
            courseName,
            present: 0,
            total: 0,
          };
        }
        subjectWiseAttendance[courseName].total += 1;
        if (record.status === 'present') {
          subjectWiseAttendance[courseName].present += 1;
        }
      }
    });

    const subjectStats = Object.values(subjectWiseAttendance).map((subject: any) => ({
      courseName: subject.courseName,
      present: subject.present,
      total: subject.total,
      percentage: ((subject.present / subject.total) * 100).toFixed(1),
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalClasses,
        attendedClasses,
        attendancePercentage,
        todayClasses,
        subjectWiseAttendance: subjectStats,
      },
    });
  } catch (error) {
    console.error('Error fetching student stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
