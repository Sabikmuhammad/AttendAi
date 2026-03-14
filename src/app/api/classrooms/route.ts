/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Classroom from '@/models/Classroom';
import { getTenantContext, withInstitutionScope } from '@/lib/tenant';

// GET - Fetch all classrooms
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const tenant = await getTenantContext(request);

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const hasCamera = searchParams.get('hasCamera');

    const query: any = withInstitutionScope({}, tenant.institutionId);
    
    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }
    
    if (hasCamera !== null) {
      query.hasCamera = hasCamera === 'true';
    }

    const classrooms = await Classroom.find(query).sort({ roomNumber: 1 });

    return NextResponse.json({
      success: true,
      classrooms,
      count: classrooms.length,
    });
  } catch (error) {
    console.error('Error fetching classrooms:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch classrooms' },
      { status: 500 }
    );
  }
}

// POST - Create a new classroom
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const tenant = await getTenantContext(request);

    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.roomNumber) {
      return NextResponse.json(
        { success: false, error: 'Name and room number are required' },
        { status: 400 }
      );
    }

    // Check if classroom with same room number already exists
    const existingClassroom = await Classroom.findOne({ 
      institutionId: tenant.institutionId,
      roomNumber: body.roomNumber 
    });

    if (existingClassroom) {
      return NextResponse.json(
        { success: false, error: 'A classroom with this room number already exists' },
        { status: 409 }
      );
    }

    // Create new classroom
    const classroom = new Classroom({
      institutionId: tenant.institutionId,
      name: body.name,
      roomNumber: body.roomNumber,
      building: body.building,
      floor: body.floor,
      capacity: body.capacity,
      location: body.location,
      hasCamera: body.hasCamera || false,
      cameraType: body.cameraType || 'none',
      rtspUrl: body.rtspUrl,
      rtspUsername: body.rtspUsername,
      rtspPassword: body.rtspPassword,
      isActive: body.isActive !== undefined ? body.isActive : true,
      notes: body.notes,
    });

    await classroom.save();

    return NextResponse.json({
      success: true,
      classroom,
      message: 'Classroom created successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating classroom:', error);

    if (error?.code === 11000) {
      const hasLegacyRoomNumberIndexConflict =
        error?.keyPattern?.roomNumber === 1 && !error?.keyPattern?.institutionId;

      if (hasLegacyRoomNumberIndexConflict) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Legacy classroom index conflict detected. Please restart the server once and try again.',
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: 'A classroom with this room number already exists for your institution',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create classroom' 
      },
      { status: 500 }
    );
  }
}

// PUT - Update a classroom
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const tenant = await getTenantContext(request);

    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json(
        { success: false, error: 'Classroom ID is required' },
        { status: 400 }
      );
    }

    const classroom = await Classroom.findOneAndUpdate(
      withInstitutionScope({ _id }, tenant.institutionId),
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!classroom) {
      return NextResponse.json(
        { success: false, error: 'Classroom not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      classroom,
      message: 'Classroom updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating classroom:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to update classroom' 
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a classroom
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const tenant = await getTenantContext(request);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Classroom ID is required' },
        { status: 400 }
      );
    }

    const classroom = await Classroom.findOneAndDelete(
      withInstitutionScope({ _id: id }, tenant.institutionId)
    );

    if (!classroom) {
      return NextResponse.json(
        { success: false, error: 'Classroom not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Classroom deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting classroom:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to delete classroom' 
      },
      { status: 500 }
    );
  }
}
