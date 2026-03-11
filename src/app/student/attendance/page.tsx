'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  BookOpen,
  Download,
  Filter,
} from 'lucide-react';

interface AttendanceRecord {
  _id: string;
  classId: {
    _id: string;
    courseName: string;
    courseCode?: string;
    classroomNumber: string;
    startTime: string;
    endTime: string;
    facultyName: string;
  };
  studentId: {
    _id: string;
    studentId: string;
    department: string;
    userId?: {
      name: string;
      email: string;
    };
  } | string;
  status: 'present' | 'absent' | 'late';
  detectedTime?: string;
  detectedAt?: string;
  confidence?: number;
  method: 'face_recognition' | 'manual' | 'qr_code';
  createdAt: string;
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'present' | 'absent' | 'late'>('all');

  useEffect(() => {
    fetchAttendance();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchAttendance, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await fetch('/api/student/attendance');
      const data = await response.json();
      
      if (data.success) {
        setAttendance(data.attendance);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendance = filter === 'all' 
    ? attendance 
    : attendance.filter(a => a.status === filter);

  const stats = {
    total: attendance.length,
    present: attendance.filter(a => a.status === 'present').length,
    absent: attendance.filter(a => a.status === 'absent').length,
    late: attendance.filter(a => a.status === 'late').length,
  };

  const attendancePercentage = stats.total > 0 
    ? ((stats.present / stats.total) * 100).toFixed(1)
    : '0.0';

  const getStatusColor = (status: string) => {
    const colors = {
      present: 'bg-green-100 text-green-700 border-green-200',
      absent: 'bg-red-100 text-red-700 border-red-200',
      late: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    };
    return colors[status as keyof typeof colors] || colors.present;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'absent':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'late':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getMethodBadge = (method: string) => {
    const labels = {
      face_recognition: 'AI Detected',
      manual: 'Manual',
      qr_code: 'QR Code',
    };
    return labels[method as keyof typeof labels] || method;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Records</h1>
          <p className="text-gray-600 mt-1">View your complete attendance history</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Records</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="bg-blue-500/10 text-blue-600 p-4 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-2 border-green-200 bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Present</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{stats.present}</p>
              <p className="text-xs text-green-600 mt-1">{attendancePercentage}%</p>
            </div>
            <div className="bg-green-600 text-white p-4 rounded-xl">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-2 border-red-200 bg-red-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Absent</p>
              <p className="text-3xl font-bold text-red-900 mt-2">{stats.absent}</p>
            </div>
            <div className="bg-red-600 text-white p-4 rounded-xl">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-2 border-yellow-200 bg-yellow-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-700">Late</p>
              <p className="text-3xl font-bold text-yellow-900 mt-2">{stats.late}</p>
            </div>
            <div className="bg-yellow-600 text-white p-4 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 mr-2">Filter:</span>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-purple-600 hover:bg-purple-700' : ''}
            size="sm"
          >
            All Records
          </Button>
          <Button
            variant={filter === 'present' ? 'default' : 'outline'}
            onClick={() => setFilter('present')}
            className={filter === 'present' ? 'bg-green-600 hover:bg-green-700' : ''}
            size="sm"
          >
            Present
          </Button>
          <Button
            variant={filter === 'absent' ? 'default' : 'outline'}
            onClick={() => setFilter('absent')}
            className={filter === 'absent' ? 'bg-red-600 hover:bg-red-700' : ''}
            size="sm"
          >
            Absent
          </Button>
          <Button
            variant={filter === 'late' ? 'default' : 'outline'}
            onClick={() => setFilter('late')}
            className={filter === 'late' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
            size="sm"
          >
            Late
          </Button>
        </div>
      </Card>

      {/* Attendance Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Course Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Confidence
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredAttendance.length > 0 ? (
                filteredAttendance.map((record) => {
                  const detectedTime = new Date(record.detectedAt || record.detectedTime || record.createdAt);
                  const classTime = new Date(record.classId.startTime);

                  return (
                    <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-semibold text-gray-900">
                              {record.classId.courseName}
                            </p>
                            {record.classId.courseCode && (
                              <p className="text-sm text-gray-500">
                                {record.classId.courseCode}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {classTime.toLocaleDateString('en-US', { 
                              year: 'numeric',
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {detectedTime.toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={`${getStatusColor(record.status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(record.status)}
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="text-xs">
                          {getMethodBadge(record.method)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {record.confidence !== undefined && (
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${record.confidence * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600">
                              {(record.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-500">No attendance records found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
