'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  BookOpen,
  User,
  MapPin,
  Clock,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Info,
} from 'lucide-react';

interface ClassDetails {
  _id: string;
  courseName: string;
  courseCode?: string;
  section?: string;
  classroomNumber: string;
  classroomLocation?: {
    latitude: number;
    longitude: number;
  };
  facultyName: string;
  facultyId?: {
    name: string;
    email: string;
  };
  department: string;
  startTime: string;
  endTime: string;
  status: string;
  studentIds: any[];
}

interface AttendanceRecord {
  _id: string;
  status: 'present' | 'absent' | 'late';
  detectedTime: string;
  confidence?: number;
  method: string;
}

export default function ClassDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [classData, setClassData] = useState<ClassDetails | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchClassDetails();
    }
  }, [params.id]);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/student/class/${params.id}`);
      const data = await response.json();
      
      if (data.success) {
        setClassData(data.class);
        setAttendance(data.attendance);
      }
    } catch (error) {
      console.error('Error fetching class details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="text-center py-12">
        <Info className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Class Not Found</h2>
        <p className="text-gray-600 mb-6">The class you're looking for doesn't exist or you don't have access.</p>
        <Button onClick={() => router.push('/student/classes')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Classes
        </Button>
      </div>
    );
  }

  const startTime = new Date(classData.startTime);
  const endTime = new Date(classData.endTime);
  const now = new Date();
  const isActive = now >= startTime && now <= endTime;
  const isPast = now > endTime;

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
      active: 'bg-green-100 text-green-700 border-green-200',
      completed: 'bg-gray-100 text-gray-700 border-gray-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status as keyof typeof colors] || colors.scheduled;
  };

  const getAttendanceStatusColor = (status: string) => {
    const colors = {
      present: 'bg-green-100 text-green-700 border-green-200',
      absent: 'bg-red-100 text-red-700 border-red-200',
      late: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    };
    return colors[status as keyof typeof colors] || colors.present;
  };

  const openGoogleMaps = () => {
    if (classData.classroomLocation) {
      const { latitude, longitude } = classData.classroomLocation;
      const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.push('/student/classes')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Classes
        </Button>
        <Badge className={getStatusColor(classData.status)}>
          {classData.status}
        </Badge>
      </div>

      {/* Class Information */}
      <Card className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{classData.courseName}</h1>
              <div className="flex items-center gap-3 mt-2">
                {classData.courseCode && (
                  <Badge variant="outline">{classData.courseCode}</Badge>
                )}
                {classData.section && (
                  <Badge variant="outline">Section {classData.section}</Badge>
                )}
                <Badge variant="outline">{classData.department}</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Faculty Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Faculty Information
            </h3>
            <div className="pl-7 space-y-2">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-900">{classData.facultyName}</p>
              </div>
              {classData.facultyId?.email && (
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{classData.facultyId.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-600" />
              Location
            </h3>
            <div className="pl-7 space-y-2">
              <div>
                <p className="text-sm text-gray-600">Classroom</p>
                <p className="font-medium text-gray-900">{classData.classroomNumber}</p>
              </div>
              {classData.classroomLocation && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openGoogleMaps}
                  className="flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  Open in Google Maps
                </Button>
              )}
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Schedule
            </h3>
            <div className="pl-7 space-y-2">
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium text-gray-900">
                  {startTime.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-medium text-gray-900">
                  {startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  {' - '}
                  {endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>

          {/* Class Size */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
              Class Size
            </h3>
            <div className="pl-7">
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="font-medium text-gray-900">{classData.studentIds?.length || 0} students</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Attendance Status */}
      <Card className="p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Attendance Status</h2>
        
        {attendance ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                attendance.status === 'present' ? 'bg-green-100' :
                attendance.status === 'absent' ? 'bg-red-100' :
                'bg-yellow-100'
              }`}>
                {attendance.status === 'present' ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : attendance.status === 'absent' ? (
                  <XCircle className="w-6 h-6 text-red-600" />
                ) : (
                  <Clock className="w-6 h-6 text-yellow-600" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge className={getAttendanceStatusColor(attendance.status)}>
                  {attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1)}
                </Badge>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Detected Time</p>
              <p className="font-medium text-gray-900">
                {new Date(attendance.detectedTime).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Detection Method</p>
              <Badge variant="outline">
                {attendance.method === 'face_recognition' ? 'AI Detected' :
                 attendance.method === 'manual' ? 'Manual' :
                 'QR Code'}
              </Badge>
            </div>

            {attendance.confidence !== undefined && (
              <div className="md:col-span-3">
                <p className="text-sm text-gray-600 mb-2">Confidence Score</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${attendance.confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {(attendance.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Info className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <h3 className="font-semibold text-gray-900 mb-2">No Attendance Record</h3>
            <p className="text-gray-600">
              {isPast ? 'Your attendance was not recorded for this class.' :
               isActive ? 'Attendance will be marked automatically when you are detected.' :
               'Attendance will be recorded when the class starts.'}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
