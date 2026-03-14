/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Camera,
  CameraOff,
  Users,
  Activity,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface DetectedStudent {
  studentId: string;
  name: string;
  registerNumber: string;
  confidence: number;
  timestamp: string;
}

interface AttendanceRecord {
  studentId: string;
  name: string;
  registerNumber: string;
  detectedTime: string;
  confidence: number;
}

export default function ClassMonitorPage() {
  const params = useParams();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [detectedStudents, setDetectedStudents] = useState<DetectedStudent[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [classData, setClassData] = useState<any>(null);

  useEffect(() => {
    fetchClassData();
    requestNotificationPermission();
    
    return () => {
      stopMonitoring();
    };
  }, []);

  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(captureAndDetect, 5000);
      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const fetchClassData = async () => {
    try {
      const response = await fetch(`/api/faculty/classes/${params.id}`);
      const data = await response.json();
      
      if (data.success) {
        setClassData(data.class);
        
        // Fetch existing attendance
        fetchAttendance();
      }
    } catch (error) {
      console.error('Error fetching class data:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await fetch(`/api/attendance?classId=${params.id}`);
      const data = await response.json();
      
      if (data.success) {
        setAttendanceRecords(data.attendance);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const startMonitoring = async () => {
    try {
      setError(null);
      
      // Request camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      setIsMonitoring(true);
      
      // Show notification
      if (Notification.permission === 'granted') {
        new Notification('Monitoring Started', {
          body: 'Automatic attendance monitoring is now active',
        });
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Failed to access camera. Please grant camera permissions.');
    }
  };

  const stopMonitoring = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsMonitoring(false);
  };

  const captureAndDetect = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      try {
        // Send to AI detection service
        const formData = new FormData();
        formData.append('image', blob, 'frame.jpg');
        formData.append('classId', params.id as string);

        const response = await fetch('/api/detect-faces', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success && data.detectedStudents.length > 0) {
          // Update detected students list
          setDetectedStudents(prev => {
            const newDetections = data.detectedStudents.filter(
              (newStudent: DetectedStudent) =>
                !prev.some(existing => existing.studentId === newStudent.studentId)
            );
            return [...newDetections, ...prev].slice(0, 50); // Keep last 50
          });

          // Mark attendance
          await markAttendance(data.detectedStudents);
        }
      } catch (error) {
        console.error('Error detecting faces:', error);
      }
    }, 'image/jpeg', 0.8);
  };

  const markAttendance = async (students: DetectedStudent[]) => {
    try {
      const response = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId: params.id,
          students: students.map(s => ({
            studentId: s.studentId,
            detectedTime: s.timestamp,
            confidence: s.confidence,
          })),
        }),
      });

      const data = await response.json();

      if (data.success && data.newAttendance.length > 0) {
        // Update attendance records
        setAttendanceRecords(prev => [...data.newAttendance, ...prev]);

        // Show notification for new attendance
        if (Notification.permission === 'granted') {
          data.newAttendance.forEach((record: AttendanceRecord) => {
            new Notification('Student Detected', {
              body: `${record.name} marked present`,
            });
          });
        }
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  const attendancePercentage = classData?.studentIds?.length > 0
    ? Math.round((attendanceRecords.length / classData.studentIds.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/faculty/class/${params.id}`)}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Live Monitoring</h1>
            <p className="text-gray-600 mt-1">
              {classData?.courseName || 'Loading...'}
            </p>
          </div>
        </div>
        <Badge className="bg-green-100 text-green-700 border-green-200 text-lg px-4 py-2">
          <Activity className="w-4 h-4 mr-2 animate-pulse" />
          ACTIVE
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {classData?.studentIds?.length || 0}
              </p>
            </div>
            <div className="bg-purple-500/10 text-purple-600 p-4 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Present</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {attendanceRecords.length}
              </p>
            </div>
            <div className="bg-green-500/10 text-green-600 p-4 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {attendancePercentage}%
              </p>
            </div>
            <div className="bg-blue-500/10 text-blue-600 p-4 rounded-xl">
              <RefreshCw className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Camera Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Camera Feed</h2>
            {!isMonitoring ? (
              <Button
                onClick={startMonitoring}
                className="bg-green-600 hover:bg-green-700"
              >
                <Camera className="w-4 h-4 mr-2" />
                Start Monitoring
              </Button>
            ) : (
              <Button
                onClick={stopMonitoring}
                variant="destructive"
              >
                <CameraOff className="w-4 h-4 mr-2" />
                Stop Monitoring
              </Button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <p className="font-medium">{error}</p>
              </div>
            </div>
          )}

          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!isMonitoring && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80">
                <div className="text-center text-white">
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Camera not active</p>
                  <p className="text-sm text-gray-300 mt-2">
                    Click &ldquo;Start Monitoring&rdquo; to begin
                  </p>
                </div>
              </div>
            )}
            {isMonitoring && (
              <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                RECORDING
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </Card>

        {/* Recent Detections */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Detections
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {detectedStudents.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No detections yet
              </p>
            ) : (
              detectedStudents.map((student, index) => (
                <div
                  key={`${student.studentId}-${index}`}
                  className="bg-green-50 border border-green-200 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-600">{student.registerNumber}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(student.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-white text-xs">
                      {Math.round(student.confidence * 100)}%
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Attendance Records */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Attendance Records ({attendanceRecords.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  #
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Register Number
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Detected Time
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Confidence
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {attendanceRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No attendance records yet
                  </td>
                </tr>
              ) : (
                attendanceRecords.map((record, index) => (
                  <tr key={`${record.studentId}-${index}`} className="hover:bg-gray-50/50">
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {index + 1}
                    </td>
                    <td className="py-4 px-4 font-medium text-gray-900">
                      {record.name}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {record.registerNumber}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {new Date(record.detectedTime).toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="outline">
                        {Math.round(record.confidence * 100)}%
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
