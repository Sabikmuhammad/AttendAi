/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';

/**
 * Faculty Live Class Page
 * 
 * Route: /faculty/live-class
 * 
 * Real-time video feed with face detection overlay for faculty members
 * to monitor attendance during class sessions.
 */

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Camera, 
  Video, 
  VideoOff, 
  Users, 
  CheckCircle, 
  Clock,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';

interface Class {
  _id: string;
  courseName: string;
  classroomNumber: string;
  startTime: string;
  endTime: string;
  status: string;
  studentIds: string[];
  monitoringMode?: string;
  rtspUrl?: string;
  autoMonitoring?: boolean;
}

interface StreamStats {
  streaming: boolean;
  stats?: {
    course_name: string;
    monitoring_active: boolean;
    students_present: number;
    total_students: number;
    attendance_rate: number;
    total_detections: number;
    mode: string;
  };
  message?: string;
}

export default function FacultyLiveClassPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedClassData, setSelectedClassData] = useState<Class | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [monitoring, setMonitoring] = useState(false);
  const [streamStats, setStreamStats] = useState<StreamStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  
  const videoRef = useRef<HTMLImageElement>(null);
  const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000';

  // Fetch active/upcoming classes
  useEffect(() => {
    fetchClasses();
  }, []);

  // Poll for stream stats when streaming
  useEffect(() => {
    if (streaming && selectedClass) {
      const interval = setInterval(fetchStreamStats, 3000);
      return () => clearInterval(interval);
    }
  }, [streaming, selectedClass]);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      if (response.ok) {
        const data = await response.json();
        const activeClasses = (data.classes || []).filter(
          (c: Class) => c.status === 'waiting' || c.status === 'active'
        );
        setClasses(activeClasses);
      }
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    }
  };

  const fetchStreamStats = async () => {
    if (!selectedClass) return;

    try {
      const response = await fetch(`${AI_SERVICE_URL}/stream/status/${selectedClass}`);
      if (response.ok) {
        const data = await response.json();
        setStreamStats(data);
        setMonitoring(data.stats?.monitoring_active || false);
      }
    } catch (err) {
      console.error('Failed to fetch stream stats:', err);
    }
  };

  const handleClassSelect = (classId: string) => {
    setSelectedClass(classId);
    const classData = classes.find(c => c._id === classId);
    setSelectedClassData(classData || null);
    setStreaming(false);
    setError(null);
  };

  const handleStartMonitoring = async () => {
    if (!selectedClass) {
      setError('Please select a class first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${AI_SERVICE_URL}/monitor/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClass,
          mode: 'development'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMonitoring(true);
        setStreaming(true);
        // Start video stream
        if (videoRef.current) {
          videoRef.current.src = `${AI_SERVICE_URL}/stream/video/${selectedClass}`;
        }
      } else {
        setError(data.detail || data.message || 'Failed to start monitoring');
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
      const response = await fetch(`${AI_SERVICE_URL}/monitor/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId: selectedClass })
      });

      if (response.ok) {
        setMonitoring(false);
        setStreaming(false);
        if (videoRef.current) {
          videoRef.current.src = '';
        }
      }
    } catch (err) {
      console.error('Failed to stop monitoring:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewStream = () => {
    if (selectedClass) {
      setStreaming(true);
      if (videoRef.current) {
        videoRef.current.src = `${AI_SERVICE_URL}/stream/video/${selectedClass}`;
      }
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Live Class Monitoring</h1>
        <p className="text-gray-600 mt-2">
          Monitor attendance in real-time with AI-powered face recognition
        </p>
      </div>

      {/* Class Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Class</CardTitle>
          <CardDescription>Choose a class to start monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classes.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-gray-500">
                <Camera className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No active or upcoming classes</p>
              </div>
            ) : (
              classes.map((cls) => (
                <button
                  key={cls._id}
                  onClick={() => handleClassSelect(cls._id)}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${
                    selectedClass === cls._id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{cls.courseName}</h3>
                    <Badge className={getStatusColor(cls.status)}>
                      {cls.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Room: {cls.classroomNumber}</p>
                    <p>Time: {formatTime(cls.startTime)} - {formatTime(cls.endTime)}</p>
                    <p className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {cls.studentIds?.length || 0} students
                    </p>
                    {cls.monitoringMode === 'production' && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 mt-2">
                        <Camera className="w-3 h-3 mr-1" />
                        CCTV Auto-Monitor
                      </Badge>
                    )}
                    {cls.monitoringMode === 'development' && (
                      <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 mt-2">
                        <Video className="w-3 h-3 mr-1" />
                        Webcam Manual
                      </Badge>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Control Buttons */}
          {selectedClass && selectedClassData && (
            <div className="mt-6 space-y-4">
              {/* Info Alert for CCTV Classes */}
              {selectedClassData.monitoringMode === 'production' && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Camera className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>CCTV Camera Mode:</strong> Monitoring starts automatically when class begins. 
                    {selectedClassData.status === 'active' ? ' Currently monitoring via CCTV.' : ' Will start when class becomes active.'}
                  </AlertDescription>
                </Alert>
              )}

              {/* Info Alert for Webcam Classes */}
              {(!selectedClassData.monitoringMode || selectedClassData.monitoringMode === 'development') && (
                <Alert className="border-purple-200 bg-purple-50">
                  <Video className="w-4 h-4 text-purple-600" />
                  <AlertDescription className="text-purple-800">
                    <strong>Webcam Mode:</strong> Click &ldquo;Start Monitoring&rdquo; to manually activate your webcam for attendance tracking.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                {/* Only show Start/Stop buttons for webcam mode */}
                {(!selectedClassData.monitoringMode || selectedClassData.monitoringMode === 'development') && (
                  <>
                    {!monitoring ? (
                      <Button
                        onClick={handleStartMonitoring}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        {loading ? 'Starting...' : 'Start Monitoring'}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleStopMonitoring}
                        disabled={loading}
                        variant="destructive"
                      >
                        <VideoOff className="w-4 h-4 mr-2" />
                        Stop Monitoring
                      </Button>
                    )}
                  </>
                )}
                
                {/* View Stream button (available for both modes) */}
                {!streaming && selectedClass && (
                  <Button
                    onClick={handleViewStream}
                    variant="outline"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Stream
                  </Button>
                )}

                <Button
                  onClick={() => setShowOverlay(!showOverlay)}
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                >
                  {showOverlay ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span className="ml-2">{showOverlay ? 'Hide' : 'Show'} Overlay</span>
                </Button>
              </div>

              {error && (
                <Alert className="mt-4 border-red-200 bg-red-50">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Stream */}
      {streaming && selectedClass && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Feed */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                  Live Feed
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {selectedClassData?.courseName}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <img
                  ref={videoRef}
                  alt="Live video stream"
                  className="w-full h-full object-contain"
                  onError={() => setError('Failed to load video stream')}
                />
                
                {!streaming && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="text-center text-gray-400">
                      <Camera className="w-16 h-16 mx-auto mb-3" />
                      <p>No video stream</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Face detection and recognition active
                </p>
                <p className="flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Updates every 3 seconds
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>Real-time attendance data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {streamStats?.stats ? (
                <>
                  {/* Attendance Rate */}
                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-sm text-gray-600">Attendance Rate</span>
                      <span className="text-2xl font-bold text-purple-600">
                        {streamStats.stats.attendance_rate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${streamStats.stats.attendance_rate}%` }}
                      />
                    </div>
                  </div>

                  {/* Students Present */}
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-700">Students Present</p>
                        <p className="text-3xl font-bold text-green-900">
                          {streamStats.stats.students_present}
                        </p>
                      </div>
                      <Users className="w-10 h-10 text-green-600" />
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      of {streamStats.stats.total_students} enrolled
                    </p>
                  </div>

                  {/* Detection Stats */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Detections</span>
                      <span className="font-semibold">{streamStats.stats.total_detections}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Mode</span>
                      <Badge variant="outline" className="text-xs">
                        {streamStats.stats.mode}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Status</span>
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        {streamStats.stats.monitoring_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>

                  {/* Refresh Button */}
                  <Button
                    onClick={fetchStreamStats}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Stats
                  </Button>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">No statistics available</p>
                  <p className="text-xs mt-1">Start monitoring to see data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Instructions */}
      {!streaming && (
        <Card>
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Webcam Instructions */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Video className="w-5 h-5 text-purple-600" />
                Webcam Mode (Development)
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-7">
                <li>Select a webcam-enabled class from the list</li>
                <li>Click <strong>&ldquo;Start Monitoring&rdquo;</strong> to manually activate your webcam</li>
                <li>Position yourself and students in front of the camera</li>
                <li>Students will be automatically recognized and marked present</li>
                <li>Monitor attendance statistics in real-time</li>
                <li>Click &ldquo;Stop Monitoring&rdquo; when the class ends</li>
              </ol>
              <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-800">
                  <strong>Note:</strong> Requires browser camera permissions and a working webcam.
                </p>
              </div>
            </div>

            {/* CCTV Instructions */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" />
                CCTV Mode (Production)
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-7">
                <li>CCTV cameras <strong>automatically start monitoring</strong> when class begins</li>
                <li>No manual intervention required - fully automated</li>
                <li>Select a CCTV-enabled class to view the live feed</li>
                <li>Click &ldquo;View Stream&rdquo; to watch real-time face detection</li>
                <li>Monitoring stops automatically when class ends</li>
              </ol>
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Automatic:</strong> CCTV cameras require RTSP URL configuration by admin. Once configured, monitoring is fully automatic.
                </p>
              </div>
            </div>

            {/* General Tips */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">💡 Tips for Best Results</h4>
              <ul className="space-y-1 text-xs text-gray-700">
                <li>• Ensure good lighting in the classroom</li>
                <li>• Students should face the camera clearly</li>
                <li>• Avoid obstructions blocking student faces</li>
                <li>• Allow 2-3 seconds for face recognition processing</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
