/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';
import User from '@/models/User';
import { getTenantContext, withInstitutionScope } from '@/lib/tenant';

// GET current student profile
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
    const user = await User.findById(tenant.userId).select('-password');

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
