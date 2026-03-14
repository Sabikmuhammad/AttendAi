/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Admin API: Upload Student Image
 * 
 * POST /api/admin/upload-student-image
 * 
 * Orchestrates the complete student image upload pipeline:
 * 1. Upload image to Cloudinary
 * 2. Generate face embedding via AI service
 * 3. Store data in MongoDB
 * 
 * Requires admin authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';
import User from '@/models/User';
import { uploadStudentImage, ImageUploadError } from '@/services/imageUploadService';
import { generateFaceEmbedding, EmbeddingServiceError } from '@/services/embeddingService';
import { withInstitutionScope } from '@/lib/tenant';

/**
 * Response format for successful upload
 */
interface UploadSuccessResponse {
  success: true;
  studentId: string;
  imageUrl: string;
  embeddingGenerated: boolean;
  message: string;
}

/**
 * Response format for errors
 */
interface UploadErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: string;
}

/**
 * POST /api/admin/upload-student-image
 * 
 * Upload student profile image with face embedding generation
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate and authorize
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<UploadErrorResponse>(
        {
          success: false,
          error: 'Unauthorized',
          code: 'AUTH_REQUIRED',
        },
        { status: 401 }
      );
    }

    const institutionId =
      (session.user as any).institutionId ||
      process.env.DEFAULT_INSTITUTION_ID ||
      'default-institution';

    const user = await User.findOne(
      withInstitutionScope({ _id: session.user.id }, institutionId)
    );

    if (
      !user ||
      !['super_admin', 'institution_admin', 'department_admin', 'admin'].includes(user.role)
    ) {
      return NextResponse.json<UploadErrorResponse>(
        {
          success: false,
          error: 'Forbidden: Admin access required',
          code: 'INSUFFICIENT_PERMISSIONS',
        },
        { status: 403 }
      );
    }

    // 2. Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    const studentId = formData.get('studentId') as string | null;
    const generateEmbedding = formData.get('generateEmbedding') === 'true';

    if (!file) {
      return NextResponse.json<UploadErrorResponse>(
        {
          success: false,
          error: 'Image file is required',
          code: 'MISSING_FILE',
        },
        { status: 400 }
      );
    }

    if (!studentId) {
      return NextResponse.json<UploadErrorResponse>(
        {
          success: false,
          error: 'Student ID is required',
          code: 'MISSING_STUDENT_ID',
        },
        { status: 400 }
      );
    }

    // 3. Connect to database
    await connectDB();

    // 4. Verify student exists
    const student = await Student.findOne(
      withInstitutionScope({ studentId }, institutionId)
    );

    if (!student) {
      return NextResponse.json<UploadErrorResponse>(
        {
          success: false,
          error: `Student with ID ${studentId} not found`,
          code: 'STUDENT_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // 5. Upload image to Cloudinary
    console.log(`📤 Uploading image for student ${studentId}...`);
    
    let uploadResult;
    try {
      uploadResult = await uploadStudentImage(file, studentId);
    } catch (error) {
      if (error instanceof ImageUploadError) {
        return NextResponse.json<UploadErrorResponse>(
          {
            success: false,
            error: error.message,
            code: error.code,
          },
          { status: 400 }
        );
      }
      throw error;
    }

    console.log(`✅ Image uploaded successfully: ${uploadResult.imageUrl}`);

    // 6. Generate face embedding (if requested)
    let embedding: number[] | undefined;
    let embeddingGenerated = false;

    if (generateEmbedding) {
      console.log(`🤖 Generating face embedding for student ${studentId}...`);
      
      try {
        const embeddingResult = await generateFaceEmbedding(uploadResult.imageUrl);
        embedding = embeddingResult.embedding;
        embeddingGenerated = true;
        console.log(`✅ Face embedding generated successfully (${embedding.length} dimensions)`);
      } catch (error) {
        if (error instanceof EmbeddingServiceError) {
          console.error(`❌ Embedding generation failed: ${error.message}`);
          
          // Don't fail the entire request - still save the image
          // Return a warning about embedding failure
          const updateData: any = {
            imageUrl: uploadResult.imageUrl,
            updatedAt: new Date(),
          };

          await Student.findOneAndUpdate(
            withInstitutionScope({ _id: student._id }, institutionId),
            { $set: updateData }
          );

          return NextResponse.json<UploadSuccessResponse>(
            {
              success: true,
              studentId: student.studentId,
              imageUrl: uploadResult.imageUrl,
              embeddingGenerated: false,
              message: `Image uploaded successfully, but embedding generation failed: ${error.message}`,
            },
            { status: 200 }
          );
        }
        throw error;
      }
    }

    // 7. Update student record in MongoDB
    const updateData: any = {
      imageUrl: uploadResult.imageUrl,
      updatedAt: new Date(),
    };

    if (embedding) {
      updateData.faceEmbedding = embedding;
    }

    await Student.findOneAndUpdate(
      withInstitutionScope({ _id: student._id }, institutionId),
      { $set: updateData }
    );

    console.log(`💾 Student record updated in database`);

    // 8. Return success response
    return NextResponse.json<UploadSuccessResponse>(
      {
        success: true,
        studentId: student.studentId,
        imageUrl: uploadResult.imageUrl,
        embeddingGenerated,
        message: embeddingGenerated
          ? 'Image uploaded and face embedding generated successfully'
          : 'Image uploaded successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Upload error:', error);

    return NextResponse.json<UploadErrorResponse>(
      {
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/upload-student-image
 * 
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    endpoint: '/api/admin/upload-student-image',
    methods: ['POST'],
    description: 'Upload student profile image with face embedding generation',
  });
}
