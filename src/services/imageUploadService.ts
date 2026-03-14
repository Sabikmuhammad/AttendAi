/**
 * Image Upload Service
 * 
 * Handles secure image uploads to Cloudinary with validation,
 * error handling, and optimized storage configuration.
 */

import cloudinary, { UPLOAD_PRESETS, ensureCloudinaryConfigured } from '@/lib/cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

/**
 * Supported image MIME types
 */
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

/**
 * Maximum file size: 5MB
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Validation error types
 */
export class ImageUploadError extends Error {
  constructor(
    message: string,
    public code: 'INVALID_TYPE' | 'FILE_TOO_LARGE' | 'UPLOAD_FAILED'
  ) {
    super(message);
    this.name = 'ImageUploadError';
  }
}

/**
 * Upload result interface
 */
export interface UploadResult {
  success: boolean;
  imageUrl: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * Validate image file before upload
 */
function validateImageFile(file: File): void {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new ImageUploadError(
      `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
      'INVALID_TYPE'
    );
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new ImageUploadError(
      `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      'FILE_TOO_LARGE'
    );
  }
}

/**
 * Convert File to base64 data URI for Cloudinary upload
 */
async function fileToDataUri(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString('base64');
  return `data:${file.type};base64,${base64}`;
}

/**
 * Upload student profile image to Cloudinary
 * 
 * @param file - The image file to upload
 * @param studentId - Unique identifier for the student
 * @returns Upload result with secure URL and metadata
 */
export async function uploadStudentImage(
  file: File,
  studentId: string
): Promise<UploadResult> {
  try {
    ensureCloudinaryConfigured();

    // Validate file
    validateImageFile(file);

    // Convert to data URI
    const dataUri = await fileToDataUri(file);

    // Upload to Cloudinary
    const result: UploadApiResponse = await cloudinary.uploader.upload(dataUri, {
      folder: UPLOAD_PRESETS.STUDENT_PROFILE.folder,
      public_id: `student_${studentId}_${Date.now()}`,
      transformation: UPLOAD_PRESETS.STUDENT_PROFILE.transformation,
      overwrite: false,
      resource_type: 'image',
    });

    return {
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    if (error instanceof ImageUploadError) {
      throw error;
    }

    // Handle Cloudinary-specific errors
    const cloudinaryError = error as UploadApiErrorResponse;
    throw new ImageUploadError(
      `Failed to upload image: ${cloudinaryError.message || 'Unknown error'}`,
      'UPLOAD_FAILED'
    );
  }
}

/**
 * Upload multiple images to dataset (for training data)
 * 
 * @param files - Array of image files
 * @param studentId - Unique identifier for the student
 * @returns Array of upload results
 */
export async function uploadStudentDataset(
  files: File[],
  studentId: string
): Promise<UploadResult[]> {
  ensureCloudinaryConfigured();

  const uploadPromises = files.map(async (file, index) => {
    validateImageFile(file);
    const dataUri = await fileToDataUri(file);

    const result: UploadApiResponse = await cloudinary.uploader.upload(dataUri, {
      folder: UPLOAD_PRESETS.STUDENT_DATASET.folder,
      public_id: `student_${studentId}_dataset_${index}_${Date.now()}`,
      transformation: UPLOAD_PRESETS.STUDENT_DATASET.transformation,
      overwrite: false,
      resource_type: 'image',
    });

    return {
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  });

  return Promise.all(uploadPromises);
}

/**
 * Delete image from Cloudinary
 * 
 * @param publicId - The Cloudinary public ID of the image
 */
export async function deleteImage(publicId: string): Promise<void> {
  ensureCloudinaryConfigured();
  await cloudinary.uploader.destroy(publicId);
}
