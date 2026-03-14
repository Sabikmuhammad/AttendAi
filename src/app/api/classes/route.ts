/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Class from '@/models/Class';
import { getTenantContext, withInstitutionScope } from '@/lib/tenant';
import { synchronizeClassStatuses } from '@/lib/class-status';

// GET all classes
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const tenant = await getTenantContext(req);

    await synchronizeClassStatuses(
      tenant.institutionId || process.env.DEFAULT_INSTITUTION_ID || 'default-institution'
    );

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const department = searchParams.get('department');

    const filter: any = withInstitutionScope({}, tenant.institutionId);
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
    const tenant = await getTenantContext(req);

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

    const parsedStartTime = new Date(startTime);
    const parsedEndTime = new Date(endTime);

    if (Number.isNaN(parsedStartTime.getTime()) || Number.isNaN(parsedEndTime.getTime())) {
      return NextResponse.json(
        { error: 'Invalid start or end time' },
        { status: 400 }
      );
    }

    // Validate time
    if (parsedEndTime <= parsedStartTime) {
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
      institutionId: tenant.institutionId,
      startTime: parsedStartTime,
      endTime: parsedEndTime,
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
