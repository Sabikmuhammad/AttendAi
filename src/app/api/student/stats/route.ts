/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Class from '@/models/Class';
import Attendance from '@/models/Attendance';
import Student from '@/models/Student';
import User from '@/models/User';
import { getTenantContext, withInstitutionScope } from '@/lib/tenant';

// GET statistics for current student
export async function GET(request: NextRequest) {
  try {
    const tenant = await getTenantContext(request);

    if (!tenant.userId || !tenant.institutionId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Resolve tenant from the source of truth (user record) to avoid stale token claims.
    const user = await User.findById(tenant.userId);

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

    const effectiveInstitutionId = String(user.institutionId || tenant.institutionId);

    // Find the student record
    const student: any = await Student.findOne(
      withInstitutionScope({ userId: user._id }, effectiveInstitutionId)
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
        effectiveInstitutionId
      )
    );

    // Get total attendance records
    const attendedClasses = await Attendance.countDocuments(
      withInstitutionScope({ studentId: student._id, status: 'present' }, effectiveInstitutionId)
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
        effectiveInstitutionId
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
      withInstitutionScope({ studentId: student._id }, effectiveInstitutionId)
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
