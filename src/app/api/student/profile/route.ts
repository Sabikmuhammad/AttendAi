/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';
import User from '@/models/User';
import { withInstitutionScope } from '@/lib/tenant';

// GET current student profile
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
    ).select('-password');

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

    return NextResponse.json({
      success: true,
      student: {
        _id: student._id,
        name: user.name,
        email: user.email,
        registerNumber: student.studentId,
        studentId: student.studentId,
        department: student.department,
        section: student.section,
        imageUrl: student.imageUrl || user.imageUrl,
      },
    });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch student profile' },
      { status: 500 }
    );
  }
}
