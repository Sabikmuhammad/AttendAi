import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';
import User from '@/models/User';

// GET all students
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const department = searchParams.get('department');

    const filter = department ? { department } : {};
    const students = await Student.find(filter)
      .populate('userId', 'name email imageUrl')
      .sort({ createdAt: -1 })
      .lean();

    // Transform to include user data at top level for backward compatibility
    const transformedStudents = students.map((student: any) => ({
      _id: student._id,
      studentId: student.studentId,
      name: student.userId?.name || 'Unknown',
      email: student.userId?.email || '',
      registerNumber: student.studentId, // For backward compatibility
      department: student.department,
      section: student.section,
      imageUrl: student.imageUrl || student.userId?.imageUrl,
      faceEmbedding: student.faceEmbedding,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    }));

    return NextResponse.json({ success: true, students: transformedStudents });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

// POST create new student (admin creating student manually)
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, email, studentId, department, section, imageUrl, password } = body;

    // Validate required fields
    if (!name || !email || !studentId || !department) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, studentId, department' },
        { status: 400 }
      );
    }

    // Check if student ID already exists
    const existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      return NextResponse.json(
        { error: 'Student with this ID already exists' },
        { status: 409 }
      );
    }

    // Check if user with email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create user account
    const bcrypt = require('bcryptjs');
    const hashedPassword = password 
      ? await bcrypt.hash(password, 12)
      : await bcrypt.hash('ChangeMe@123', 12); // Default password

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'student',
      isVerified: true, // Admin-created users are auto-verified
      imageUrl,
    });

    // Create student record
    const student = await Student.create({
      userId: user._id,
      studentId,
      department,
      section: section || '',
      imageUrl,
    });

    const populatedStudent = await Student.findById(student._id)
      .populate('userId', 'name email imageUrl')
      .lean();

    if (!populatedStudent) {
      return NextResponse.json(
        { error: 'Failed to retrieve created student' },
        { status: 500 }
      );
    }

    const studentData = populatedStudent as any;

    return NextResponse.json({
      success: true,
      message: 'Student created successfully',
      student: {
        _id: studentData._id,
        studentId: studentData.studentId,
        name: studentData.userId?.name || name,
        email: studentData.userId?.email || email,
        registerNumber: studentData.studentId,
        department: studentData.department,
        section: studentData.section,
        imageUrl: studentData.imageUrl,
      },
    });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
}

// DELETE student
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('id');

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    const deletedStudent = await Student.findByIdAndDelete(studentId);

    if (!deletedStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    );
  }
}
