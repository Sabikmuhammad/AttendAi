import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';
import User from '@/models/User';

// PATCH update student
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await req.json();
    const { name, email, registerNumber, department, imageUrl, faceEmbedding } = body;

    // Find the student to get the userId
    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    // Update student fields (department, section, imageUrl, registerNumber/studentId, faceEmbedding)
    const studentUpdateData: any = {};
    if (department) studentUpdateData.department = department;
    if (imageUrl !== undefined) studentUpdateData.imageUrl = imageUrl;
    if (registerNumber) studentUpdateData.studentId = registerNumber;
    if (faceEmbedding !== undefined) studentUpdateData.faceEmbedding = faceEmbedding;
    
    if (Object.keys(studentUpdateData).length > 0) {
      studentUpdateData.updatedAt = new Date();
      await Student.findByIdAndUpdate(id, { $set: studentUpdateData });
    }

    // Update user fields (name, email)
    const userUpdateData: any = {};
    if (name) userUpdateData.name = name;
    if (email) userUpdateData.email = email.toLowerCase();

    if (Object.keys(userUpdateData).length > 0) {
      await User.findByIdAndUpdate(student.userId, { $set: userUpdateData });
    }

    // Fetch updated student with populated user data
    const updatedStudent = await Student.findById(id)
      .populate('userId', 'name email imageUrl')
      .lean();

    if (!updatedStudent) {
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve updated student' },
        { status: 500 }
      );
    }

    const studentData = updatedStudent as any;

    return NextResponse.json({
      success: true,
      message: 'Student updated successfully',
      student: {
        _id: studentData._id,
        studentId: studentData.studentId,
        name: studentData.userId?.name || 'Unknown',
        email: studentData.userId?.email || '',
        registerNumber: studentData.studentId,
        department: studentData.department,
        section: studentData.section,
        imageUrl: studentData.imageUrl || studentData.userId?.imageUrl,
        faceEmbedding: studentData.faceEmbedding,
      },
    });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update student' },
      { status: 500 }
    );
  }
}

// PUT update student (same as PATCH for consistency)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PATCH(req, { params });
}

// GET single student
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const student = await Student.findById(id).lean();

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, student });
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student' },
      { status: 500 }
    );
  }
}

// DELETE single student
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const deletedStudent = await Student.findByIdAndDelete(id);

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
