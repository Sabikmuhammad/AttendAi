'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Users, CheckCircle, AlertCircle, Clock, Video } from 'lucide-react';

interface ClassData {
  _id: string;
  courseName: string;
  classroomNumber: string;
  facultyName: string;
  startTime: string;
  endTime: string;
  studentIds: any[];
}

interface DetectionLog {
  id: string;
  studentName: string;
  time: string;
  confidence: number;
  status: 'present' | 'late';
}

export default function LiveMonitorPage() {
  const [activeClasses, setActiveClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [detectionLogs, setDetectionLogs] = useState<DetectionLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveClasses();
    // Refresh every 30 seconds
    const interval = setInterval(fetchActiveClasses, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveClasses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/classes?status=active');
      const data = await response.json();
      if (data.success) {
        setActiveClasses(data.classes);
        if (data.classes.length > 0 && !selectedClass) {
          setSelectedClass(data.classes[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching active classes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock detection logs (in production, this would come from real-time AI service)
  useEffect(() => {
    if (selectedClass) {
      // Simulate some detection logs
      const mockLogs: DetectionLog[] = selectedClass.studentIds.slice(0, 5).map((student: any, idx) => ({
        id: `${idx}`,
        studentName: student.name,
        time: new Date(Date.now() - idx * 60000).toLocaleTimeString(),
        confidence: 85 + Math.random() * 15,
        status: idx === 0 ? 'late' : 'present',
      }));
      setDetectionLogs(mockLogs);
    }
  }, [selectedClass]);

  const detectedCount = detectionLogs.length;
  const totalStudents = selectedClass?.studentIds?.length || 0;
  const absentCount = totalStudents - detectedCount;
  const attendanceRate = totalStudents > 0 ? ((detectedCount / totalStudents) * 100).toFixed(1) : '0';

  if (loading && activeClasses.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading active classes...</p>
        </div>
      </div>
    );
  }

  if (activeClasses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Camera className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Active Classes</h2>
        <p className="text-gray-600 text-center max-w-md">
          There are no classes currently in session. Start a scheduled class from the Class Management page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Class Monitoring</h1>
          <p className="text-gray-600 mt-1">Real-time attendance tracking with AI face detection</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-700">
            {activeClasses.length} Active {activeClasses.length === 1 ? 'Class' : 'Classes'}
          </span>
        </div>
      </div>

      {/* Active Classes Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activeClasses.map((cls) => (
          <button
            key={cls._id}
            onClick={() => setSelectedClass(cls)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              selectedClass?._id === cls._id
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{cls.courseName}</h3>
              <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                LIVE
              </span>
            </div>
            <p className="text-sm text-gray-600">{cls.classroomNumber}</p>
            <p className="text-sm text-gray-600 mt-1">{cls.facultyName}</p>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              {cls.studentIds?.length || 0} students
            </div>
          </button>
        ))}
      </div>

      {selectedClass && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{totalStudents}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Detected</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{detectedCount}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Absent</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{absentCount}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Attendance Rate</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{attendanceRate}%</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Camera Feed */}
            <Card className="lg:col-span-2 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Live Camera Feed</h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Recording</span>
                </div>
              </div>

              {/* Camera Feed Placeholder */}
              <div className="aspect-video bg-gray-900 rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Camera Feed: {selectedClass.classroomNumber}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Connect to AI Service for live detection
                    </p>
                  </div>
                </div>

                {/* Detection Overlay */}
                <div className="absolute top-4 left-4 space-y-2">
                  <div className="px-3 py-2 bg-black/70 rounded-lg text-white text-sm">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      <span>{selectedClass.classroomNumber}</span>
                    </div>
                  </div>
                  <div className="px-3 py-2 bg-black/70 rounded-lg text-white text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        Started: {new Date(selectedClass.startTime).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Detection Logs */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Detection Logs</h2>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {detectionLogs.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No detections yet
                  </p>
                ) : (
                  detectionLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-gray-900 text-sm">
                          {log.studentName}
                        </p>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            log.status === 'present'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {log.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>{log.time}</span>
                        <span className="font-medium">
                          {log.confidence.toFixed(1)}% confidence
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Student List */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Enrolled Students ({totalStudents})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedClass.studentIds.map((student: any) => {
                const isDetected = detectionLogs.some(
                  (log) => log.studentName === student.name
                );

                return (
                  <div
                    key={student._id}
                    className={`p-3 rounded-lg border-2 ${
                      isDetected
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isDetected
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {student.name}
                        </p>
                        <p className="text-xs text-gray-600">{student.registerNumber}</p>
                      </div>
                      {isDetected ? (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
