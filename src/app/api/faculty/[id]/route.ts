/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Faculty from '@/models/Faculty';
import User from '@/models/User';
import { getTenantContext, withInstitutionScope } from '@/lib/tenant';

// GET single faculty
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const tenant = await getTenantContext(req);

    const { id } = await params;
    const faculty = await Faculty.findOne(withInstitutionScope({ _id: id }, tenant.institutionId))
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
        section: facultyData.section,
        semester: facultyData.semester,
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
    const tenant = await getTenantContext(req);

    const { id } = await params;
    const body = await req.json();
    const { name, email, department, designation, section, semester, imageUrl } = body;

    // Find the faculty record
    const faculty = await Faculty.findOne(withInstitutionScope({ _id: id }, tenant.institutionId));
    if (!faculty) {
      return NextResponse.json(
        { success: false, error: 'Faculty not found' },
        { status: 404 }
      );
    }

    // Update faculty fields (department, designation, section, semester)
    const facultyUpdateData: any = {};
    if (department !== undefined) facultyUpdateData.department = department;
    if (designation !== undefined) facultyUpdateData.designation = designation;
    
    // Handle section and semester - convert empty strings to null to clear the field
    if (section !== undefined) {
      facultyUpdateData.section = section === '' ? null : section;
    }
    if (semester !== undefined) {
      facultyUpdateData.semester = semester === '' ? null : semester;
    }
    
    if (Object.keys(facultyUpdateData).length > 0) {
      facultyUpdateData.updatedAt = new Date();
      await Faculty.findOneAndUpdate(
        withInstitutionScope({ _id: id }, tenant.institutionId),
        { $set: facultyUpdateData },
        { new: true }
      );
    }

    // Update user fields (name, email, imageUrl)
    const userUpdateData: any = {};
    if (name !== undefined) userUpdateData.name = name;
    if (email !== undefined) userUpdateData.email = email.toLowerCase();
    if (imageUrl !== undefined) userUpdateData.imageUrl = imageUrl;

    if (Object.keys(userUpdateData).length > 0) {
      await User.findOneAndUpdate(
        withInstitutionScope({ _id: faculty.userId }, tenant.institutionId),
        { $set: userUpdateData }
      );
    }

    // Fetch updated faculty
    const updatedFaculty = await Faculty.findOne(withInstitutionScope({ _id: id }, tenant.institutionId))
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
        section: facultyData.section,
        semester: facultyData.semester,
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
    const tenant = await getTenantContext(req);

    const { id } = await params;
    
    // Find the faculty record to get the userId
    const faculty = await Faculty.findOne(withInstitutionScope({ _id: id }, tenant.institutionId));
    if (!faculty) {
      return NextResponse.json(
        { success: false, error: 'Faculty not found' },
        { status: 404 }
      );
    }

    const userId = faculty.userId;

    // Delete the faculty record
    await Faculty.findOneAndDelete(withInstitutionScope({ _id: id }, tenant.institutionId));

    // Delete the associated user record
    await User.findOneAndDelete(withInstitutionScope({ _id: userId }, tenant.institutionId));

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
