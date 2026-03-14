/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  User,
  BookOpen,
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  TrendingUp,
  Award,
} from 'lucide-react';

interface Student {
  _id: string;
  name: string;
  registerNumber: string;
  email: string;
  department: string;
  section?: string;
  imageUrl?: string;
}

interface Class {
  _id: string;
  courseName: string;
  courseCode?: string;
  classroomNumber: string;
  facultyName: string;
  startTime: string;
  endTime: string;
  status: string;
}

interface Stats {
  totalClasses: number;
  attendedClasses: number;
  attendancePercentage: string;
  todayClasses: Class[];
  subjectWiseAttendance: Array<{
    courseName: string;
    present: number;
    total: number;
    percentage: string;
  }>;
}

export default function StudentDashboard() {
  const [student, setStudent] = useState<Student | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchData, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, statsRes] = await Promise.all([
        fetch('/api/student/profile'),
        fetch('/api/student/stats'),
      ]);

      const profileData = await profileRes.json();
      const statsData = await statsRes.json();

      if (!profileRes.ok) {
        console.error('Profile API error:', profileData);
        setError(profileData.error || 'Failed to fetch profile');
        return;
      }

      if (!statsRes.ok) {
        console.error('Stats API error:', statsData);
        setError(statsData.error || 'Failed to fetch statistics');
        return;
      }

      if (profileData.success) {
        setStudent(profileData.student);
      } else {
        setError(profileData.error || 'Failed to load profile');
      }

      if (statsData.success) {
        setStats(statsData.stats);
      } else {
        setError(statsData.error || 'Failed to load statistics');
      }

      setError(null);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="p-8 max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Dashboard</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                fetchData();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </Card>
      </div>
    );
  }

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const attendancePercent = parseFloat(stats?.attendancePercentage || '0');

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Welcome back, {student?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Here&apos;s your attendance overview</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Profile & Stats */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          {/* Student Profile Card */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                {student?.imageUrl ? (
                  <img 
                    src={student.imageUrl} 
                    alt={student.name} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{student?.name}</h3>
                <p className="text-xs sm:text-sm text-gray-600">{student?.registerNumber}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Department</span>
                <span className="text-sm font-medium text-gray-900">{student?.department}</span>
              </div>
              {student?.section && (
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Section</span>
                  <span className="text-sm font-medium text-gray-900">{student.section}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Email</span>
                <span className="text-sm font-medium text-gray-900 truncate ml-2">
                  {student?.email}
                </span>
              </div>
            </div>
          </Card>

          {/* Attendance Overview */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Attendance Overview</h3>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {/* Overall Attendance */}
              <div className="text-center py-3 sm:py-4 bg-gray-50 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-600 mb-2">Overall Attendance</p>
                <p className={`text-3xl sm:text-4xl font-bold ${getAttendanceColor(attendancePercent)}`}>
                  {stats?.attendancePercentage}%
                </p>
                <div className="mt-3 sm:mt-4 flex items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div>
                    <p className="text-gray-600">Attended</p>
                    <p className="font-semibold text-gray-900">{stats?.attendedClasses}</p>
                  </div>
                  <div className="w-px h-8 bg-gray-300"></div>
                  <div>
                    <p className="text-gray-600">Total</p>
                    <p className="font-semibold text-gray-900">{stats?.totalClasses}</p>
                  </div>
                </div>
              </div>

              {/* Attendance Status */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  <span className="text-xs sm:text-sm font-medium text-blue-900">
                    {attendancePercent >= 75 ? 'Great Job!' : 
                     attendancePercent >= 60 ? 'Keep it up!' : 
                     'Needs Improvement'}
                  </span>
                </div>
                <Badge variant={attendancePercent >= 75 ? 'default' : 'destructive'}>
                  {attendancePercent >= 75 ? 'On Track' : 'At Risk'}
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Today's Classes & Subject-wise */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Classes */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Today&apos;s Classes</h3>
              </div>
              <Badge variant="outline">
                {stats?.todayClasses?.length || 0} classes
              </Badge>
            </div>

            {stats?.todayClasses && stats.todayClasses.length > 0 ? (
              <div className="space-y-3">
                {stats.todayClasses.map((cls) => {
                  const startTime = new Date(cls.startTime);
                  const endTime = new Date(cls.endTime);
                  const now = new Date();
                  const isActive = now >= startTime && now <= endTime;
                  const isPast = now > endTime;

                  return (
                    <div 
                      key={cls._id}
                      className={`p-4 rounded-lg border-2 ${
                        isActive ? 'border-green-200 bg-green-50' :
                        isPast ? 'border-gray-200 bg-gray-50' :
                        'border-blue-200 bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{cls.courseName}</h4>
                            {cls.courseCode && (
                              <Badge variant="outline" className="text-xs">
                                {cls.courseCode}
                              </Badge>
                            )}
                            {isActive && (
                              <Badge className="bg-green-600">Live Now</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{cls.facultyName}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                {startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                {' - '}
                                {endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{cls.classroomNumber}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No classes scheduled for today</p>
              </div>
            )}
          </Card>

          {/* Subject-wise Attendance */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Subject-wise Attendance</h3>
            </div>

            {stats?.subjectWiseAttendance && stats.subjectWiseAttendance.length > 0 ? (
              <div className="space-y-4">
                {stats.subjectWiseAttendance.map((subject) => {
                  const percentage = parseFloat(subject.percentage);
                  
                  return (
                    <div key={subject.courseName} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {subject.courseName}
                        </span>
                        <span className={`text-sm font-semibold ${getAttendanceColor(percentage)}`}>
                          {subject.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            percentage >= 75 ? 'bg-green-600' :
                            percentage >= 60 ? 'bg-yellow-600' :
                            'bg-red-600'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600">
                        {subject.present} / {subject.total} classes attended
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No attendance data available</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
