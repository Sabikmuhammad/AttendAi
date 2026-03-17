import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Institution from '@/models/Institution';
import { getTenantContext } from '@/lib/tenant';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const tenant = await getTenantContext(req);
    
    if (!tenant.institutionId) {
       return NextResponse.json({ error: 'No institution found for context' }, { status: 400 });
    }

    let targetId = tenant.institutionId;

    // Developer fallback: if unauthenticated in the mock admin panel, 
    // it falls back to DEFAULT_INSTITUTION_ID. 
    // Let's grab the most recently created real institution instead for testing.
    if (targetId === process.env.DEFAULT_INSTITUTION_ID || targetId === 'default-institution') {
      const latestInst = await Institution.findOne({ 
        code: { $ne: 'SUPER' } 
      }).sort({ createdAt: -1 }).lean();
      
      if (latestInst) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        targetId = String((latestInst as any)._id);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const institution: any = await Institution.findOne({ _id: targetId }).lean();
    
    if (!institution) {
      return NextResponse.json({ error: 'Institution not found' }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inst: any = institution;

    return NextResponse.json({
      success: true,
      institution: {
        id: inst._id,
        name: inst.name,
        code: inst.code,
      }
    });

  } catch (error) {
    console.error('Error fetching tenant info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tenant info' },
      { status: 500 }
    );
  }
}
