'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Building2 } from 'lucide-react';

interface Department {
  _id: string;
  name: string;
  code?: string;
}

export default function InstitutionDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tenant/departments');
      const data = await res.json();
      if (data.success) {
        setDepartments(data.departments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) {
      setError('Department name is required');
      return;
    }

    try {
      const res = await fetch('/api/tenant/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDeptName, code: newDeptCode }),
      });
      const data = await res.json();
      
      if (data.success) {
        setDepartments([...departments, data.department]);
        setIsAdding(false);
        setNewDeptName('');
        setNewDeptCode('');
        setError('');
      } else {
        setError(data.error || 'Failed to add department');
      }
    } catch {
      setError('An error occurred while adding the department');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Departments</h1>
          <p className="text-gray-500 text-sm mt-1">Manage tenant-level academic departments</p>
        </div>
        <Button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          {isAdding ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Add Department</>}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
          {error}
        </div>
      )}

      {isAdding && (
        <Card className="p-5 border-purple-100 bg-purple-50/30">
          <form onSubmit={handleAddDepartment} className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm">Add New Department</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Department Name *</label>
                <input
                  type="text"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Department Code (Optional)</label>
                <input
                  type="text"
                  value={newDeptCode}
                  onChange={(e) => setNewDeptCode(e.target.value)}
                  placeholder="e.g. CSE"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-700">
                Save Department
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : departments.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No departments found</h3>
          <p className="text-gray-500 text-sm max-w-sm mt-1 mb-6">
            Get started by adding your first academic department.
          </p>
          <Button 
            onClick={() => setIsAdding(true)}
            variant="outline"
            className="border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Department
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((department) => (
            <Card key={department._id} className="p-5 hover:shadow-md transition-shadow border-gray-100 group">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                    {department.name}
                  </h3>
                  {department.code ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mt-2">
                      {department.code}
                    </span>
                  ) : (
                    <p className="text-xs text-gray-400 mt-2">No code set</p>
                  )}
                </div>
                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
