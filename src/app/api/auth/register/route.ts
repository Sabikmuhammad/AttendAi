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
import { uploadStudentImage } from '@/services/imageUploadService';
import { generateFaceEmbedding } from '@/services/embeddingService';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as 'student' | 'faculty';
    const institutionCode = formData.get('institutionCode') as string;
    const studentId = formData.get('studentId') as string;
    const facultyId = formData.get('facultyId') as string;
    const department = formData.get('department') as string;
    const section = formData.get('section') as string;
    const semester = formData.get('semester') as string;
    const image = formData.get('image') as File | null;

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
      if (!image) {
        return NextResponse.json(
          { success: false, error: 'Face image is required for student registration' },
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

    // Process Student image and embedding if applicable
    let imageUrl: string | undefined = undefined;
    let faceEmbedding: number[] | undefined = undefined;

    if (role === 'student' && image) {
      try {
        const uploadResult = await uploadStudentImage(image, studentId);
        imageUrl = uploadResult.imageUrl;

        const embeddingResult = await generateFaceEmbedding(imageUrl);
        faceEmbedding = embeddingResult.embedding;
      } catch (err: any) {
        console.error('Face processing error:', err);
        // Clean up unverified user if face processing fails
        await User.findByIdAndDelete(newUser._id);
        return NextResponse.json(
          { success: false, error: 'Failed to process face image. ' + err.message },
          { status: 400 }
        );
      }
    }

    // Create Student or Faculty record based on role
    if (role === 'student') {
      await Student.create({
        userId: newUser._id,
        studentId,
        institutionId,
        department,
        section,
        semester,
        imageUrl,
        faceEmbedding,
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
