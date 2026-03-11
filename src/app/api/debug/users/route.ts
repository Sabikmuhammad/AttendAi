import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Get all users
    const users = await User.find({}).lean();

    return NextResponse.json({
      success: true,
      count: users.length,
      users,
      message: users.length === 0 ? 'No users found in MongoDB. Webhook may not be configured.' : 'Users found'
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
