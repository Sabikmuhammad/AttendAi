import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Class from '@/models/Class';
import Student from '@/models/Student';
import { auth } from '@/lib/auth';

// GET classes for current student
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get session to identify the student
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find the student record by user ID
    const student = await Student.findOne({
      userId: (session.user as any).id
    }).lean();

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student record not found' },
        { status: 404 }
      );
    }

    const studentData = student as any;

    // Find classes where this student is enrolled
    const classes = await Class.find({ 
      studentIds: studentData._id 
    })
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
