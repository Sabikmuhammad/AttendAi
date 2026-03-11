import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Class from '@/models/Class';

// GET all classes
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const department = searchParams.get('department');

    const filter: any = {};
    if (status) filter.status = status;
    if (department) filter.department = department;

    const classes = await Class.find(filter)
      .sort({ startTime: -1 })
      .populate('studentIds', 'name registerNumber')
      .lean();

    return NextResponse.json({ success: true, classes });
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}

// POST create new class
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      courseName,
      courseCode,
      classroomNumber,
      facultyId,
      facultyName,
      department,
      startTime,
      endTime,
      studentIds,
    } = body;

    // Validate required fields
    if (
      !courseName ||
      !classroomNumber ||
      !facultyId ||
      !facultyName ||
      !department ||
      !startTime ||
      !endTime ||
      !studentIds ||
      studentIds.length === 0
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate time
    if (new Date(endTime) <= new Date(startTime)) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      );
    }

    const newClass = await Class.create({
      courseName,
      courseCode,
      classroomNumber,
      facultyId,
      facultyName,
      department,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      studentIds,
      status: 'scheduled',
    });

    return NextResponse.json({
      success: true,
      message: 'Class created successfully',
      class: newClass,
    });
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json(
      { error: 'Failed to create class' },
      { status: 500 }
    );
  }
}
