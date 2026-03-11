'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Users, Clock, Building } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Student {
  _id: string;
  name: string;
  registerNumber: string;
  studentId: string;
  department: string;
  section?: string;
  email: string;
  imageUrl?: string;
}

interface Faculty {
  _id: string;
  name: string;
  email: string;
  facultyId: string;
  department: string;
  designation?: string;
  imageUrl?: string;
}

export default function CreateClassPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    courseName: '',
    courseCode: '',
    classroomNumber: '',
    facultyId: '',
    facultyName: '',
    department: '',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setInitialLoading(true);
    await Promise.all([fetchStudents(), fetchFaculty()]);
    setInitialLoading(false);
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      if (data.success) {
        setStudents(data.students);
        console.log('✅ Loaded students:', data.students.length);
      } else {
        console.error('Failed to fetch students:', data.error);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchFaculty = async () => {
    try {
      const response = await fetch('/api/faculty');
      const data = await response.json();
      if (data.success) {
        setFaculty(data.faculty);
        console.log('✅ Loaded faculty:', data.faculty.length);
      } else {
        console.error('Failed to fetch faculty:', data.error);
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedStudents.length === 0) {
      alert('Please select at least one student');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseName: formData.courseName,
          courseCode: formData.courseCode,
          classroomNumber: formData.classroomNumber,
          facultyId: formData.facultyId,
          facultyName: formData.facultyName,
          department: formData.department,
          startTime: formData.startTime,
          endTime: formData.endTime,
          studentIds: selectedStudents,
        }),
      });

      if (response.ok) {
        alert('Class created successfully!');
        router.push('/admin/classes');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create class');
      }
    } catch (error) {
      console.error('Error creating class:', error);
      alert('Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map((s) => s._id));
    }
  };

  const departmentStudents = formData.department
    ? students.filter((s) => s.department === formData.department)
    : students;

  // Get unique departments from both students and faculty
  const departments = Array.from(
    new Set([
      ...students.map((s) => s.department).filter(Boolean),
      ...faculty.map((f) => f.department).filter(Boolean),
    ])
  ).sort();

  if (initialLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Class</h1>
          <p className="text-gray-600 mt-1">Schedule a new class session with AI attendance</p>
        </div>
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="text-gray-600">Loading faculty and students...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Class</h1>
        <p className="text-gray-600 mt-1">Schedule a new class session with AI attendance</p>
      </div>

      {/* Warning if no data */}
      {(faculty.length === 0 || students.length === 0) && (
        <Card className="p-6 border-orange-200 bg-orange-50">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 text-orange-600 mt-0.5">⚠️</div>
            <div>
              <h3 className="font-semibold text-orange-900">Missing Data</h3>
              <p className="text-sm text-orange-800 mt-1">
                {faculty.length === 0 && students.length === 0
                  ? 'No faculty or students found. Please add faculty and students before creating a class.'
                  : faculty.length === 0
                  ? 'No faculty members found. Please add faculty before creating a class.'
                  : 'No students found. Please add students before creating a class.'}
              </p>
            </div>
          </div>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Class Information */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Class Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Course Name *</Label>
              <Input
                required
                placeholder="e.g., Machine Learning"
                value={formData.courseName}
                onChange={(e) =>
                  setFormData({ ...formData, courseName: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Course Code</Label>
              <Input
                placeholder="e.g., CS401"
                value={formData.courseCode}
                onChange={(e) =>
                  setFormData({ ...formData, courseCode: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Classroom Number *</Label>
              <Input
                required
                placeholder="e.g., Room 301"
                value={formData.classroomNumber}
                onChange={(e) =>
                  setFormData({ ...formData, classroomNumber: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Faculty *</Label>
              <select
                required
                disabled={faculty.length === 0}
                value={formData.facultyId}
                onChange={(e) => {
                  const selectedFaculty = faculty.find(f => f._id === e.target.value);
                  setFormData({ 
                    ...formData, 
                    facultyId: e.target.value,
                    facultyName: selectedFaculty?.name || ''
                  });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {faculty.length === 0 ? 'No faculty available' : 'Select Faculty'}
                </option>
                {faculty.map((fac) => (
                  <option key={fac._id} value={fac._id}>
                    {fac.name} ({fac.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Department *</Label>
              <select
                required
                disabled={departments.length === 0}
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {departments.length === 0 ? 'No departments available' : 'Select Department'}
                </option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Schedule */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Schedule</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Start Time *</Label>
              <Input
                type="datetime-local"
                required
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
              />
            </div>

            <div>
              <Label>End Time *</Label>
              <Input
                type="datetime-local"
                required
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
              />
            </div>
          </div>
        </Card>

        {/* Student Selection */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Select Students</h2>
                <p className="text-sm text-gray-600">
                  {selectedStudents.length} of {departmentStudents.length} selected
                </p>
              </div>
            </div>
            <Button type="button" variant="outline" onClick={selectAll}>
              {selectedStudents.length === departmentStudents.length
                ? 'Deselect All'
                : 'Select All'}
            </Button>
          </div>

          {formData.department ? (
            departmentStudents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {departmentStudents.map((student) => (
                <button
                  key={student._id}
                  type="button"
                  onClick={() => toggleStudent(student._id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedStudents.includes(student._id)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        selectedStudents.includes(student._id)
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {student.name}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {student.registerNumber}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            ) : (
              <div className="py-12 text-center text-gray-500">
                No students found in {formData.department} department
              </div>
            )
          ) : (
            <div className="py-12 text-center text-gray-500">
              Please select a department first
            </div>
          )}
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/classes')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || selectedStudents.length === 0}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? 'Creating...' : 'Create Class'}
          </Button>
        </div>
      </form>
    </div>
  );
}
