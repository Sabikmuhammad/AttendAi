import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Class from '@/models/Class';
import { getTenantContext, withInstitutionScope } from '@/lib/tenant';
import { requireTenantUser } from '@/lib/auth-guards';

// GET single class
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const tenant = await getTenantContext(req);
    const guard = requireTenantUser(tenant);
    if (guard) return guard;

    const { id } = await params;
    const classData = await Class.findOne(withInstitutionScope({ _id: id }, tenant.institutionId))
      .populate('studentIds', 'name registerNumber department')
      .lean();

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, class: classData });
  } catch (error) {
    console.error('Error fetching class:', error);
    return NextResponse.json(
      { error: 'Failed to fetch class' },
      { status: 500 }
    );
  }
}

// PATCH update class
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const tenant = await getTenantContext(req);
    const guard = requireTenantUser(tenant, {
      roles: ['super_admin', 'institution_admin', 'department_admin', 'admin'],
    });
    if (guard) return guard;

    const { id } = await params;
    const body = await req.json();

    const updatedClass = await Class.findOneAndUpdate(
      withInstitutionScope({ _id: id }, tenant.institutionId),
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Class updated successfully',
      class: updatedClass,
    });
  } catch (error) {
    console.error('Error updating class:', error);
    return NextResponse.json(
      { error: 'Failed to update class' },
      { status: 500 }
    );
  }
}

// DELETE class
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const tenant = await getTenantContext(req);
    const guard = requireTenantUser(tenant, {
      roles: ['super_admin', 'institution_admin', 'department_admin', 'admin'],
    });
    if (guard) return guard;

    const { id } = await params;
    const deletedClass = await Class.findOneAndDelete(
      withInstitutionScope({ _id: id }, tenant.institutionId)
    );

    if (!deletedClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Class deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting class:', error);
    return NextResponse.json(
      { error: 'Failed to delete class' },
      { status: 500 }
    );
  }
}
