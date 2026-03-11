import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import Class from '@/models/Class';
import Student from '@/models/Student';

// GET attendance records with various filters
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    const studentId = searchParams.get('studentId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const format = searchParams.get('format'); // 'json' or 'csv'

    const filter: any = {};
    if (classId) filter.classId = classId;
    if (studentId) filter.studentId = studentId;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const attendanceRecords = await Attendance.find(filter)
      .populate('classId', 'courseName classroomNumber facultyName startTime')
      .populate({
        path: 'studentId',
        select: 'studentId department section userId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 })
      .lean();

    // Transform the data to flatten student info for easier frontend consumption
    const transformedRecords = attendanceRecords.map((record: any) => ({
      ...record,
      detectedAt: record.detectedTime || record.createdAt, // Alias for compatibility
      studentId: {
        _id: record.studentId?._id,
        name: record.studentId?.userId?.name || 'Unknown',
        registerNumber: record.studentId?.studentId || 'N/A',
        department: record.studentId?.department || 'N/A',
      }
    }));

    // Return CSV format if requested
    if (format === 'csv') {
      const csv = generateCSV(transformedRecords);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="attendance-report-${new Date().toISOString()}.csv"`,
        },
      });
    }

    return NextResponse.json({ success: true, attendance: transformedRecords });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance records' },
      { status: 500 }
    );
  }
}

// POST create attendance record
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { classId, studentId, status, confidence, imageUrl, detectedAt } = body;

    if (!classId || !studentId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if attendance already exists
    const existing = await Attendance.findOne({ classId, studentId });
    if (existing) {
      return NextResponse.json(
        { error: 'Attendance already marked for this student in this class' },
        { status: 409 }
      );
    }

    const attendance = await Attendance.create({
      classId,
      studentId,
      status,
      confidence,
      imageUrl,
      detectedAt: detectedAt ? new Date(detectedAt) : new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Attendance marked successfully',
      attendance,
    });
  } catch (error) {
    console.error('Error creating attendance:', error);
    return NextResponse.json(
      { error: 'Failed to create attendance record' },
      { status: 500 }
    );
  }
}

function generateCSV(records: any[]): string {
  const headers = [
    'Date',
    'Course',
    'Classroom',
    'Faculty',
    'Student Name',
    'Register Number',
    'Department',
    'Status',
    'Confidence',
    'Detected At',
  ];

  const rows = records.map((record) => [
    new Date(record.createdAt).toLocaleDateString(),
    record.classId?.courseName || 'N/A',
    record.classId?.classroomNumber || 'N/A',
    record.classId?.facultyName || 'N/A',
    record.studentId?.name || 'N/A',
    record.studentId?.registerNumber || 'N/A',
    record.studentId?.department || 'N/A',
    record.status,
    record.confidence ? `${record.confidence}%` : 'N/A',
    record.detectedAt ? new Date(record.detectedAt).toLocaleString() : 'N/A',
  ]);

  return [headers, ...rows].map((row) => row.join(',')).join('\n');
}
