/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Faculty from '@/models/Faculty';
import Student from '@/models/Student';
import { withInstitutionScope } from '@/lib/tenant';

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

    // Fetch user data
    const user = await User.findOne(
      withInstitutionScope({ _id: session.user.id }, institutionId)
    ).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Base profile data
    const profileData: any = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      imageUrl: user.imageUrl,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };

    // Fetch role-specific data
    if (user.role === 'faculty') {
      const faculty = await Faculty.findOne(
        withInstitutionScope({ userId: user._id }, institutionId)
      );
      if (faculty) {
        profileData.facultyId = faculty.facultyId;
        profileData.department = faculty.department;
        profileData.designation = faculty.designation || 'Not Set';
      }
    } else if (user.role === 'student') {
      const student = await Student.findOne(
        withInstitutionScope({ userId: user._id }, institutionId)
      );
      if (student) {
        profileData.studentId = student.studentId;
        profileData.department = student.department;
        profileData.section = student.section || 'Not Assigned';
      }
    }

    return NextResponse.json({
      success: true,
      profile: profileData,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
