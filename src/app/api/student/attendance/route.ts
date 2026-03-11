import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import Student from '@/models/Student';

// GET attendance records for current student
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get studentId from query parameter
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      // If no studentId provided, return all attendance records
      // (This allows the page to load for now - should be secured with auth in production)
      const attendanceRecords = await Attendance.find()
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
    }

    // Find attendance records for specific student
    const attendanceRecords = await Attendance.find({ 
      studentId: studentId 
    })
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
