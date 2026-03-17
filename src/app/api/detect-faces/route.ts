/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Class from '@/models/Class';
import Student from '@/models/Student';
import { getTenantContext, withInstitutionScope } from '@/lib/tenant';
import { requireTenantUser } from '@/lib/auth-guards';

/**
 * API endpoint to detect faces in uploaded images
 * This sends the image to the Python FastAPI service for face detection
 */
export async function POST(request: NextRequest) {
  try {
    const tenant = await getTenantContext(request);
    const guard = requireTenantUser(tenant, {
      roles: ['super_admin', 'institution_admin', 'department_admin', 'admin', 'faculty'],
    });
    if (guard) return guard;

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { success: false, error: 'Content-Type must be multipart/form-data' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const image = formData.get('image') as File;
    const classId = formData.get('classId') as string;

    if (!image || !classId) {
      return NextResponse.json(
        { success: false, error: 'Missing image or classId' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get class data with enrolled students
    const classData: any = await Class.findOne(
      withInstitutionScope({ _id: classId }, tenant.institutionId)
    )
      .populate('studentIds')
      .lean();

    if (!classData) {
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 404 }
      );
    }

    // Prepare form data for Python service
    const pythonFormData = new FormData();
    pythonFormData.append('file', image);
    
    // Send enrolled student IDs for comparison
    const studentIds = Array.isArray(classData.studentIds)
      ? classData.studentIds.map((s: any) => s._id?.toString() || s.toString())
      : [];
    pythonFormData.append('enrolled_students', JSON.stringify(studentIds));

    // Call Python FastAPI service
    // Adjust the URL based on your Python service configuration
    const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
    
    try {
      const response = await fetch(`${PYTHON_SERVICE_URL}/detect`, {
        method: 'POST',
        body: pythonFormData,
      });

      if (!response.ok) {
        throw new Error('Python service error');
      }

      const detectionResult = await response.json();

      // Format detected students
      const detectedStudents = await Promise.all(
        detectionResult.detected_students.map(async (detection: any) => {
          const student: any = await Student.findOne(
            withInstitutionScope({ _id: detection.student_id }, tenant.institutionId)
          )
            .populate('userId', 'name')
            .lean();
          
          if (!student) return null;

          return {
            studentId: student._id.toString(),
            name: student.userId?.name || student.studentId,
            registerNumber: student.studentId,
            confidence: detection.confidence,
            timestamp: new Date().toISOString(),
          };
        })
      );

      // Filter out null values
      const validDetections = detectedStudents.filter(d => d !== null);

      return NextResponse.json({
        success: true,
        detectedStudents: validDetections,
        totalDetected: validDetections.length,
      });
    } catch (pythonError) {
      // If Python service is not available, return mock data for testing
      console.error('Python service not available:', pythonError);
      
      // FOR TESTING ONLY: Return mock detection
      // Remove this in production
      if (process.env.NODE_ENV === 'development') {
        const mockStudent = classData.studentIds[0] as any;
        
        return NextResponse.json({
          success: true,
          detectedStudents: [{
            studentId: mockStudent._id.toString(),
            name: mockStudent.name,
            registerNumber: mockStudent.registerNumber,
            confidence: 0.95,
            timestamp: new Date().toISOString(),
          }],
          totalDetected: 1,
          note: 'Using mock data - Python service not available',
        });
      }

      return NextResponse.json(
        { 
          success: false, 
          error: 'Face detection service unavailable',
          details: 'Please ensure the Python FastAPI service is running',
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error in face detection:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to detect faces' },
      { status: 500 }
    );
  }
}
