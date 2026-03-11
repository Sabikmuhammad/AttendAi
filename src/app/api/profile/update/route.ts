import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Faculty from '@/models/Faculty';

export async function PATCH(request: Request) {
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

    const body = await request.json();
    const { name, designation } = body;

    // Update user name in User collection
    if (name) {
      await User.findByIdAndUpdate(
        session.user.id,
        { name },
        { new: true }
      );
    }

    // Get user to check role
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Update role-specific data
    if (user.role === 'faculty' && designation !== undefined) {
      await Faculty.findOneAndUpdate(
        { userId: user._id },
        { designation },
        { new: true }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
