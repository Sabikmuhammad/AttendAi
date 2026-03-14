"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface InstitutionOption {
  _id: string;
  name: string;
  domain: string;
}

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: string;
  institutionId: string;
  institutionName: string;
  institutionDomain: string;
  isVerified: boolean;
  createdAt: string;
}

export default function SuperAdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [institutions, setInstitutions] = useState<InstitutionOption[]>([]);
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState('all');

  useEffect(() => {
    const loadInstitutions = async () => {
      const res = await fetch('/api/platform/institutions');
      const data = await res.json();
      if (data.success) {
        setInstitutions(data.institutions);
      }
    };

    const loadUsers = async () => {
      const res = await fetch(`/api/platform/users?institutionId=${selectedInstitutionId}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    };

    const load = async () => {
      setLoading(true);
      try {
        await Promise.all([loadInstitutions(), loadUsers()]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [selectedInstitutionId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Users</h1>
        <p className="text-gray-600">View all users and filter them by institution</p>
      </div>

      <Card className="p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by institution</label>
        <select
          className="w-full md:w-96 border rounded-md p-2"
          value={selectedInstitutionId}
          onChange={(e) => setSelectedInstitutionId(e.target.value)}
        >
          <option value="all">All institutions</option>
          {institutions.map((institution) => (
            <option key={institution._id} value={institution._id}>
              {institution.name} ({institution.domain})
            </option>
          ))}
        </select>
      </Card>

      <Card className="p-6">
        {loading ? (
          <p className="text-gray-600">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-gray-600">No users found for the selected institution.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Institution</th>
                  <th className="py-2 pr-4">Verified</th>
                  <th className="py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium text-gray-900">{user.name}</td>
                    <td className="py-3 pr-4 text-gray-700">{user.email}</td>
                    <td className="py-3 pr-4 text-gray-700">{user.role}</td>
                    <td className="py-3 pr-4 text-gray-700">
                      <div className="font-medium">{user.institutionName}</div>
                      <div className="text-xs text-gray-500">{user.institutionDomain || user.institutionId}</div>
                    </td>
                    <td className="py-3 pr-4 text-gray-700">{user.isVerified ? 'Yes' : 'No'}</td>
                    <td className="py-3 text-gray-700">{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
