'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Users, Search } from 'lucide-react';
import Link from 'next/link';

interface ClassData {
  _id: string;
  courseName: string;
  courseCode?: string;
  classroomNumber: string;
  facultyName: string;
  department: string;
  startTime: string;
  endTime: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  studentIds: any[];
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
}

export default function ClassesManagement() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/classes');
      const data = await response.json();
      if (data.success) {
        setClasses(data.classes);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteClass = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return;

    try {
      const response = await fetch(`/api/classes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setClasses(classes.filter((c) => c._id !== id));
      }
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  };

  const updateClassStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/classes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchClasses();
      }
    } catch (error) {
      console.error('Error updating class status:', error);
    }
  };

  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.facultyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.classroomNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !statusFilter || cls.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: classes.length,
    scheduled: classes.filter((c) => c.status === 'scheduled').length,
    active: classes.filter((c) => c.status === 'active').length,
    completed: classes.filter((c) => c.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class Management</h1>
          <p className="text-gray-600 mt-1">Manage all class sessions</p>
        </div>
        <Link href="/admin/create-class">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Class
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <p className="text-sm text-gray-600">Total Classes</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {statusCounts.all}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600">Scheduled</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {statusCounts.scheduled}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {statusCounts.active}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-3xl font-bold text-gray-600 mt-2">
            {statusCounts.completed}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by course, faculty, or classroom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </Card>

      {/* Classes Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Course
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Classroom
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Faculty
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Schedule
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Students
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    Loading classes...
                  </td>
                </tr>
              ) : filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No classes found
                  </td>
                </tr>
              ) : (
                filteredClasses.map((cls) => (
                  <tr key={cls._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{cls.courseName}</p>
                        {cls.courseCode && (
                          <p className="text-sm text-gray-600">{cls.courseCode}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {cls.classroomNumber}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-900">{cls.facultyName}</p>
                      <p className="text-xs text-gray-600">{cls.department}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <p className="text-gray-900">
                          {new Date(cls.startTime).toLocaleDateString()}
                        </p>
                        <p className="text-gray-600">
                          {new Date(cls.startTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          -
                          {new Date(cls.endTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        {cls.studentIds?.length || 0}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={cls.status} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/camera?class=${cls._id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-purple-600 hover:text-purple-700"
                          >
                            Monitor
                          </Button>
                        </Link>
                        {cls.status === 'scheduled' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateClassStatus(cls._id, 'active')}
                            className="text-green-600 hover:text-green-700"
                          >
                            Start
                          </Button>
                        )}
                        {cls.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateClassStatus(cls._id, 'completed')}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            End
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteClass(cls._id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        styles[status] || styles.scheduled
      }`}
    >
      {status.toUpperCase()}
    </span>
  );
}
