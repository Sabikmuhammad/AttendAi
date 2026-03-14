/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Faculty from '@/models/Faculty';
import { getTenantContext, withInstitutionScope } from '@/lib/tenant';

// PATCH - Update faculty section assignment
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const tenant = await getTenantContext(req);

    const body = await req.json();
    const { facultyId, section, semester } = body;

    if (!facultyId) {
      return NextResponse.json(
        { success: false, error: 'Faculty ID is required' },
        { status: 400 }
      );
    }

    const faculty = await Faculty.findOneAndUpdate(
      withInstitutionScope({ facultyId }, tenant.institutionId),
      { 
        section: section || null, 
        semester: semester || null 
      },
      { new: true }
    ).populate('userId', 'name email');

    if (!faculty) {
      return NextResponse.json(
        { success: false, error: 'Faculty not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Section assignment updated successfully',
      faculty: {
        _id: faculty._id,
        facultyId: faculty.facultyId,
        name: (faculty as any).userId?.name || 'Unknown',
        email: (faculty as any).userId?.email || '',
        department: faculty.department,
        section: faculty.section,
        semester: faculty.semester,
      },
    });
  } catch (error) {
    console.error('Error updating faculty section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update section assignment' },
      { status: 500 }
    );
  }
}
