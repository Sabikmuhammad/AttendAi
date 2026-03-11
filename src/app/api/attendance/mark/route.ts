import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import Class from '@/models/Class';
import Student from '@/models/Student';

/**
 * API endpoint to mark attendance for detected students
 * Prevents duplicate attendance records
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { classId, students } = body;

    if (!classId || !students || !Array.isArray(students)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify class exists and is active
    const classData = await Class.findById(classId);
    
    if (!classData) {
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 404 }
      );
    }

    if (classData.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Class is not active' },
        { status: 400 }
      );
    }

    const newAttendanceRecords = [];

    // Process each detected student
    for (const student of students) {
      const { studentId, detectedTime, confidence } = student;

      // Check if attendance already exists for this student in this class
      const existingAttendance = await Attendance.findOne({
        classId,
        studentId,
      });

      if (existingAttendance) {
        // Attendance already marked, skip
        continue;
      }

      // Verify student is enrolled in this class
      const isEnrolled = classData.studentIds.some(
        (id: any) => id.toString() === studentId
      );

      if (!isEnrolled) {
        // Student not enrolled, skip
        continue;
      }

      // Get student details
      const studentData = await Student.findById(studentId);
      
      if (!studentData) {
        continue;
      }

      // Create attendance record
      const attendanceRecord = new Attendance({
        classId,
        studentId,
        detectedTime: new Date(detectedTime),
        status: 'present',
        confidence,
        method: 'face_recognition',
      });

      await attendanceRecord.save();

      newAttendanceRecords.push({
        studentId,
        name: studentData.name,
        registerNumber: studentData.registerNumber,
        detectedTime,
        confidence,
      });
    }

    return NextResponse.json({
      success: true,
      newAttendance: newAttendanceRecords,
      markedCount: newAttendanceRecords.length,
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark attendance' },
      { status: 500 }
    );
  }
}
