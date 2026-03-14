/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Class from '@/models/Class';
import Student from '@/models/Student';
import { auth } from '@/lib/auth';
import { withInstitutionScope } from '@/lib/tenant';

// GET classes for current student
export async function GET() {
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
    const institutionId =
      (session.user as any).institutionId ||
      process.env.DEFAULT_INSTITUTION_ID ||
      'default-institution';

    const student = await Student.findOne(
      withInstitutionScope({ userId: (session.user as any).id }, institutionId)
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
      withInstitutionScope({ studentIds: studentData._id }, institutionId)
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
