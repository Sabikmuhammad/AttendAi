/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, CheckCircle, AlertCircle, Loader2, Camera } from 'lucide-react';

interface Student {
  _id: string;
  name: string;
  registerNumber: string;
  email: string;
  department: string;
  imageUrl?: string;
  faceEmbedding?: number[];
}

function hasValidEmbedding(student?: Student): boolean {
  return Array.isArray(student?.faceEmbedding) && student.faceEmbedding.length > 0;
}

function UploadStudentPhotoContent() {
  const searchParams = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [progress, setProgress] = useState<string>('');

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const preselectedStudentId = searchParams.get('studentId');
    if (!preselectedStudentId || students.length === 0) {
      return;
    }

    const exists = students.some((student) => student._id === preselectedStudentId);
    if (exists) {
      setSelectedStudent(preselectedStudentId);
    }
  }, [students, searchParams]);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select an image file' });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image must be less than 10MB' });
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setMessage(null);
    }
  };

  const uploadViaBackend = async (studentObjectId: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('studentObjectId', studentObjectId);
    formData.append('generateEmbedding', 'true');

    const response = await fetch('/api/admin/upload-student-image', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok || !data?.success) {
      throw new Error(data?.error || data?.message || 'Failed to upload student photo');
    }

    return data;
  };

  const handleUpload = async () => {
    if (!selectedStudent) {
      setMessage({ type: 'error', text: 'Please select a student' });
      return;
    }

    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select an image' });
      return;
    }

    setUploading(true);
    setMessage(null);
    setProgress('Uploading image and generating face embedding...');

    try {
      await uploadViaBackend(selectedStudent, selectedFile);

      setMessage({
        type: 'success',
        text: 'Student photo uploaded successfully.',
      });
      setProgress('');
      setSelectedFile(null);
      setPreviewUrl('');
      setSelectedStudent('');
      
      // Refresh students list
      fetchStudents();
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({
        type: 'error',
        text: (error as Error).message || 'Failed to upload photo. Please try again.',
      });
      setProgress('');
    } finally {
      setUploading(false);
    }
  };

  const selectedStudentData = students.find((s) => s._id === selectedStudent);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload Student Photo</h1>
        <p className="text-gray-600 mt-2">
          Upload student photos to generate face embeddings for automated attendance
        </p>
      </div>

      {/* Instructions */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Camera className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Photo Guidelines</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Use a clear, well-lit photo</li>
              <li>✓ Face should be front-facing or at a slight angle</li>
              <li>✓ Only one person should be in the photo</li>
              <li>✓ No sunglasses, masks, or face coverings</li>
              <li>✓ Minimum resolution: 640x480</li>
              <li>✓ Supported formats: JPG, PNG (max 10MB)</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Main Upload Form */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* Student Selection */}
          <div>
            <Label htmlFor="student">Select Student *</Label>
            <select
              id="student"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              disabled={uploading}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">-- Select a student --</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name} ({student.registerNumber}) - {student.department}
                  {hasValidEmbedding(student) ? ' ✓ Has embedding' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Show selected student info */}
          {selectedStudentData && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Selected Student:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Name:</strong> {selectedStudentData.name}</p>
                <p><strong>Register Number:</strong> {selectedStudentData.registerNumber}</p>
                <p><strong>Email:</strong> {selectedStudentData.email}</p>
                <p><strong>Department:</strong> {selectedStudentData.department}</p>
                {hasValidEmbedding(selectedStudentData) && (
                  <p className="text-green-600 flex items-center gap-2 mt-2">
                    <CheckCircle className="w-4 h-4" />
                    Face embedding already exists (will be replaced)
                  </p>
                )}
              </div>
            </div>
          )}

          {/* File Upload */}
          <div>
            <Label htmlFor="photo">Upload Photo *</Label>
            <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-purple-400 transition-colors">
              <div className="space-y-1 text-center">
                {previewUrl ? (
                  <div className="space-y-3">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="mx-auto max-h-64 rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl('');
                      }}
                      disabled={uploading}
                    >
                      Change Photo
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleFileChange}
                          disabled={uploading}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Progress */}
          {progress && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="text-blue-900 text-sm">{progress}</span>
            </div>
          )}

          {/* Messages */}
          {message && (
            <Alert className={message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
              <div className="flex items-start gap-3">
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {message.text}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!selectedStudent || !selectedFile || uploading}
            className="w-full bg-purple-600 hover:bg-purple-700"
            size="lg"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                Upload and Generate Embedding
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Statistics */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Statistics</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{students.length}</div>
            <div className="text-sm text-gray-600 mt-1">Total Students</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {students.filter((s) => hasValidEmbedding(s)).length}
            </div>
            <div className="text-sm text-gray-600 mt-1">With Face Data</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {students.filter((s) => !hasValidEmbedding(s)).length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Missing Face Data</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function UploadStudentPhoto() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      }
    >
      <UploadStudentPhotoContent />
    </Suspense>
  );
}
