import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Faculty from '@/models/Faculty';
import User from '@/models/User';

// GET single faculty
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const faculty = await Faculty.findById(id)
      .populate('userId', 'name email imageUrl')
      .lean();

    if (!faculty) {
      return NextResponse.json(
        { success: false, error: 'Faculty not found' },
        { status: 404 }
      );
    }

    const facultyData = faculty as any;

    return NextResponse.json({
      success: true,
      faculty: {
        _id: facultyData._id,
        facultyId: facultyData.facultyId,
        name: facultyData.userId?.name || 'Unknown',
        email: facultyData.userId?.email || '',
        department: facultyData.department,
        designation: facultyData.designation,
        imageUrl: facultyData.userId?.imageUrl,
      },
    });
  } catch (error) {
    console.error('Error fetching faculty:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch faculty' },
      { status: 500 }
    );
  }
}

// PATCH update faculty
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await req.json();
    const { name, email, department, designation, imageUrl } = body;

    // Find the faculty record
    const faculty = await Faculty.findById(id);
    if (!faculty) {
      return NextResponse.json(
        { success: false, error: 'Faculty not found' },
        { status: 404 }
      );
    }

    // Update faculty fields (department, designation)
    const facultyUpdateData: any = {};
    if (department) facultyUpdateData.department = department;
    if (designation !== undefined) facultyUpdateData.designation = designation;
    
    if (Object.keys(facultyUpdateData).length > 0) {
      facultyUpdateData.updatedAt = new Date();
      await Faculty.findByIdAndUpdate(id, { $set: facultyUpdateData });
    }

    // Update user fields (name, email, imageUrl)
    const userUpdateData: any = {};
    if (name) userUpdateData.name = name;
    if (email) userUpdateData.email = email.toLowerCase();
    if (imageUrl !== undefined) userUpdateData.imageUrl = imageUrl;

    if (Object.keys(userUpdateData).length > 0) {
      await User.findByIdAndUpdate(faculty.userId, { $set: userUpdateData });
    }

    // Fetch updated faculty
    const updatedFaculty = await Faculty.findById(id)
      .populate('userId', 'name email imageUrl')
      .lean();

    const facultyData = updatedFaculty as any;

    return NextResponse.json({
      success: true,
      message: 'Faculty updated successfully',
      faculty: {
        _id: facultyData._id,
        facultyId: facultyData.facultyId,
        name: facultyData.userId?.name || 'Unknown',
        email: facultyData.userId?.email || '',
        department: facultyData.department,
        designation: facultyData.designation,
        imageUrl: facultyData.userId?.imageUrl,
      },
    });
  } catch (error) {
    console.error('Error updating faculty:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update faculty' },
      { status: 500 }
    );
  }
}

// DELETE single faculty
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    
    // Find the faculty record to get the userId
    const faculty = await Faculty.findById(id);
    if (!faculty) {
      return NextResponse.json(
        { success: false, error: 'Faculty not found' },
        { status: 404 }
      );
    }

    const userId = faculty.userId;

    // Delete the faculty record
    await Faculty.findByIdAndDelete(id);

    // Delete the associated user record
    await User.findByIdAndDelete(userId);

    return NextResponse.json({
      success: true,
      message: 'Faculty deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting faculty:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete faculty' },
      { status: 500 }
    );
  }
}
