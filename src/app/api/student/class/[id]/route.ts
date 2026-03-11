import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Class from '@/models/Class';
import Attendance from '@/models/Attendance';
import Student from '@/models/Student';
import User from '@/models/User';

// GET specific class details for student
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await connectDB();

    // Get student email from query parameter
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Find the student record
    const student: any = await Student.findOne({ email }).lean();

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student record not found' },
        { status: 404 }
      );
    }

    // Get class details
    const classData: any = await Class.findById(id)
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
      classId: id,
      studentId: student._id,
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
