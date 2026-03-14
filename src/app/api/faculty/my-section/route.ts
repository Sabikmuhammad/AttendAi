/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Faculty from '@/models/Faculty';
import Student from '@/models/Student';
import Attendance from '@/models/Attendance';
import Class from '@/models/Class';
import { getTenantContext, withInstitutionScope } from '@/lib/tenant';

// GET - Fetch faculty's assigned section students with attendance
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const tenant = await getTenantContext(req);

    const { searchParams } = new URL(req.url);
    const facultyId = searchParams.get('facultyId');

    if (!facultyId) {
      return NextResponse.json(
        { success: false, error: 'Faculty ID is required' },
        { status: 400 }
      );
    }

    // Find faculty and their assigned section
    const faculty = await Faculty.findOne(
      withInstitutionScope({ facultyId }, tenant.institutionId)
    )
      .populate('userId', 'name email')
      .lean();

    if (!faculty) {
      return NextResponse.json(
        { success: false, error: 'Faculty not found' },
        { status: 404 }
      );
    }

    const facultyData = faculty as any;

    // Check if faculty has assigned section
    if (!facultyData.section || !facultyData.semester) {
      return NextResponse.json({
        success: true,
        faculty: {
          name: facultyData.userId?.name || 'Unknown',
          department: facultyData.department,
          section: null,
          semester: null,
        },
        students: [],
        message: 'No section assigned to this faculty',
      });
    }

    // Find students in the faculty's section
    const students = await Student.find(
      withInstitutionScope(
        {
          department: facultyData.department,
          section: facultyData.section,
          semester: facultyData.semester,
        },
        tenant.institutionId
      )
    )
      .populate('userId', 'name email imageUrl')
      .sort({ createdAt: -1 })
      .lean();

    // Get all classes for this section
    const classes = await Class.find(
      withInstitutionScope(
        {
          department: facultyData.department,
          status: { $in: ['active', 'completed'] },
        },
        tenant.institutionId
      )
    )
      .select('_id courseName startTime')
      .lean();

    const classIds = classes.map(c => c._id);

    // Get attendance records for all students
    const attendanceRecords = await Attendance.find(
      withInstitutionScope(
        {
          classId: { $in: classIds },
          studentId: { $in: students.map(s => s._id) },
        },
        tenant.institutionId
      )
    ).lean();

    // Calculate attendance statistics for each student
    const studentsWithAttendance = students.map((student: any) => {
      const studentAttendance = attendanceRecords.filter(
        (record: any) => record.studentId.toString() === student._id.toString()
      );

      const totalClasses = classIds.length;
      const attendedClasses = studentAttendance.filter(
        (record: any) => record.status === 'present' || record.status === 'late'
      ).length;
      const presentCount = studentAttendance.filter(
        (record: any) => record.status === 'present'
      ).length;
      const lateCount = studentAttendance.filter(
        (record: any) => record.status === 'late'
      ).length;
      const absentCount = totalClasses - attendedClasses;

      const attendancePercentage = totalClasses > 0 
        ? Math.round((attendedClasses / totalClasses) * 100)
        : 0;

      return {
        _id: student._id,
        studentId: student.studentId,
        name: student.userId?.name || 'Unknown',
        email: student.userId?.email || '',
        registerNumber: student.studentId,
        department: student.department,
        section: student.section,
        semester: student.semester,
        imageUrl: student.imageUrl || student.userId?.imageUrl,
        attendance: {
          totalClasses,
          attendedClasses,
          presentCount,
          lateCount,
          absentCount,
          percentage: attendancePercentage,
        },
      };
    });

    return NextResponse.json({
      success: true,
      faculty: {
        name: facultyData.userId?.name || 'Unknown',
        email: facultyData.userId?.email || '',
        facultyId: facultyData.facultyId,
        department: facultyData.department,
        section: facultyData.section,
        semester: facultyData.semester,
      },
      students: studentsWithAttendance,
      totalStudents: studentsWithAttendance.length,
    });
  } catch (error) {
    console.error('Error fetching section students:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch section students' },
      { status: 500 }
    );
  }
}
