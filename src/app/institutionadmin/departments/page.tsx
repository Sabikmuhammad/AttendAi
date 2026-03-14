'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface Department {
  _id: string;
  name: string;
  code?: string;
}

export default function InstitutionDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/tenant/departments');
      const data = await res.json();
      if (data.success) setDepartments(data.departments);
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
        <p className="text-gray-600">Tenant-level academic departments</p>
      </div>
      <Card className="p-6">
        {departments.length === 0 ? (
          <p className="text-gray-600">No departments found.</p>
        ) : (
          <div className="space-y-2">
            {departments.map((department) => (
              <div key={department._id} className="border rounded-lg p-3">
                <p className="font-medium text-gray-900">{department.name}</p>
                {department.code && <p className="text-sm text-gray-600">{department.code}</p>}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
