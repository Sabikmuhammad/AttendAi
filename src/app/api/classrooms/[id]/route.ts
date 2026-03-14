import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Classroom from '@/models/Classroom';
import { getTenantContext, withInstitutionScope } from '@/lib/tenant';

// GET - Fetch single classroom
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const tenant = await getTenantContext(request);
    const { id } = await params;

    const classroom = await Classroom.findOne(
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
      classroom,
    });
  } catch (error) {
    console.error('Error fetching classroom:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch classroom' },
      { status: 500 }
    );
  }
}
