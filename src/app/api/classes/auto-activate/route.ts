import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Class from '@/models/Class';

/**
 * API route to automatically activate classes based on start time
 * This should be called periodically (e.g., every minute via cron job or client polling)
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const currentTime = new Date();

    // Find all scheduled classes whose start time has passed
    const classesToActivate = await Class.find({
      status: 'scheduled',
      startTime: { $lte: currentTime },
    });

    // Update their status to 'active'
    const updatePromises = classesToActivate.map(async (cls) => {
      cls.status = 'active';
      await cls.save();
      return cls;
    });

    const activatedClasses = await Promise.all(updatePromises);

    // Also check for classes that should be completed
    const classesToComplete = await Class.find({
      status: 'active',
      endTime: { $lte: currentTime },
    });

    const completePromises = classesToComplete.map(async (cls) => {
      cls.status = 'completed';
      await cls.save();
      return cls;
    });

    const completedClasses = await Promise.all(completePromises);

    return NextResponse.json({
      success: true,
      activated: activatedClasses.length,
      completed: completedClasses.length,
      activatedClasses: activatedClasses.map(c => ({
        id: c._id,
        courseName: c.courseName,
        startTime: c.startTime,
      })),
      completedClasses: completedClasses.map(c => ({
        id: c._id,
        courseName: c.courseName,
        endTime: c.endTime,
      })),
    });
  } catch (error) {
    console.error('Error in class activation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to activate classes' },
      { status: 500 }
    );
  }
}

// GET method to check status without making changes
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const currentTime = new Date();

    const scheduledCount = await Class.countDocuments({
      status: 'scheduled',
      startTime: { $lte: currentTime },
    });

    const activeToComplete = await Class.countDocuments({
      status: 'active',
      endTime: { $lte: currentTime },
    });

    return NextResponse.json({
      success: true,
      scheduledReadyToActivate: scheduledCount,
      activeReadyToComplete: activeToComplete,
    });
  } catch (error) {
    console.error('Error checking class status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check status' },
      { status: 500 }
    );
  }
}
