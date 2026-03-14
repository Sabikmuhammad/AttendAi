/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import OTP from '@/models/OTP';
import Institution from '@/models/Institution';
import { sendOTPEmail } from '@/lib/email';
import { withInstitutionScope } from '@/lib/tenant';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, institutionCode } = body;

    // Validation
    if (!email || !institutionCode) {
      return NextResponse.json(
        { success: false, error: 'email and institutionCode are required' },
        { status: 400 }
      );
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

    // Find user
    const user = await User.findOne(
      withInstitutionScope({ email: email.toLowerCase() }, institutionId)
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        { success: false, error: 'Email already verified' },
        { status: 400 }
      );
    }

    // Delete any existing OTPs for this email
    await OTP.deleteMany(
      withInstitutionScope({ email: email.toLowerCase() }, institutionId)
    );

    // Generate new 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save new OTP to database
    await OTP.create({
      email: email.toLowerCase(),
      institutionId,
      otp,
    });

    // Send OTP email
    const emailResult = await sendOTPEmail({ 
      email, 
      otp, 
      name: user.name 
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'New verification code sent to your email',
    });
  } catch (error: any) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to resend OTP' },
      { status: 500 }
    );
  }
}
