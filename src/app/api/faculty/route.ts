import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Faculty from '@/models/Faculty';
import User from '@/models/User';

// GET all faculty
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Fetch all faculty with populated user data
    const facultyList = await Faculty.find({})
      .populate('userId', 'name email imageUrl')
      .sort({ createdAt: -1 })
      .lean();

    // Transform to include user data at top level
    const transformedFaculty = facultyList.map((faculty: any) => ({
      _id: faculty._id,
      userId: faculty.userId?._id || faculty.userId, // Include userId for debugging
      facultyId: faculty.facultyId,
      name: faculty.userId?.name || 'Unknown',
      email: faculty.userId?.email || '',
      department: faculty.department,
      imageUrl: faculty.userId?.imageUrl,
      createdAt: faculty.createdAt,
      updatedAt: faculty.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      faculty: transformedFaculty,
    });
  } catch (error) {
    console.error('Error fetching faculty:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch faculty' },
      { status: 500 }
    );
  }
}

// POST create new faculty (admin creating faculty manually)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, facultyId, department, imageUrl, password } = body;

    // Validate required fields
    if (!name || !email || !facultyId || !department) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, email, facultyId, department' },
        { status: 400 }
      );
    }

    // Check if faculty ID already exists
    const existingFaculty = await Faculty.findOne({ facultyId });
    if (existingFaculty) {
      return NextResponse.json(
        { success: false, error: 'Faculty with this ID already exists' },
        { status: 409 }
      );
    }

    // Check if user with email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
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
      role: 'faculty',
      isVerified: true, // Admin-created users are auto-verified
      imageUrl,
    });

    // Create faculty record
    const faculty = await Faculty.create({
      userId: user._id,
      facultyId,
      department,
    });

    const populatedFaculty = await Faculty.findById(faculty._id)
      .populate('userId', 'name email imageUrl')
      .lean();

    if (!populatedFaculty) {
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve created faculty' },
        { status: 500 }
      );
    }

    const facultyData = populatedFaculty as any;

    return NextResponse.json({
      success: true,
      message: 'Faculty created successfully',
      faculty: {
        _id: facultyData._id,
        facultyId: facultyData.facultyId,
        name: facultyData.userId?.name || name,
        email: facultyData.userId?.email || email,
        department: facultyData.department,
        imageUrl: facultyData.imageUrl,
      },
    });
  } catch (error) {
    console.error('Error creating faculty:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create faculty' },
      { status: 500 }
    );
  }
}
