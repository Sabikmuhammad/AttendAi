/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface Student {
  _id: string;
  studentId: string;
  name: string;
  email: string;
  registerNumber: string;
  department: string;
  section: string;
  semester: string;
  imageUrl?: string;
  attendance: {
    totalClasses: number;
    attendedClasses: number;
    presentCount: number;
    lateCount: number;
    absentCount: number;
    percentage: number;
  };
}

interface FacultyInfo {
  name: string;
  email: string;
  facultyId: string;
  department: string;
  section: string | null;
  semester: string | null;
}

export default function MySectionPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [faculty, setFaculty] = useState<FacultyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'attendance'>('name');
  const [filterAttendance, setFilterAttendance] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('');
  const [facultyList, setFacultyList] = useState<{ facultyId: string; name: string; department: string }[]>([]);

  useEffect(() => {
    fetchFacultyList();
  }, []);

  useEffect(() => {
    if (selectedFacultyId) {
      fetchSectionData();
      // Save to localStorage
      localStorage.setItem('selectedFacultyId', selectedFacultyId);
    }
  }, [selectedFacultyId]);

  const fetchFacultyList = async () => {
    try {
      const response = await fetch('/api/faculty');
      const data = await response.json();
      if (data.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setFacultyList(data.faculty.map((f: any) => ({
          facultyId: f.facultyId,
          name: f.name,
          department: f.department
        })));
        
        // Try to get saved faculty ID or use first one
        const savedId = localStorage.getItem('selectedFacultyId');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (savedId && data.faculty.find((f: any) => f.facultyId === savedId)) {
          setSelectedFacultyId(savedId);
        } else if (data.faculty.length > 0) {
          setSelectedFacultyId(data.faculty[0].facultyId);
        }
      }
    } catch (error) {
      console.error('Error fetching faculty list:', error);
    }
  };

  const fetchSectionData = async () => {
    if (!selectedFacultyId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/faculty/my-section?facultyId=${selectedFacultyId}`);
      const data = await response.json();

      if (data.success) {
        setFaculty(data.faculty);
        setStudents(data.students);
      }
    } catch (error) {
      console.error('Error fetching section data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter students by attendance
  const filteredStudents = students.filter(student => {
    if (filterAttendance === 'all') return true;
    if (filterAttendance === 'low') return student.attendance.percentage < 50;
    if (filterAttendance === 'medium') return student.attendance.percentage >= 50 && student.attendance.percentage < 75;
    if (filterAttendance === 'high') return student.attendance.percentage >= 75;
    return true;
  });

  // Sort students
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else {
      return b.attendance.percentage - a.attendance.percentage;
    }
  });

  // Calculate section statistics
  const sectionStats = {
    totalStudents: students.length,
    averageAttendance: students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + s.attendance.percentage, 0) / students.length)
      : 0,
    lowAttendance: students.filter(s => s.attendance.percentage < 50).length,
    highAttendance: students.filter(s => s.attendance.percentage >= 75).length,
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {facultyList.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Faculty Profile (Auth Disabled - Development Mode)
            </label>
            <select
              value={selectedFacultyId}
              onChange={(e) => setSelectedFacultyId(e.target.value)}
              className="w-full sm:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {facultyList.map((fac) => (
                <option key={fac.facultyId} value={fac.facultyId}>
                  {fac.name} ({fac.facultyId}) - {fac.department}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading section data...</p>
        </div>
      </div>
    );
  }

  if (!faculty?.section || !faculty?.semester) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Faculty Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Faculty Profile (Auth Disabled - Development Mode)
          </label>
          <select
            value={selectedFacultyId}
            onChange={(e) => setSelectedFacultyId(e.target.value)}
            className="w-full sm:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Choose a faculty...</option>
            {facultyList.map((fac) => (
              <option key={fac.facultyId} value={fac.facultyId}>
                {fac.name} ({fac.facultyId}) - {fac.department}
              </option>
            ))}
          </select>
        </div>

        <Card className="p-8 sm:p-12 text-center">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Section Assigned</h2>
          <p className="text-gray-600 mb-6">
            {selectedFacultyId 
              ? "You have not been assigned as a coordinator for any section yet."
              : "Please select a faculty profile above to view their section."}
          </p>
          <p className="text-sm text-gray-500">
            {selectedFacultyId && "Please contact the admin to assign you as a section coordinator."}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Faculty Selector */}
      <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Viewing as (Auth Disabled - Development Mode):
        </label>
        <select
          value={selectedFacultyId}
          onChange={(e) => setSelectedFacultyId(e.target.value)}
          className="w-full sm:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
        >
          {facultyList.map((fac) => (
            <option key={fac.facultyId} value={fac.facultyId}>
              {fac.name} ({fac.facultyId}) - {fac.department}
            </option>
          ))}
        </select>
      </div>

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Section</h1>
        <p className="text-gray-600 mt-2">
          Section {faculty.section} • Semester {faculty.semester} • {faculty.department}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{sectionStats.totalStudents}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Attendance</p>
              <p className="text-2xl font-bold text-gray-900">{sectionStats.averageAttendance}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Low Attendance</p>
              <p className="text-2xl font-bold text-gray-900">{sectionStats.lowAttendance}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">High Attendance</p>
              <p className="text-2xl font-bold text-gray-900">{sectionStats.highAttendance}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Sort */}
      <Card className="p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterAttendance === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterAttendance('all')}
              className="text-sm"
            >
              All Students
            </Button>
            <Button
              variant={filterAttendance === 'low' ? 'default' : 'outline'}
              onClick={() => setFilterAttendance('low')}
              className="text-sm"
            >
              Low (&lt;50%)
            </Button>
            <Button
              variant={filterAttendance === 'medium' ? 'default' : 'outline'}
              onClick={() => setFilterAttendance('medium')}
              className="text-sm"
            >
              Medium (50-75%)
            </Button>
            <Button
              variant={filterAttendance === 'high' ? 'default' : 'outline'}
              onClick={() => setFilterAttendance('high')}
              className="text-sm"
            >
              High (≥75%)
            </Button>
          </div>

          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'attendance')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
              <option value="name">Sort by Name</option>
              <option value="attendance">Sort by Attendance</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Students List */}
      {sortedStudents.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No students found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sortedStudents.map((student) => {
            const attendanceColor =
              student.attendance.percentage >= 75
                ? 'text-green-600 bg-green-50'
                : student.attendance.percentage >= 50
                ? 'text-orange-600 bg-orange-50'
                : 'text-red-600 bg-red-50';

            const attendanceIcon =
              student.attendance.percentage >= 75 ? (
                <CheckCircle className="w-5 h-5" />
              ) : student.attendance.percentage >= 50 ? (
                <Clock className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              );

            return (
              <Card key={student._id} className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  {/* Student Info */}
                  <div className="flex items-center gap-4 flex-1">
                    {student.imageUrl ? (
                      <img
                        src={student.imageUrl}
                        alt={student.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold text-lg">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-lg truncate">
                        {student.name}
                      </h3>
                      <p className="text-sm text-gray-600">{student.registerNumber}</p>
                      <p className="text-xs text-gray-500 truncate">{student.email}</p>
                    </div>
                  </div>

                  {/* Attendance Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full sm:w-auto">
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">Total</p>
                      <p className="text-lg font-bold text-gray-900">
                        {student.attendance.totalClasses}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">Present</p>
                      <p className="text-lg font-bold text-green-600">
                        {student.attendance.presentCount}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">Late</p>
                      <p className="text-lg font-bold text-orange-600">
                        {student.attendance.lateCount}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">Absent</p>
                      <p className="text-lg font-bold text-red-600">
                        {student.attendance.absentCount}
                      </p>
                    </div>
                  </div>

                  {/* Attendance Percentage */}
                  <div
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg font-bold ${attendanceColor}`}
                  >
                    {attendanceIcon}
                    <span className="text-xl">{student.attendance.percentage}%</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
