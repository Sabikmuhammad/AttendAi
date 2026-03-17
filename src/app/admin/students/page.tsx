'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Edit, Upload, Search, Share2, FileText, Check } from 'lucide-react';
import Link from 'next/link';

interface Student {
  _id: string;
  name: string;
  registerNumber: string;
  email: string;
  department: string;
  section?: string;
  semester?: string;
  imageUrl?: string;
  createdAt: string;
}

export default function StudentsManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [institutionCode, setInstitutionCode] = useState('');
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchInstitutionInfo();
  }, []);

  const fetchInstitutionInfo = async () => {
    try {
      const res = await fetch('/api/tenant/info');
      const data = await res.json();
      if (data.success && data.institution?.code) {
        setInstitutionCode(data.institution.code);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleShareRegister = () => {
    if (!institutionCode) return;
    const url = `${window.location.origin}/register?institutionCode=${institutionCode}`;
    navigator.clipboard.writeText(url);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
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

  const deleteStudent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      const response = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setStudents(students.filter((s) => s._id !== id));
      }
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.registerNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment =
      !selectedDepartment || student.department === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  const departments = Array.from(new Set(students.map((s) => s.department).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-600 mt-1">Manage student database and face recognition data</p>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:gap-3">
          {institutionCode && (
            <Button
              onClick={handleShareRegister}
              variant="outline"
              className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 sm:w-auto"
            >
              {copiedShare ? <Check className="w-4 h-4 mr-2 text-green-600" /> : <Share2 className="w-4 h-4 mr-2" />}
              {copiedShare ? 'Link Copied!' : 'Share to Register'}
            </Button>
          )}
          <Button variant="outline" onClick={() => setShowCsvModal(true)} className="w-full sm:w-auto">
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button
            onClick={() => setShowAddModal(true)}
            className="w-full bg-purple-600 hover:bg-purple-700 sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
        <Card className="p-6">
          <p className="text-sm text-gray-600">Total Students</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{students.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600">Departments</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{departments.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600">With Face Data</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {students.filter((s) => s.imageUrl).length}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by name, register number, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:w-56"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Students Table */}
      <Card className="p-6">
        <div className="hidden md:block overflow-x-auto">
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
                  Email
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Department
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Face Data
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Loading students...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No students found
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-semibold">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {student.registerNumber}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {student.email}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {student.department}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          student.imageUrl
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {student.imageUrl ? 'Available' : 'Missing'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/upload?studentId=${student._id}`}>
                            <Upload className="w-4 h-4 text-blue-600" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setEditingStudent(student);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteStudent(student._id)}
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

        <div className="space-y-3 md:hidden">
          {loading ? (
            <p className="text-center py-8 text-gray-500">Loading students...</p>
          ) : filteredStudents.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No students found</p>
          ) : (
            filteredStudents.map((student) => (
              <div key={student._id} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{student.name}</p>
                    <p className="text-xs text-gray-500 truncate">{student.email}</p>
                    <p className="mt-1 text-sm text-gray-600">{student.registerNumber}</p>
                    <p className="text-sm text-gray-600">{student.department}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${
                      student.imageUrl ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {student.imageUrl ? 'Face OK' : 'No Face'}
                  </span>
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/upload?studentId=${student._id}`}>
                      <Upload className="w-4 h-4 text-blue-600" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingStudent(student);
                      setShowEditModal(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteStudent(student._id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Add Student Modal */}
      {showAddModal && (
        <AddStudentModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchStudents();
            setShowAddModal(false);
          }}
        />
      )}

      {/* Edit Student Modal */}
      {showEditModal && editingStudent && (
        <EditStudentModal
          student={editingStudent}
          onClose={() => {
            setShowEditModal(false);
            setEditingStudent(null);
          }}
          onSuccess={() => {
            fetchStudents();
            setShowEditModal(false);
            setEditingStudent(null);
          }}
        />
      )}

      {/* CSV Import Modal */}
      {showCsvModal && (
        <ImportCsvModal 
          onClose={() => setShowCsvModal(false)}
          onSuccess={() => {
            fetchStudents();
            setShowCsvModal(false);
          }}
        />
      )}
    </div>
  );
}

function ImportCsvModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file first.');
      return;
    }

    setLoading(true);
    setError('');

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const rows = text.split('\n').map(row => row.split(','));
        const headers = rows[0].map(h => h.trim().toLowerCase());
        
        // Find required column indexes
        const nameIdx = headers.findIndex(h => h.includes('name'));
        const emailIdx = headers.findIndex(h => h.includes('email'));
        const regIdx = headers.findIndex(h => h.includes('register') || h.includes('id') || h.includes('roll'));
        const deptIdx = headers.findIndex(h => h.includes('department') || h.includes('dept'));
        const secIdx = headers.findIndex(h => h.includes('section') || h.includes('sec'));
        const semIdx = headers.findIndex(h => h.includes('semester') || h.includes('sem'));

        if (nameIdx === -1 || emailIdx === -1 || regIdx === -1) {
          setError('CSV must contain Name, Email, and Register Number/ID columns.');
          setLoading(false);
          return;
        }

        const studentsToCreate = [];
        for (let i = 1; i < rows.length; i++) {
          if (!rows[i] || rows[i].length < 3 || !rows[i][nameIdx]) continue;
          
          studentsToCreate.push({
            name: rows[i][nameIdx].trim(),
            email: rows[i][emailIdx]?.trim(),
            studentId: rows[i][regIdx]?.trim(),
            department: deptIdx !== -1 ? rows[i][deptIdx]?.trim() || 'General' : 'General',
            section: secIdx !== -1 ? rows[i][secIdx]?.trim() || 'A' : 'A',
            semester: semIdx !== -1 ? rows[i][semIdx]?.trim() || '1' : '1',
          });
        }

        // Batch send to API
        for (const st of studentsToCreate) {
           await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(st),
          }).catch(() => {});
        }

        onSuccess();
      } catch {
        setError('Failed to parse CSV or create students.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 p-3 sm:p-4 overflow-y-auto">
      <Card className="w-full max-w-md p-5 sm:p-6 mx-auto my-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Import Students CSV</h2>
        <p className="text-sm text-gray-500 mb-6">
          Upload a CSV file with columns like <span className="font-semibold text-gray-700">Name, Email, Register Number, Department, Section, Semester</span>.
        </p>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
            id="csv-upload"
          />
          <Label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3">
              <FileText className="w-6 h-6" />
            </div>
            {file ? (
              <span className="text-sm font-medium text-purple-600">{file.name}</span>
            ) : (
              <span className="text-sm font-medium text-gray-600">Click to browse or drag and drop</span>
            )}
            <span className="text-xs text-gray-400 mt-1">.csv format only</span>
          </Label>
        </div>

        <div className="flex gap-3 pt-6">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={loading || !file} className="flex-1 bg-purple-600 hover:bg-purple-700">
            {loading ? 'Importing...' : 'Start Import'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function AddStudentModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    registerNumber: '',
    email: '',
    department: '',
    section: '',
    semester: '',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          studentId: formData.registerNumber,
          department: formData.department,
          section: formData.section,
          semester: formData.semester,
          imageUrl: formData.imageUrl,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create student');
      }
    } catch (error) {
      console.error('Error creating student:', error);
      alert('Failed to create student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 p-3 sm:p-4 overflow-y-auto">
      <Card className="w-full max-w-md p-5 sm:p-6 mx-auto my-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Student</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Register Number</Label>
            <Input
              required
              value={formData.registerNumber}
              onChange={(e) =>
                setFormData({ ...formData, registerNumber: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <Label>Department</Label>
            <Input
              required
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Section</Label>
            <Input
              required
              placeholder="e.g., A, B, C"
              value={formData.section}
              onChange={(e) =>
                setFormData({ ...formData, section: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Semester</Label>
            <select
              required
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select Semester</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
              <option value="5">Semester 5</option>
              <option value="6">Semester 6</option>
              <option value="7">Semester 7</option>
              <option value="8">Semester 8</option>
            </select>
          </div>
          <div>
            <Label>Image URL (optional)</Label>
            <Input
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData({ ...formData, imageUrl: e.target.value })
              }
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Creating...' : 'Create Student'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function EditStudentModal({
  student,
  onClose,
  onSuccess,
}: {
  student: Student;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: student.name || '',
    registerNumber: student.registerNumber || '',
    email: student.email || '',
    department: student.department || '',
    imageUrl: student.imageUrl || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/students/${student._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update student');
      }
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 p-3 sm:p-4 overflow-y-auto">
      <Card className="w-full max-w-md p-5 sm:p-6 mx-auto my-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Student</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Register Number</Label>
            <Input
              required
              value={formData.registerNumber}
              onChange={(e) =>
                setFormData({ ...formData, registerNumber: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <Label>Department</Label>
            <Input
              required
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Image URL (optional)</Label>
            <Input
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData({ ...formData, imageUrl: e.target.value })
              }
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Updating...' : 'Update Student'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
