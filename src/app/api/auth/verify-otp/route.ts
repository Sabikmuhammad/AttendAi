/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import OTP from '@/models/OTP';
import Institution from '@/models/Institution';
import { sendWelcomeEmail } from '@/lib/email';
import { withInstitutionScope } from '@/lib/tenant';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp, institutionCode } = body;

    // Validation
    if (!email || !otp || !institutionCode) {
      return NextResponse.json(
        { success: false, error: 'email, otp, and institutionCode are required' },
        { status: 400 }
      );
    }

    if (otp.length !== 6) {
      return NextResponse.json(
        { success: false, error: 'OTP must be 6 digits' },
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

    // Find OTP
    const otpRecord = await OTP.findOne({
      ...withInstitutionScope({ email: email.toLowerCase(), otp }, institutionId),
    });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { success: false, error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Find and verify user
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

    // Update user as verified
    user.isVerified = true;
    await user.save();

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    // Send welcome email
    await sendWelcomeEmail({ email: user.email, name: user.name });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
    });
  } catch (error: any) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Verification failed' },
      { status: 500 }
    );
  }
}
