import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';
import User from '@/models/User';
import { getTenantContext, withInstitutionScope } from '@/lib/tenant';
import { checkLimit } from '@/lib/trial';

type StudentLeanWithUser = {
  _id: string;
  studentId: string;
  department: string;
  section: string;
  semester: string;
  imageUrl?: string;
  faceEmbedding?: number[];
  createdAt: Date;
  updatedAt: Date;
  userId?: {
    name?: string;
    email?: string;
    imageUrl?: string;
  };
};

function isStudentsManagerRole(role?: string): boolean {
  return (
    role === 'super_admin' ||
    role === 'institution_admin' ||
    role === 'department_admin' ||
    role === 'admin'
  );
}

async function resolveInstitutionId(userId?: string, fallbackInstitutionId?: string): Promise<string> {
  if (!userId) {
    if (fallbackInstitutionId) {
      return fallbackInstitutionId;
    }
    throw new Error('Missing authenticated user context');
  }

  try {
    const authUser = await User.findById(userId).select('institutionId').lean<{ institutionId?: string }>();
    if (authUser?.institutionId) {
      return authUser.institutionId;
    }
  } catch (err) {
    console.warn('Failed to resolve institution from user:', err);
  }

  const resolved = fallbackInstitutionId || process.env.DEFAULT_INSTITUTION_ID || 'default-institution';
  if (!resolved) {
    throw new Error('No valid institution context found');
  }

  return resolved;
}

// GET all students
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const tenant = await getTenantContext(req);

    if (!tenant.userId || !isStudentsManagerRole(tenant.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const institutionId = await resolveInstitutionId(tenant.userId, tenant.institutionId);

    const { searchParams } = new URL(req.url);
    const department = searchParams.get('department');
    const section = searchParams.get('section');
    const semester = searchParams.get('semester');

    const filter: Record<string, unknown> = withInstitutionScope({}, institutionId);
    if (department) filter.department = department;
    if (section) filter.section = section;
    if (semester) filter.semester = semester;

    const students = await Student.find(filter)
      .populate('userId', 'name email imageUrl')
      .sort({ createdAt: -1 })
      .lean<StudentLeanWithUser[]>();

    // Transform to include user data at top level for backward compatibility
    const transformedStudents = students.map((student) => ({
      _id: student._id,
      studentId: student.studentId,
      name: student.userId?.name || 'Unknown',
      email: student.userId?.email || '',
      registerNumber: student.studentId, // For backward compatibility
      department: student.department,
      section: student.section,
      semester: student.semester,
      imageUrl: student.imageUrl || student.userId?.imageUrl,
      faceEmbedding: student.faceEmbedding,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    }));

    return NextResponse.json({ success: true, students: transformedStudents });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

// POST create new student (admin creating student manually)
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const tenant = await getTenantContext(req);

    if (!tenant.userId || !isStudentsManagerRole(tenant.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const institutionId = await resolveInstitutionId(tenant.userId, tenant.institutionId);

    const body = await req.json();
    const { name, email, studentId, department, section, semester, imageUrl, password } = body;

    // Validate required fields
    if (!name || !email || !studentId || !department || !section || !semester) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, studentId, department, section, semester' },
        { status: 400 }
      );
    }

    // Trial limit check
    const currentCount = await Student.countDocuments({ institutionId });
    const limitCheck = await checkLimit(institutionId, 'students', currentCount);
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: limitCheck.message }, { status: 403 });
    }

    // Check if student ID already exists
    const existingStudent = await Student.findOne(
      withInstitutionScope({ studentId }, institutionId)
    );
    if (existingStudent) {
      return NextResponse.json(
        { error: 'Student with this ID already exists' },
        { status: 409 }
      );
    }

    // Check if user with email already exists
    const existingUser = await User.findOne(
      withInstitutionScope({ email: email.toLowerCase() }, institutionId)
    );
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create user account
    const hashedPassword = password 
      ? await bcrypt.hash(password, 12)
      : await bcrypt.hash('ChangeMe@123', 12); // Default password

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'student',
      institutionId,
      isVerified: true, // Admin-created users are auto-verified
      imageUrl,
    });

    // Create student record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const studentPayload: Record<string, any> = {
      userId: user._id,
      studentId,
      department,
      section,
      semester,
      institutionId,
    };

    if (imageUrl) {
      studentPayload.imageUrl = imageUrl;
      // Also try to generate an embedding immediately
      try {
        const { generateFaceEmbedding } = await import('@/services/embeddingService');
        const embeddingResult = await generateFaceEmbedding(imageUrl);
        studentPayload.faceEmbedding = embeddingResult.embedding;
      } catch (embError) {
        console.error('Failed to generate embedding during student creation:', embError);
        // We still create the student, just without the embedding
      }
    }

    const student = await Student.create(studentPayload);

    const populatedStudent = await Student.findOne(
      withInstitutionScope({ _id: student._id }, institutionId)
    )
      .populate('userId', 'name email imageUrl')
      .lean<StudentLeanWithUser>();

    if (!populatedStudent) {
      return NextResponse.json(
        { error: 'Failed to retrieve created student' },
        { status: 500 }
      );
    }

    const studentData = populatedStudent;

    return NextResponse.json({
      success: true,
      message: 'Student created successfully',
      student: {
        _id: studentData._id,
        studentId: studentData.studentId,
        name: studentData.userId?.name || name,
        email: studentData.userId?.email || email,
        registerNumber: studentData.studentId,
        department: studentData.department,
        section: studentData.section,
        imageUrl: studentData.imageUrl,
      },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Error creating student:', errorMsg, error);
    return NextResponse.json(
      { success: false, error: errorMsg || 'Failed to create student', details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE student
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const tenant = await getTenantContext(req);

    if (!tenant.userId || !isStudentsManagerRole(tenant.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const institutionId = await resolveInstitutionId(tenant.userId, tenant.institutionId);

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('id');

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    const deletedStudent = await Student.findOneAndDelete(
      withInstitutionScope({ _id: studentId }, institutionId)
    );

    if (!deletedStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    );
  }
}
