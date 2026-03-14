/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import Faculty from '@/models/Faculty';
import OTP from '@/models/OTP';
import Institution from '@/models/Institution';
import { sendOTPEmail } from '@/lib/email';
import { withInstitutionScope } from '@/lib/tenant';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      password,
      role,
      institutionCode,
      studentId,
      facultyId,
      department,
      section,
      semester,
    } = body;

    // Validation
    if (!name || !email || !password || !role || !institutionCode) {
      return NextResponse.json(
        {
          success: false,
          error: 'name, email, password, role, and institutionCode are required',
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    if (!['student', 'faculty'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role. Only student and faculty can register.' },
        { status: 400 }
      );
    }

    // Validate role-specific fields
    if (role === 'student') {
      if (!studentId) {
        return NextResponse.json(
          { success: false, error: 'Student ID is required for student registration' },
          { status: 400 }
        );
      }
      if (!department) {
        return NextResponse.json(
          { success: false, error: 'Department is required for student registration' },
          { status: 400 }
        );
      }
      if (!section) {
        return NextResponse.json(
          { success: false, error: 'Section is required for student registration' },
          { status: 400 }
        );
      }
      if (!semester) {
        return NextResponse.json(
          { success: false, error: 'Semester is required for student registration' },
          { status: 400 }
        );
      }
    }

    if (role === 'faculty') {
      if (!facultyId) {
        return NextResponse.json(
          { success: false, error: 'Faculty ID is required for faculty registration' },
          { status: 400 }
        );
      }
      if (!department) {
        return NextResponse.json(
          { success: false, error: 'Department is required for faculty registration' },
          { status: 400 }
        );
      }
    }

    await connectDB();

    const institution = await Institution.findOne({
      code: String(institutionCode).toUpperCase(),
    }).lean<{ _id: string }>();

    if (!institution) {
      return NextResponse.json(
        { success: false, error: 'Invalid institution code' },
        { status: 400 }
      );
    }

    const institutionId = String(institution._id);

    // Check if user already exists in this institution
    const existingUser = await User.findOne(
      withInstitutionScope({ email: email.toLowerCase() }, institutionId)
    );
    if (existingUser) {
      if (existingUser.isVerified) {
        return NextResponse.json(
          { success: false, error: 'User already exists with this email' },
          { status: 409 }
        );
      } else {
        // User exists but not verified - delete old OTPs and send new one
        await OTP.deleteMany(
          withInstitutionScope({ email: email.toLowerCase() }, institutionId)
        );
        
        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Save OTP
        await OTP.create({
          email: email.toLowerCase(),
          institutionId,
          otp,
        });

        // Send OTP email
        await sendOTPEmail({ email, otp, name });

        return NextResponse.json({
          success: true,
          message: 'Verification email sent. Please check your inbox.',
          requiresVerification: true,
        });
      }
    }

    // Check if studentId or facultyId already exists
    if (role === 'student') {
      const existingStudent = await Student.findOne(
        withInstitutionScope({ studentId }, institutionId)
      );
      if (existingStudent) {
        return NextResponse.json(
          { success: false, error: 'Student ID already exists' },
          { status: 409 }
        );
      }
    }

    if (role === 'faculty') {
      const existingFaculty = await Faculty.findOne(
        withInstitutionScope({ facultyId }, institutionId)
      );
      if (existingFaculty) {
        return NextResponse.json(
          { success: false, error: 'Faculty ID already exists' },
          { status: 409 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user (not verified yet)
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash: hashedPassword,
      password: hashedPassword,
      role,
      institutionId,
      isVerified: false,
    });

    // Create Student or Faculty record based on role
    if (role === 'student') {
      await Student.create({
        userId: newUser._id,
        studentId,
        institutionId,
        department,
        section,
        semester,
      });
    } else if (role === 'faculty') {
      await Faculty.create({
        userId: newUser._id,
        facultyId,
        institutionId,
        department,
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to database
    await OTP.create({
      email: email.toLowerCase(),
      institutionId,
      otp,
    });

    // Send OTP email
    const emailResult = await sendOTPEmail({ email, otp, name });

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please check your email for verification code.',
      requiresVerification: true,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
