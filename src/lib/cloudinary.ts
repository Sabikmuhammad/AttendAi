/**
 * Cloudinary Configuration Module
 * 
 * Centralizes Cloudinary setup for image storage across the platform.
 * Used for uploading and managing student profile images.
 */

import { v2 as cloudinary } from 'cloudinary';

// Validate required environment variables
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  throw new Error('CLOUDINARY_CLOUD_NAME is not defined in environment variables');
}

if (!process.env.CLOUDINARY_API_KEY) {
  throw new Error('CLOUDINARY_API_KEY is not defined in environment variables');
}

if (!process.env.CLOUDINARY_API_SECRET) {
  throw new Error('CLOUDINARY_API_SECRET is not defined in environment variables');
}

// Configure Cloudinary instance
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Always use HTTPS
});

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
