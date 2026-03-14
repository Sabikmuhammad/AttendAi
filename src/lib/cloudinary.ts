/**
 * Cloudinary Configuration Module
 * 
 * Centralizes Cloudinary setup for image storage across the platform.
 * Used for uploading and managing student profile images.
 */

import { v2 as cloudinary } from 'cloudinary';

let isConfigured = false;

export function ensureCloudinaryConfigured(): void {
  if (isConfigured) {
    return;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName) {
    throw new Error('CLOUDINARY_CLOUD_NAME is not defined in environment variables');
  }

  if (!apiKey) {
    throw new Error('CLOUDINARY_API_KEY is not defined in environment variables');
  }

  if (!apiSecret) {
    throw new Error('CLOUDINARY_API_SECRET is not defined in environment variables');
  }

  // Configure Cloudinary instance lazily so module import doesn't fail during build.
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  isConfigured = true;
}

/**
 * Upload configuration presets for different use cases
 */
export const UPLOAD_PRESETS = {
  STUDENT_PROFILE: {
    folder: 'attendai/students/profiles',
    transformation: [
      { width: 800, height: 800, crop: 'limit' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
  STUDENT_DATASET: {
    folder: 'attendai/students/dataset',
    transformation: [
      { width: 1024, height: 1024, crop: 'limit' },
      { quality: 'auto:best' },
      { fetch_format: 'auto' },
    ],
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
} as const;

export default cloudinary;
