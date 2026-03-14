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

import { useState, useEffect } from 'react';
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

export default function AdminCameraPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [monitoring, setMonitoring] = useState(false);
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Fetch active classes on mount
  useEffect(() => {
    fetchClasses();
  }, []);

  // Poll for stats when monitoring
  useEffect(() => {
    if (monitoring && selectedClass) {
      const interval = setInterval(() => {
        fetchMonitoringStats();
      }, 5000); // Update every 5 seconds

      return () => clearInterval(interval);
    }
  }, [monitoring, selectedClass]);

  const fetchClasses = async () => {
    try {
      // Fetch all classes (don't filter by status)
      const response = await fetch('/api/classes');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched classes:', data); // Debug log
        setClasses(data.classes || []);
      } else {
        console.error('Failed to fetch classes:', response.status, response.statusText);
      }
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    }
  };

  const fetchMonitoringStats = async () => {
    if (!selectedClass) return;

    try {
      const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000';
      const response = await fetch(`${AI_SERVICE_URL}/monitor/status/${selectedClass}`);
      
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

  const handleStartMonitoring = async () => {
    if (!selectedClass) {
      setError('Please select a class');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000';
      
      const response = await fetch(`${AI_SERVICE_URL}/monitor/start`, {
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
      const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000';
      
      const response = await fetch(`${AI_SERVICE_URL}/monitor/stop`, {
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

          <div className="flex gap-4">
            <Button
              onClick={handleStartMonitoring}
              disabled={!selectedClass || monitoring || loading}
              className="flex-1"
            >
              {loading ? '⏳ Starting...' : '📷 Start Monitoring'}
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
