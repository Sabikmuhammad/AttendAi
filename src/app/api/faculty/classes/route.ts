import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Class from '@/models/Class';
import Faculty from '@/models/Faculty';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get facultyId from query parameter (temporary workaround for auth issues)
    const { searchParams } = new URL(request.url);
    const facultyIdParam = searchParams.get('facultyId');

    let facultyQuery: any = {};
    
    // Try to get session if available
    try {
      const session = await auth();
      if (session && session.user) {
        console.log('🔐 Session found for user:', session.user.id);
        // Session has User ID, need to find Faculty record first
        const faculty = await Faculty.findOne({ userId: session.user.id });
        if (faculty) {
          console.log('✅ Found faculty record:', faculty._id.toString());
          // Use Faculty's _id to query classes
          facultyQuery = { facultyId: faculty._id.toString() };
        } else {
          console.log('⚠️ No faculty record found for userId:', session.user.id);
        }
      }
    } catch (authError) {
      console.log('No auth session, using facultyId parameter or returning all classes');
    }

    // If facultyId parameter is provided, use that instead
    if (facultyIdParam) {
      console.log('📝 Using facultyId parameter:', facultyIdParam);
      facultyQuery = { facultyId: facultyIdParam };
    }

    console.log('🔍 Querying classes with:', JSON.stringify(facultyQuery));

    // Get classes - if no specific faculty query, return all classes
    const classes = await Class.find(facultyQuery)
      .populate('studentIds', 'studentId')
      .populate({
        path: 'studentIds',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .sort({ startTime: -1 })
      .lean();

    console.log(`📚 Found ${classes.length} classes`);

    return NextResponse.json({
      success: true,
      classes,
    });
  } catch (error) {
    console.error('Error fetching faculty classes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}
