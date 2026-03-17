import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Institution from '@/models/Institution';

export async function GET(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get('slug')?.toLowerCase().trim();

  if (!slug) {
    return NextResponse.json({ success: false, error: 'slug is required' }, { status: 400 });
  }

  try {
    await connectDB();
    const inst = await Institution.findOne({ subdomain: slug })
      .select('name status')
      .lean<{ name: string; status: string }>();

    if (!inst) {
      return NextResponse.json({ success: false, error: 'Institution not found' }, { status: 404 });
    }

    if (inst.status === 'suspended') {
      return NextResponse.json({ success: false, error: 'Institution is suspended' }, { status: 403 });
    }

    return NextResponse.json({ success: true, name: inst.name });
  } catch (error) {
    console.error('Institution lookup error:', error);
    return NextResponse.json({ success: false, error: 'Lookup failed' }, { status: 500 });
  }
}
