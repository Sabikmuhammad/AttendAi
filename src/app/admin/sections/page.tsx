/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, GraduationCap, BookOpen, Filter } from 'lucide-react';

interface Student {
  _id: string;
  name: string;
  registerNumber: string;
  email: string;
  department: string;
  section: string;
  semester: string;
  imageUrl?: string;
}

export default function SectionsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique values for filters
  const departments = Array.from(new Set(students.map(s => s.department).filter(Boolean))).sort();
  const sections = Array.from(new Set(students.map(s => s.section).filter(Boolean))).sort();
  const semesters = Array.from(new Set(students.map(s => s.semester).filter(Boolean))).sort((a, b) => parseInt(a) - parseInt(b));

  // Filter students
  const filteredStudents = students.filter(student => {
    if (selectedDepartment && student.department !== selectedDepartment) return false;
    if (selectedSection && student.section !== selectedSection) return false;
    if (selectedSemester && student.semester !== selectedSemester) return false;
    return true;
  });

  // Group students by section and semester
  const groupedStudents: Record<string, Record<string, Student[]>> = {};
  filteredStudents.forEach(student => {
    const section = student.section || 'Unassigned';
    const semester = student.semester || 'Unassigned';
    if (!groupedStudents[section]) {
      groupedStudents[section] = {};
    }
    if (!groupedStudents[section][semester]) {
      groupedStudents[section][semester] = [];
    }
    groupedStudents[section][semester].push(student);
  });

  const clearFilters = () => {
    setSelectedDepartment('');
    setSelectedSection('');
    setSelectedSemester('');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Sections & Semesters</h1>
        <p className="text-gray-600 mt-2">View and manage students by section and semester</p>
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
              <p className="text-2xl font-bold text-gray-900">{filteredStudents.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Departments</p>
              <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Sections</p>
              <p className="text-2xl font-bold text-gray-900">{sections.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Semesters</p>
              <p className="text-2xl font-bold text-gray-900">{semesters.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Sections</option>
              {sections.map(section => (
                <option key={section} value={section}>Section {section}</option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Semesters</option>
              {semesters.map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>

          {/* Clear Button */}
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full"
              disabled={!selectedDepartment && !selectedSection && !selectedSemester}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Grouped Students */}
      {Object.keys(groupedStudents).length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No students found matching the selected filters</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedStudents).map(([section, semesterGroups]) => (
            <Card key={section} className="p-4 sm:p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Section {section}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {Object.values(semesterGroups).flat().length} students
                </p>
              </div>

              {Object.entries(semesterGroups).map(([semester, studentsList]) => (
                <div key={semester} className="mb-6 last:mb-0">
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      Semester {semester}
                    </h3>
                    <span className="ml-auto text-sm text-gray-600">
                      {studentsList.length} {studentsList.length === 1 ? 'student' : 'students'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {studentsList.map((student) => (
                      <Card key={student._id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          {student.imageUrl ? (
                            <img
                              src={student.imageUrl}
                              alt={student.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {student.name}
                            </h4>
                            <p className="text-sm text-gray-600 truncate">
                              {student.registerNumber}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              {student.department}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
