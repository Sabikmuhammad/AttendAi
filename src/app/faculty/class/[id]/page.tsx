'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Calendar,
  ExternalLink,
  Camera,
} from 'lucide-react';

interface Student {
  _id: string;
  name: string;
  registerNumber: string;
  email: string;
  department: string;
}

interface ClassData {
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
  department: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  studentIds: Student[];
}

export default function ClassDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClassDetails();
    
    // Auto-refresh to check for status updates
    const interval = setInterval(fetchClassDetails, 30000);
    
    return () => clearInterval(interval);
  }, [params.id]);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/faculty/classes/${params.id}`);
      const data = await response.json();
      
      if (data.success) {
        setClassData(data.class);
        
        // If class becomes active, navigate to monitoring
        if (data.class.status === 'active') {
          // Auto-open monitoring in 3 seconds
          setTimeout(() => {
            router.push(`/faculty/class/${params.id}/monitor`);
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Error fetching class details:', error);
    } finally {
      setLoading(false);
    }
  };

  const openGoogleMaps = () => {
    if (classData?.classroomLocation) {
      const { latitude, longitude } = classData.classroomLocation;
      const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
      window.open(url, '_blank');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
      active: 'bg-green-100 text-green-700 border-green-200',
      completed: 'bg-gray-100 text-gray-700 border-gray-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status as keyof typeof colors] || colors.scheduled;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading class details...</p>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Class not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/faculty/dashboard')}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{classData.courseName}</h1>
            <p className="text-gray-600 mt-1">
              {classData.courseCode && `${classData.courseCode} • `}
              {classData.section && `Section ${classData.section}`}
            </p>
          </div>
        </div>
        <Badge className={`${getStatusColor(classData.status)} border text-lg px-4 py-2`}>
          {classData.status.toUpperCase()}
        </Badge>
      </div>

      {/* Class Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Class Information</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-600">Faculty</p>
                <p className="text-base text-gray-900">{classData.facultyName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-600">Classroom</p>
                <p className="text-base text-gray-900">{classData.classroomNumber}</p>
                <p className="text-sm text-gray-500">{classData.department}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-600">Date</p>
                <p className="text-base text-gray-900">
                  {new Date(classData.startTime).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-600">Time</p>
                <p className="text-base text-gray-900">
                  {new Date(classData.startTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {' - '}
                  {new Date(classData.endTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            {classData.classroomLocation && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">Classroom Location</p>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      Latitude: {classData.classroomLocation.latitude}
                    </p>
                    <p className="text-sm text-gray-600">
                      Longitude: {classData.classroomLocation.longitude}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={openGoogleMaps}
                    className="mt-3 hover:bg-purple-50 hover:text-purple-600"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Google Maps
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Stats */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm font-medium text-purple-600">Total Students</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {classData.studentIds.length}
              </p>
            </div>

            {classData.status === 'active' && (
              <Button
                onClick={() => router.push(`/faculty/class/${params.id}/monitor`)}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Camera className="w-4 h-4 mr-2" />
                Open Monitoring
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Student List */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Enrolled Students ({classData.studentIds.length})
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
                  Email
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Department
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {classData.studentIds.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No students enrolled in this class
                  </td>
                </tr>
              ) : (
                classData.studentIds.map((student, index) => (
                  <tr key={student._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {index + 1}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-semibold text-sm">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {student.registerNumber}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {student.email}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {student.department}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Auto-redirect notification */}
      {classData.status === 'active' && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <Camera className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">
              Class is now active! Redirecting to monitoring system in 3 seconds...
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
