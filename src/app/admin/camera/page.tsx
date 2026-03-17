/* eslint-disable react-hooks/exhaustive-deps */
'use client';

/**
 * Admin Camera Control Page
 * 
 * Route: /admin/camera
 * 
 * Purpose:
 * - Manual control for WEBCAM monitoring (development mode)
 * - CCTV cameras (production mode) start AUTOMATICALLY and don't need this page
 * 
 * Use this page to:
 * - Start/stop webcam monitoring for development/testing
 * - View current monitoring status
 * - Check attendance statistics
 */

import { useState, useEffect, useRef } from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface Class {
  _id: string;
  courseName: string;
  classroomNumber: string;
  startTime: string;
  endTime: string;
  status: string;
  faculty?: {
    name: string;
  };
}

interface MonitoringStats {
  class_id: string;
  course_name: string;
  monitoring_active: boolean;
  students_present: number;
  total_students: number;
  attendance_rate: number;
  total_detections: number;
  total_recognitions: number;
  mode: string;
  class_status: string;
}

interface DetectedStudent {
  studentId: string;
  confidence: number;
  timestamp?: string;
}

function AdminCameraPageContent() {
  const searchParams = useSearchParams();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [monitoring, setMonitoring] = useState(false);
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [cameraSource, setCameraSource] = useState<'server' | 'browser'>('server');
  const [browserStream, setBrowserStream] = useState<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [capturedFrames, setCapturedFrames] = useState(0);
  const [detectedStudentsCount, setDetectedStudentsCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isSecureCameraContext = () => {
    if (typeof window === 'undefined') return false;

    const host = window.location.hostname;
    const localhostLike = host === 'localhost' || host === '127.0.0.1' || host === '::1';

    return window.isSecureContext || localhostLike;
  };

  // Fetch active classes on mount
  useEffect(() => {
    fetchClasses();
  }, []);

  // Poll for stats when monitoring
  useEffect(() => {
    if (monitoring && selectedClass && cameraSource === 'server') {
      const interval = setInterval(() => {
        fetchMonitoringStats();
      }, 5000); // Update every 5 seconds

      return () => clearInterval(interval);
    }
  }, [monitoring, selectedClass, cameraSource]);

  // Poll browser-camera detections while monitoring.
  useEffect(() => {
    if (monitoring && selectedClass && cameraSource === 'browser') {
      const interval = setInterval(() => {
        captureAndDetect();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [monitoring, selectedClass, cameraSource, browserStream]);

  // Attach stream to video element.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!browserStream) {
      video.srcObject = null;
      setCameraReady(false);
      return;
    }

    video.srcObject = browserStream;
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');

    const tryPlay = async () => {
      try {
        await video.play();
        setCameraReady(true);
      } catch {
        // Safari can reject immediately; we retry on metadata/canplay events below.
      }
    };

    const onLoadedMetadata = () => {
      void tryPlay();
    };

    const onCanPlay = () => {
      void tryPlay();
    };

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('canplay', onCanPlay);
    void tryPlay();

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('canplay', onCanPlay);
    };
  }, [browserStream]);

  useEffect(() => {
    return () => {
      if (browserStream) {
        browserStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [browserStream]);

  const fetchClasses = async () => {
    try {
      // Use admin endpoint and keep only monitorable classes.
      const response = await fetch('/api/admin/classes');
      if (!response.ok) {
        throw new Error(`Failed to fetch classes: ${response.status}`);
      }

      const data = await response.json();
      const monitorableClasses: Class[] = (data.classes || []).filter(
        (cls: Class) => cls.status !== 'completed' && cls.status !== 'cancelled'
      );

      setClasses(monitorableClasses);

      const classFromQuery = searchParams.get('class');
      if (classFromQuery && monitorableClasses.some((cls) => cls._id === classFromQuery)) {
        setSelectedClass(classFromQuery);
      } else if (!selectedClass && monitorableClasses.length > 0) {
        setSelectedClass(monitorableClasses[0]._id);
      }
    } catch (err) {
      console.error('Failed to fetch classes:', err);
      setError('Unable to load classes. Please refresh the page.');
    }
  };

  const fetchMonitoringStats = async () => {
    if (!selectedClass) return;

    try {
      const response = await fetch(`/api/monitor/status/${selectedClass}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const markAttendance = async (students: DetectedStudent[]) => {
    if (!selectedClass || students.length === 0) return;

    await fetch('/api/attendance/mark', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        classId: selectedClass,
        students: students.map((student) => ({
          studentId: student.studentId,
          detectedTime: student.timestamp || new Date().toISOString(),
          confidence: student.confidence,
        })),
      }),
    });
  };

  const uploadCapturedFrame = async (blob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('image', blob, 'frame.jpg');
      formData.append('classId', selectedClass);

      const response = await fetch('/api/detect-faces', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setCapturedFrames((prev) => prev + 1);

      if (data.success && Array.isArray(data.detectedStudents) && data.detectedStudents.length > 0) {
        setDetectedStudentsCount((prev) => prev + data.detectedStudents.length);
        await markAttendance(data.detectedStudents);
      }
    } catch (err) {
      console.error('Browser camera detect failed:', err);
    }
  };

  const captureAndDetect = async () => {
    if (!videoRef.current || !canvasRef.current || !selectedClass) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context || !cameraReady || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (canvas.toBlob) {
      canvas.toBlob((blob) => {
        if (!blob) return;
        void uploadCapturedFrame(blob);
      }, 'image/jpeg', 0.8);
      return;
    }

    // Fallback for browsers with unreliable toBlob behavior.
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    const base64 = dataUrl.split(',')[1];
    if (!base64) return;

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    const fallbackBlob = new Blob([bytes], { type: 'image/jpeg' });
    void uploadCapturedFrame(fallbackBlob);
  };

  const handleStartMonitoring = async () => {
    if (!selectedClass) {
      setError('Please select a class');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (cameraSource === 'browser') {
        if (!isSecureCameraContext()) {
          setError(
            'Mobile camera requires HTTPS. Open this page over https:// (or use localhost on the same device). Current URL is not secure.'
          );
          return;
        }

        if (!navigator.mediaDevices?.getUserMedia) {
          setError('Camera API is not available in this browser/device.');
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        setBrowserStream(stream);
        setCameraReady(false);
        setCapturedFrames(0);
        setDetectedStudentsCount(0);

        await fetch(`/api/classes/${selectedClass}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'active' }),
        });

        setMonitoring(true);
        setMessage('Browser camera monitoring started');
        return;
      }

      const response = await fetch('/api/monitor/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId: selectedClass,
          mode: 'development',
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Keep class state in sync for pages that rely on class status.
        await fetch(`/api/classes/${selectedClass}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'active' }),
        });

        setMonitoring(true);
        setMessage(data.message);
        setStats(data.stats);
      } else {
        setError(data.detail || 'Failed to start monitoring');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleStopMonitoring = async () => {
    if (!selectedClass) return;

    setLoading(true);

    try {
      if (cameraSource === 'browser') {
        if (browserStream) {
          browserStream.getTracks().forEach((track) => track.stop());
          setBrowserStream(null);
        }
        setCameraReady(false);
        setMonitoring(false);
        setMessage('Browser camera monitoring stopped');
        setStats(null);
        return;
      }

      const response = await fetch('/api/monitor/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId: selectedClass,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMonitoring(false);
        setMessage('Monitoring stopped');
        setStats(data.stats);
      } else {
        setError(data.detail || 'Failed to stop monitoring');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      waiting: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      ended: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Camera Control</h1>
        <p className="text-muted-foreground mt-2">
          Manual webcam control for development and testing
        </p>
      </div>

      {/* Info Alert */}
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <Info className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <div className="space-y-2">
            <p><strong>📹 Webcam Mode (Development):</strong> Use this page to manually start/stop webcam monitoring for testing.</p>
            <p><strong>📷 CCTV Mode (Production):</strong> CCTV cameras start <strong>automatically</strong> when class begins - no manual action needed. Configure RTSP URL when creating a class.</p>
            <p className="text-xs pt-2 border-t border-blue-200 mt-2">
              View all active monitoring sessions on the <a href="/admin/live-feed" className="underline font-semibold">Live Feed</a> page.
            </p>
          </div>
        </AlertDescription>
      </Alert>

      {/* Class Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Class</CardTitle>
          <CardDescription>Choose a class to begin monitoring</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="class">Class</Label>
            <select
              id="class"
              className="w-full px-3 py-2 border rounded-md"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              disabled={monitoring}
            >
              <option value="">-- Select a class --</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.courseName} - {cls.classroomNumber} 
                  {' '}({formatTime(cls.startTime)} - {formatTime(cls.endTime)})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="camera-source">Camera Source</Label>
            <select
              id="camera-source"
              className="w-full px-3 py-2 border rounded-md"
              value={cameraSource}
              onChange={(e) => setCameraSource(e.target.value as 'server' | 'browser')}
              disabled={monitoring}
            >
              <option value="server">Server Webcam / RTSP</option>
              <option value="browser">Browser Camera (Mobile Supported)</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Choose Browser Camera to use your phone camera directly from mobile browser.
            </p>
            {!isSecureCameraContext() && cameraSource === 'browser' && (
              <p className="text-xs text-red-600">
                Browser camera is blocked on non-HTTPS pages. Use HTTPS to enable mobile camera.
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleStartMonitoring}
              disabled={!selectedClass || monitoring || loading}
              className="flex-1"
            >
              {loading ? '⏳ Starting...' : cameraSource === 'browser' ? '📱 Start Mobile Camera' : '📷 Start Monitoring'}
            </Button>

            <Button
              onClick={handleStopMonitoring}
              disabled={!monitoring || loading}
              variant="destructive"
              className="flex-1"
            >
              {loading ? '⏳ Stopping...' : '⏹️ Stop Monitoring'}
            </Button>
          </div>

          {/* Messages */}
          {message && (
            <Alert>
              <AlertDescription className="text-green-600">
                ✅ {message}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>❌ {error}</AlertDescription>
            </Alert>
          )}

          {monitoring && cameraSource === 'browser' && (
            <div className="space-y-3">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-md border bg-black max-h-80 object-cover"
              />
              {!cameraReady && (
                <p className="text-xs text-muted-foreground">
                  Preparing camera stream... if this stays black, tap the video area once to allow playback.
                </p>
              )}
              <canvas ref={canvasRef} className="hidden" />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md bg-gray-50 p-3 border">
                  <p className="text-muted-foreground">Captured Frames</p>
                  <p className="font-semibold">{capturedFrames}</p>
                </div>
                <div className="rounded-md bg-gray-50 p-3 border">
                  <p className="text-muted-foreground">Detected Students</p>
                  <p className="font-semibold">{detectedStudentsCount}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monitoring Stats */}
      {monitoring && stats && (
        <Card>
          <CardHeader>
            <CardTitle>Live Monitoring Statistics</CardTitle>
            <CardDescription>Real-time attendance tracking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <span className="font-semibold">Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(stats.class_status)}`}>
                {stats.class_status.toUpperCase()}
              </span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.students_present}
                </div>
                <div className="text-sm text-blue-800">Students Present</div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.total_students}
                </div>
                <div className="text-sm text-purple-800">Total Students</div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {stats.attendance_rate.toFixed(1)}%
                </div>
                <div className="text-sm text-green-800">Attendance Rate</div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {stats.total_recognitions}
                </div>
                <div className="text-sm text-orange-800">Recognitions</div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Course:</span>
                <span className="font-medium">{stats.course_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Detections:</span>
                <span className="font-medium">{stats.total_detections}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mode:</span>
                <span className="font-medium capitalize">{stats.mode}</span>
              </div>
            </div>

            {/* Live indicator */}
            <div className="flex items-center gap-2 text-sm text-green-600">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span>Monitoring Active - Updates every 5 seconds</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {!monitoring && (
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="text-lg">1️⃣</span>
              <p>Select a class from the dropdown above</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">2️⃣</span>
              <p>Click &ldquo;Start Monitoring&rdquo; to activate the webcam</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">3️⃣</span>
              <p>The system will wait until the class start time</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">4️⃣</span>
              <p>Face detection and recognition begins automatically</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">5️⃣</span>
              <p>Student attendance is recorded when faces are recognized</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">6️⃣</span>
              <p>Monitoring stops automatically when class ends</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function AdminCameraPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-600">Loading camera control...</p>
          </div>
        </div>
      }
    >
      <AdminCameraPageContent />
    </Suspense>
  );
}
