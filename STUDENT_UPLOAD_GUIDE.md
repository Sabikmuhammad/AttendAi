# Student Image Upload & Face Embedding Pipeline

## 📋 Overview

This document describes the complete student image upload and face recognition pipeline for AttendAI. The system enables admins to upload student images, automatically generate face embeddings, and store them for real-time attendance detection.

---

## 🏗️ Architecture

### Components

1. **Next.js API Endpoint** (`/api/admin/upload-student-image`)
   - Handles multipart file uploads
   - Validates admin authentication
   - Orchestrates the upload pipeline

2. **Cloudinary Service** (`src/lib/cloudinary.ts`)
   - Cloud image storage
   - Automatic image optimization
   - Secure URL generation

3. **Image Upload Service** (`src/services/imageUploadService.ts`)
   - File validation (type, size)
   - Base64 encoding
   - Cloudinary integration

4. **Embedding Service** (`src/services/embeddingService.ts`)
   - Communicates with Python AI service
   - Generates 128-dimensional face embeddings
   - Error handling for face detection issues

5. **Python AI Service** (`ai-service/main.py`)
   - Face detection using face_recognition library
   - Embedding generation
   - Real-time face recognition

### Data Flow

```
Admin Upload → Next.js API → Cloudinary → AI Service → MongoDB
     ↓              ↓             ↓            ↓           ↓
  [Image]      [Validate]    [Store]    [Embedding]  [Save Data]
```

---

## ⚙️ Setup Instructions

### 1. Cloudinary Configuration

**Step 1:** Sign up at [Cloudinary](https://cloudinary.com/)

**Step 2:** Get your credentials from the Dashboard:
- Cloud Name
- API Key
- API Secret

**Step 3:** Update `.env.local`:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here

# AI Service Configuration
AI_SERVICE_URL=http://localhost:8000
```

**Step 4:** Install dependencies (already done):

```bash
npm install cloudinary
```

### 2. Python AI Service Setup

**Step 1:** Navigate to AI service directory:

```bash
cd ai-service
```

**Step 2:** Create virtual environment (if not exists):

```bash
python3 -m venv venv
source venv/bin/activate  # On macOS/Linux
# or
venv\Scripts\activate  # On Windows
```

**Step 3:** Install updated dependencies:

```bash
pip install -r requirements.txt
```

**Step 4:** Start the AI service:

```bash
python main.py
```

The service will start on `http://localhost:8000`.

**Step 5:** Verify it's running:

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "AttendAI Face Recognition",
  "version": "1.0.0",
  "students_loaded": 0
}
```

### 3. Start Next.js Development Server

```bash
npm run dev
```

---

## 🧪 Testing Guide

### Test 1: Health Check

Verify the API endpoint is accessible:

```bash
curl http://localhost:3000/api/admin/upload-student-image
```

Expected response:
```json
{
  "success": true,
  "endpoint": "/api/admin/upload-student-image",
  "methods": ["POST"],
  "description": "Upload student profile image with face embedding generation"
}
```

### Test 2: Upload Student Image (Without Embedding)

First, ensure you have a student in the database with a valid `studentId`.

```bash
curl -X POST http://localhost:3000/api/admin/upload-student-image \
  -H "Cookie: YOUR_AUTH_COOKIE" \
  -F "image=@/path/to/student-photo.jpg" \
  -F "studentId=STU001" \
  -F "generateEmbedding=false"
```

Expected response:
```json
{
  "success": true,
  "studentId": "STU001",
  "imageUrl": "https://res.cloudinary.com/.../student_STU001_1234567890.jpg",
  "embeddingGenerated": false,
  "message": "Image uploaded successfully"
}
```

### Test 3: Upload with Face Embedding Generation

**Make sure the Python AI service is running!**

```bash
curl -X POST http://localhost:3000/api/admin/upload-student-image \
  -H "Cookie: YOUR_AUTH_COOKIE" \
  -F "image=@/path/to/student-photo.jpg" \
  -F "studentId=STU001" \
  -F "generateEmbedding=true"
```

Expected response:
```json
{
  "success": true,
  "studentId": "STU001",
  "imageUrl": "https://res.cloudinary.com/.../student_STU001_1234567890.jpg",
  "embeddingGenerated": true,
  "message": "Image uploaded and face embedding generated successfully"
}
```

### Test 4: Direct AI Service Test

Test the embedding generation endpoint directly:

```bash
curl -X POST http://localhost:8000/generate-embedding \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://res.cloudinary.com/.../student_photo.jpg"
  }'
```

Expected response:
```json
{
  "success": true,
  "embedding": [0.123, -0.456, 0.789, ...],  // 128 numbers
  "faces_detected": 1,
  "error": null
}
```

---

## 🔍 Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `CLOUDINARY_CLOUD_NAME is not defined` | Missing env variable | Add Cloudinary credentials to `.env.local` |
| `AI service is unavailable` | Python service not running | Start `python main.py` in ai-service directory |
| `No face detected in the image` | Image has no visible face | Upload a clear photo with a front-facing face |
| `Multiple faces detected` | Image contains more than one person | Upload an image with only one person |
| `Student with ID X not found` | Invalid studentId | Ensure student exists in database |
| `Forbidden: Admin access required` | Non-admin user | Login as admin |
| `File too large` | Image exceeds 5MB | Compress or resize the image |
| `Invalid file type` | Wrong format | Use JPEG, PNG, or WebP |

### Error Response Format

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": "Technical details (in production, omit this)"
}
```

---

## 📊 Database Schema

### Student Model

```typescript
{
  _id: ObjectId,
  userId: ObjectId,              // Reference to User collection
  studentId: String,             // Student registration number
  department: String,
  section: String,
  imageUrl: String,              // Primary profile image URL
  faceEmbedding: [Number],       // 128-dimensional face vector
  imageDataset: [
    {
      url: String,
      uploadedAt: Date
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 API Reference

### POST `/api/admin/upload-student-image`

Upload a student profile image with optional face embedding generation.

**Authentication:** Required (Admin only)

**Content-Type:** `multipart/form-data`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | File | Yes | Image file (JPEG, PNG, WebP) |
| `studentId` | String | Yes | Student registration number |
| `generateEmbedding` | Boolean | No | Whether to generate face embedding (default: false) |

**Response:** `200 OK`

```json
{
  "success": true,
  "studentId": "STU001",
  "imageUrl": "https://...",
  "embeddingGenerated": true,
  "message": "Image uploaded and face embedding generated successfully"
}
```

**Error Responses:**

- `400 Bad Request` - Invalid input (missing file, wrong format, etc.)
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Student not found
- `500 Internal Server Error` - Unexpected error

---

## 🔐 Security Considerations

1. **Authentication Required**
   - Only admins can upload images
   - Session verification on every request

2. **File Validation**
   - Max size: 5MB
   - Allowed types: JPEG, PNG, WebP only
   - Server-side validation

3. **Cloudinary Security**
   - HTTPS-only URLs
   - Signed uploads (API key secured)
   - Auto-resource optimization

4. **Database Protection**
   - MongoDB connection pooling
   - Indexed queries for performance
   - Data validation via Mongoose schemas

---

## 📈 Monitoring & Logs

### Next.js API Logs

```
📤 Uploading image for student STU001...
✅ Image uploaded successfully: https://...
🤖 Generating face embedding for student STU001...
✅ Face embedding generated successfully (128 dimensions)
💾 Student record updated in database
```

### Python AI Service Logs

```
INFO:     Generating embedding for image: https://...
INFO:     Processing image: 800x600
INFO:     Detected 1 face(s) in image
INFO:     ✅ Successfully generated embedding: 128 dimensions
```

---

## 🧩 Integration with Attendance Detection

Once embeddings are stored:

1. **Startup:** Python service loads all embeddings from MongoDB
2. **Live Class:** Camera captures classroom frames
3. **Detection:** Faces are detected and matched against stored embeddings
4. **Recognition:** Matched students are marked as present
5. **Storage:** Attendance records are saved to database

---

## 🛠️ Development Utilities

### Check AI Service Health

```typescript
import { checkAIServiceHealth } from '@/services/embeddingService';

const health = await checkAIServiceHealth();
console.log(health);
// { available: true, version: "1.0.0" }
```

### Delete Image from Cloudinary

```typescript
import { deleteImage } from '@/services/imageUploadService';

await deleteImage('student_STU001_1234567890');
```

### Batch Upload Multiple Images

```typescript
import { uploadStudentDataset } from '@/services/imageUploadService';

const results = await uploadStudentDataset(files, 'STU001');
```

---

## 📝 Next Steps

1. **Create Admin UI Form**
   - File input for image upload
   - Student ID dropdown
   - Toggle for embedding generation
   - Progress indicator

2. **Add Image Preview**
   - Show uploaded image before submission
   - Validate face detection on client side
   - Real-time feedback

3. **Batch Upload Support**
   - Upload multiple images at once
   - Progress tracking for each file
   - Error handling for failed uploads

4. **Analytics Dashboard**
   - Track total students with embeddings
   - Monitor upload success/failure rates
   - Display AI service health status

---

## ❓ Troubleshooting

### Python AI Service Won't Start

```bash
# Check if port 8000 is already in use
lsof -ti:8000 | xargs kill -9

# Verify Python version (need 3.8+)
python3 --version

# Reinstall face_recognition library
pip uninstall face-recognition
pip install face-recognition
```

### Cloudinary Upload Fails

```bash
# Verify environment variables are loaded
echo $CLOUDINARY_CLOUD_NAME

# Test Cloudinary connection
curl -X POST https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload \
  -F "file=@test.jpg" \
  -F "api_key=YOUR_API_KEY" \
  -F "timestamp=$(date +%s)" \
  -F "signature=YOUR_SIGNATURE"
```

### MongoDB Connection Issues

```bash
# Check MongoDB connection string
echo $MONGODB_URI

# Test connection
mongosh "YOUR_MONGODB_URI"
```

---

## 📚 Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [face_recognition Library](https://github.com/ageitgey/face_recognition)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**Built with ❤️ by the AttendAI Team**
