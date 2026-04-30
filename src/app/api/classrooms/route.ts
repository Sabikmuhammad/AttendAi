import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Classroom from '@/models/Classroom';
import User from '@/models/User';
import { getTenantContext, withInstitutionScope } from '@/lib/tenant';
import { checkLimit } from '@/lib/trial';
import { requireTenantUser } from '@/lib/auth-guards';

function isLegacyGlobalRoomNumberDuplicate(error: unknown): boolean {
  const err = error as {
    code?: number;
    keyPattern?: { roomNumber?: number; name?: number; institutionId?: number };
    message?: string;
  };

  const message = String(err?.message || '');
  const mentionsLegacyRoomIndex =
    message.includes('index: roomNumber_1') ||
    message.includes('roomNumber_1 dup key');

  const mentionsLegacyNameIndex =
    message.includes('index: name_1') ||
    message.includes('name_1 dup key');

  return Boolean(
    err?.code === 11000 && (
      (err?.keyPattern?.roomNumber === 1 && !err?.keyPattern?.institutionId) ||
      (err?.keyPattern?.name === 1 && !err?.keyPattern?.institutionId) ||
      mentionsLegacyRoomIndex ||
      mentionsLegacyNameIndex
    )
  );
}

async function repairLegacyClassroomIndex() {
  // Remove any legacy global unique classroom indexes and enforce tenant-scoped uniqueness.
  const indexes = await Classroom.collection.indexes();
  const legacyIndexes = indexes.filter((index) => {
    const keys = Object.keys(index.key || {});
    return index.unique && keys.length === 1 && (keys[0] === 'roomNumber' || keys[0] === 'name');
  });

  for (const index of legacyIndexes) {
    if (index.name) {
      await Classroom.collection.dropIndex(index.name).catch(() => null);
    }
  }

  await Classroom.collection.createIndex(
    { institutionId: 1, roomNumber: 1 },
    { unique: true, name: 'institutionId_1_roomNumber_1' }
  );
}

async function resolveInstitutionId(userId?: string, fallbackInstitutionId?: string): Promise<string> {
  if (!userId) {
    throw new Error('Missing authenticated user context');
  }

  const authUser = await User.findById(userId).select('institutionId').lean<{ institutionId?: string }>();
  const resolved = authUser?.institutionId || fallbackInstitutionId;
  if (!resolved || resolved === 'default-institution' || resolved === process.env.DEFAULT_INSTITUTION_ID) {
    throw new Error('No valid institution context found for this account');
  }

  return resolved;
}

// GET - Fetch all classrooms
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const tenant = await getTenantContext(request);
    const guard = requireTenantUser(tenant, {
      roles: ['super_admin', 'institution_admin', 'department_admin', 'admin'],
    });
    if (guard) {
      return guard;
    }
    const institutionId = await resolveInstitutionId(tenant.userId, tenant.institutionId);

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const hasCamera = searchParams.get('hasCamera');

    const query: Record<string, unknown> = withInstitutionScope({}, institutionId);
    
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
  let institutionId = '';
  let normalizedRoomNumber = '';
  let classroomPayload: Record<string, unknown> | null = null;

  try {
    await connectDB();
    const tenant = await getTenantContext(request);
    const guard = requireTenantUser(tenant, {
      roles: ['super_admin', 'institution_admin', 'department_admin', 'admin'],
    });
    if (guard) {
      return guard;
    }

    const body = await request.json();

    institutionId = await resolveInstitutionId(tenant.userId, tenant.institutionId);
    
    // Trial limit check
    const currentCount = await Classroom.countDocuments({ institutionId });
    const limitCheck = await checkLimit(institutionId, 'classrooms', currentCount);
    if (!limitCheck.allowed) {
      return NextResponse.json({ success: false, error: limitCheck.message }, { status: 403 });
    }

    // Validate required fields
    if (!body.name || !body.roomNumber) {
      return NextResponse.json(
        { success: false, error: 'Name and room number are required' },
        { status: 400 }
      );
    }

    normalizedRoomNumber = String(body.roomNumber).trim();

    // Check if classroom with same room number already exists
    const existingClassroom = await Classroom.findOne({ 
      institutionId,
      roomNumber: normalizedRoomNumber,
    });

    if (existingClassroom) {
      return NextResponse.json(
        {
          success: false,
          error: `Room number ${normalizedRoomNumber} is already used by classroom \"${existingClassroom.name}\"`,
          conflict: {
            classroomId: String(existingClassroom._id),
            classroomName: existingClassroom.name,
            roomNumber: existingClassroom.roomNumber,
            institutionId: existingClassroom.institutionId,
          },
        },
        { status: 409 }
      );
    }

    classroomPayload = {
      institutionId,
      name: String(body.name).trim(),
      roomNumber: normalizedRoomNumber,
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
    };

    // Create new classroom (repair legacy index once and retry when needed)
    let classroom;
    try {
      classroom = await Classroom.create(classroomPayload);
    } catch (error) {
      if (isLegacyGlobalRoomNumberDuplicate(error)) {
        await repairLegacyClassroomIndex();
        classroom = await Classroom.create(classroomPayload);
      } else {
        throw error;
      }
    }

    return NextResponse.json({
      success: true,
      classroom,
      message: 'Classroom created successfully',
    }, { status: 201 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error creating classroom:', error);

    if (error?.code === 11000) {
      if (isLegacyGlobalRoomNumberDuplicate(error) && classroomPayload) {
        try {
          await repairLegacyClassroomIndex();
          const retried = await Classroom.create(classroomPayload);
          return NextResponse.json(
            {
              success: true,
              classroom: retried,
              message: 'Classroom created successfully',
            },
            { status: 201 }
          );
        } catch {
          // Fall through to detailed conflict response below.
        }
      }

      const conflict = institutionId && normalizedRoomNumber
        ? await Classroom.findOne({ institutionId, roomNumber: normalizedRoomNumber })
            .select('_id name roomNumber institutionId')
            .lean<{ _id: string; name: string; roomNumber: string; institutionId: string }>()
        : null;

      return NextResponse.json(
        {
          success: false,
          error: conflict
            ? `Room number ${normalizedRoomNumber} is already used by classroom \"${conflict.name}\"`
            : 'A classroom with this room number already exists for your institution',
          conflict: conflict
            ? {
                classroomId: String(conflict._id),
                classroomName: conflict.name,
                roomNumber: conflict.roomNumber,
                institutionId: conflict.institutionId,
              }
            : undefined,
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
    const guard = requireTenantUser(tenant, {
      roles: ['super_admin', 'institution_admin', 'department_admin', 'admin'],
    });
    if (guard) {
      return guard;
    }
    const institutionId = await resolveInstitutionId(tenant.userId, tenant.institutionId);

    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json(
        { success: false, error: 'Classroom ID is required' },
        { status: 400 }
      );
    }

    const classroom = await Classroom.findOneAndUpdate(
      withInstitutionScope({ _id }, institutionId),
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const guard = requireTenantUser(tenant, {
      roles: ['super_admin', 'institution_admin', 'department_admin', 'admin'],
    });
    if (guard) {
      return guard;
    }
    const institutionId = await resolveInstitutionId(tenant.userId, tenant.institutionId);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Classroom ID is required' },
        { status: 400 }
      );
    }

    const classroom = await Classroom.findOneAndDelete(
      withInstitutionScope({ _id: id }, institutionId)
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
