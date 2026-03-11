/**
 * EXAMPLE: Admin Student Image Upload Component
 * 
 * This is a reference implementation showing how to use the
 * student image upload API from the admin frontend.
 * 
 * Location: src/app/admin/students/[id]/upload-image/page.tsx
 * or integrate into existing student management UI
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UploadResponse {
  success: boolean;
  studentId?: string;
  imageUrl?: string;
  embeddingGenerated?: boolean;
  message?: string;
  error?: string;
}

export default function StudentImageUploadExample() {
  const [studentId, setStudentId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [generateEmbedding, setGenerateEmbedding] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);

  /**
   * Handle file selection and preview
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setResult({
        success: false,
        error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.',
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setResult({
        success: false,
        error: 'File too large. Maximum size is 5MB.',
      });
      return;
    }

    setSelectedFile(file);
    setResult(null);

    // Generate preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Upload image to API
   */
  const handleUpload = async () => {
    if (!selectedFile || !studentId) {
      setResult({
        success: false,
        error: 'Please select a file and enter a student ID',
      });
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('studentId', studentId);
      formData.append('generateEmbedding', generateEmbedding.toString());

      const response = await fetch('/api/admin/upload-student-image', {
        method: 'POST',
        body: formData,
      });

      const data: UploadResponse = await response.json();

      if (response.ok && data.success) {
        setResult({
          success: true,
          studentId: data.studentId,
          imageUrl: data.imageUrl,
          embeddingGenerated: data.embeddingGenerated,
          message: data.message,
        });

        // Clear form on success
        setSelectedFile(null);
        setPreview(null);
        setStudentId('');
      } else {
        setResult({
          success: false,
          error: data.error || 'Upload failed',
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Upload Student Image</CardTitle>
          <CardDescription>
            Upload a student profile image and generate face embedding for attendance detection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Student ID Input */}
          <div className="space-y-2">
            <Label htmlFor="studentId">Student ID</Label>
            <Input
              id="studentId"
              type="text"
              placeholder="e.g., STU001"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              disabled={uploading}
            />
          </div>

          {/* File Input */}
          <div className="space-y-2">
            <Label htmlFor="image">Profile Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <p className="text-sm text-muted-foreground">
              Accepted formats: JPEG, PNG, WebP • Max size: 5MB
            </p>
          </div>

          {/* Image Preview */}
          {preview && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded-lg p-4 bg-muted">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-md mx-auto rounded-lg shadow-sm"
                />
              </div>
            </div>
          )}

          {/* Generate Embedding Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="generateEmbedding"
              checked={generateEmbedding}
              onChange={(e) => setGenerateEmbedding(e.target.checked)}
              disabled={uploading}
              className="w-4 h-4"
            />
            <Label htmlFor="generateEmbedding" className="font-normal">
              Generate face embedding for attendance detection
            </Label>
          </div>

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !studentId || uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <span className="mr-2">⏳</span>
                Uploading...
              </>
            ) : (
              'Upload Image'
            )}
          </Button>

          {/* Result Message */}
          {result && (
            <Alert variant={result.success ? 'default' : 'destructive'}>
              <AlertDescription>
                {result.success ? (
                  <div className="space-y-2">
                    <p className="font-semibold text-green-600">
                      ✅ {result.message}
                    </p>
                    {result.imageUrl && (
                      <div className="space-y-1 text-sm">
                        <p>
                          <strong>Student ID:</strong> {result.studentId}
                        </p>
                        <p>
                          <strong>Image URL:</strong>{' '}
                          <a
                            href={result.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View Image
                          </a>
                        </p>
                        <p>
                          <strong>Embedding Generated:</strong>{' '}
                          {result.embeddingGenerated ? 'Yes ✅' : 'No'}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-red-600">❌ {result.error}</p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <p className="font-semibold text-blue-900 mb-2">📋 Requirements</p>
            <ul className="space-y-1 text-blue-800">
              <li>• Image must contain exactly ONE face</li>
              <li>• Face should be clearly visible and front-facing</li>
              <li>• Good lighting and focus required</li>
              <li>• AI service must be running for embedding generation</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
