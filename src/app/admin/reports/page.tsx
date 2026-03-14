'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, FileText, Search, Calendar } from 'lucide-react';

interface AttendanceRecord {
  _id: string;
  classId: {
    courseName: string;
    classroomNumber: string;
    startTime: string;
  };
  studentId: {
    name: string;
    registerNumber: string;
    department: string;
  };
  status: 'present' | 'absent' | 'late';
  detectedAt: string;
  confidence?: number;
}

interface StudentStats {
  studentId: string;
  name: string;
  registerNumber: string;
  department: string;
  totalClasses: number;
  present: number;
  absent: number;
  late: number;
  attendanceRate: number;
}

export default function AttendanceReports() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'records' | 'students'>('records');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/attendance');
      const data = await response.json();
      if (data.success) {
        setRecords(data.records);
      }
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate student-wise statistics
  const studentStats: StudentStats[] = [];
  const studentMap = new Map<string, StudentStats>();

  records.forEach((record) => {
    const sid = record.studentId?.registerNumber || '';
    if (!sid) return;

    if (!studentMap.has(sid)) {
      studentMap.set(sid, {
        studentId: sid,
        name: record.studentId?.name || '',
        registerNumber: record.studentId?.registerNumber || '',
        department: record.studentId?.department || '',
        totalClasses: 0,
        present: 0,
        absent: 0,
        late: 0,
        attendanceRate: 0,
      });
    }

    const stats = studentMap.get(sid)!;
    stats.totalClasses++;

    if (record.status === 'present') stats.present++;
    else if (record.status === 'absent') stats.absent++;
    else if (record.status === 'late') stats.late++;
  });

  studentMap.forEach((stats) => {
    stats.attendanceRate = stats.totalClasses > 0
      ? ((stats.present + stats.late) / stats.totalClasses) * 100
      : 0;
    studentStats.push(stats);
  });

  const filteredRecords = records.filter((record) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      record.classId?.courseName?.toLowerCase().includes(searchLower) ||
      record.studentId?.name?.toLowerCase().includes(searchLower) ||
      record.studentId?.registerNumber?.toLowerCase().includes(searchLower)
    );
  });

  const filteredStudentStats = studentStats.filter((stats) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      stats.name.toLowerCase().includes(searchLower) ||
      stats.registerNumber.toLowerCase().includes(searchLower) ||
      stats.department.toLowerCase().includes(searchLower)
    );
  });

  const exportToCSV = () => {
    if (viewMode === 'records') {
      // Export attendance records
      const csv = [
        ['Student Name', 'Register Number', 'Course', 'Classroom', 'Date', 'Status', 'Confidence'],
        ...filteredRecords.map((r) => [
          r.studentId?.name || '',
          r.studentId?.registerNumber || '',
          r.classId?.courseName || '',
          r.classId?.classroomNumber || '',
          new Date(r.detectedAt).toLocaleString(),
          r.status,
          r.confidence ? `${r.confidence.toFixed(1)}%` : 'N/A',
        ]),
      ]
        .map((row) => row.join(','))
        .join('\n');

      downloadCSV(csv, 'attendance-records.csv');
    } else {
      // Export student statistics
      const csv = [
        ['Name', 'Register Number', 'Department', 'Total Classes', 'Present', 'Absent', 'Late', 'Attendance Rate'],
        ...filteredStudentStats.map((s) => [
          s.name,
          s.registerNumber,
          s.department,
          s.totalClasses,
          s.present,
          s.absent,
          s.late,
          `${s.attendanceRate.toFixed(1)}%`,
        ]),
      ]
        .map((row) => row.join(','))
        .join('\n');

      downloadCSV(csv, 'student-attendance-stats.csv');
    }
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalRecords = records.length;
  const presentCount = records.filter((r) => r.status === 'present').length;
  const absentCount = records.filter((r) => r.status === 'absent').length;
  const lateCount = records.filter((r) => r.status === 'late').length;
  const overallRate = totalRecords > 0 ? ((presentCount + lateCount) / totalRecords * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Reports</h1>
          <p className="text-gray-600 mt-1">View and export attendance data</p>
        </div>
        <Button
          onClick={exportToCSV}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <p className="text-sm text-gray-600">Total Records</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{totalRecords}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600">Present</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{presentCount}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600">Absent</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{absentCount}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600">Overall Rate</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{overallRate}%</p>
        </Card>
      </div>

      {/* View Mode Toggle */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'records' ? 'default' : 'outline'}
              onClick={() => setViewMode('records')}
              className={viewMode === 'records' ? 'bg-purple-600' : ''}
            >
              <FileText className="w-4 h-4 mr-2" />
              Attendance Records
            </Button>
            <Button
              variant={viewMode === 'students' ? 'default' : 'outline'}
              onClick={() => setViewMode('students')}
              className={viewMode === 'students' ? 'bg-purple-600' : ''}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Student Statistics
            </Button>
          </div>
          <div className="flex-1 max-w-md ml-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Content */}
      <Card className="p-6">
        {viewMode === 'records' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Student
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Register Number
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Course
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Classroom
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Date & Time
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Confidence
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      Loading records...
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      No attendance records found
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {record.studentId?.name || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {record.studentId?.registerNumber || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {record.classId?.courseName || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {record.classId?.classroomNumber || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(record.detectedAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={record.status} />
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {record.confidence ? `${record.confidence.toFixed(1)}%` : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Student Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Register Number
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Department
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Total Classes
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Present
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Absent
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Late
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Attendance Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      Loading statistics...
                    </td>
                  </tr>
                ) : filteredStudentStats.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      No student statistics found
                    </td>
                  </tr>
                ) : (
                  filteredStudentStats.map((stats) => (
                    <tr key={stats.studentId} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{stats.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {stats.registerNumber}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {stats.department}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {stats.totalClasses}
                      </td>
                      <td className="py-3 px-4 text-sm text-green-600 font-medium">
                        {stats.present}
                      </td>
                      <td className="py-3 px-4 text-sm text-red-600 font-medium">
                        {stats.absent}
                      </td>
                      <td className="py-3 px-4 text-sm text-yellow-600 font-medium">
                        {stats.late}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {stats.attendanceRate.toFixed(1)}%
                          </span>
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                stats.attendanceRate >= 75
                                  ? 'bg-green-500'
                                  : stats.attendanceRate >= 50
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${stats.attendanceRate}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    present: 'bg-green-100 text-green-700',
    absent: 'bg-red-100 text-red-700',
    late: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        styles[status] || styles.present
      }`}
    >
      {status.toUpperCase()}
    </span>
  );
}
