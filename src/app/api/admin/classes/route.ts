import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Class from '@/models/Class';

// GET all classes for admin dashboard
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const department = searchParams.get('department');
    const facultyId = searchParams.get('facultyId');

    // Build filter
    const filter: any = {};
    if (status) filter.status = status;
    if (department) filter.department = department;
    if (facultyId) filter.facultyId = facultyId;

    // Fetch classes with populated data
    const classes = await Class.find(filter)
      .populate('facultyId', 'name email')
      .populate('studentIds', 'studentId')
      .populate({
        path: 'studentIds',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .sort({ startTime: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      classes,
    });
  } catch (error) {
    console.error('Error fetching admin classes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}
