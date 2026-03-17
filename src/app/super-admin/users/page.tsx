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
      </div>

      <Card className="p-6">
        <div className="mb-6 border-b pb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by institution</label>
          <select
            className="w-full border rounded-md p-2 bg-white mb-4 md:w-96"
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <Card
              className={`p-3 cursor-pointer transition-all hover:shadow-sm ${
                selectedInstitutionId === 'all'
                  ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-200'
                  : 'border-gray-200 bg-white hover:border-purple-300'
              }`}
              onClick={() => setSelectedInstitutionId('all')}
            >
              <div className="flex flex-col h-full justify-center text-center">
                <h3 className={`font-semibold text-sm ${selectedInstitutionId === 'all' ? 'text-purple-700' : 'text-gray-900'}`}>
                  All
                </h3>
              </div>
            </Card>
            
            {institutions.map((institution) => (
              <Card
                key={institution._id}
                className={`p-3 cursor-pointer transition-all hover:shadow-sm ${
                  selectedInstitutionId === institution._id
                    ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-200'
                    : 'border-gray-200 bg-white hover:border-purple-300'
                }`}
                onClick={() => setSelectedInstitutionId(institution._id)}
              >
                <div className="flex flex-col h-full justify-center text-center">
                  <h3 className={`font-semibold text-sm ${selectedInstitutionId === institution._id ? 'text-purple-700' : 'text-gray-900'} truncate`} title={institution.name}>
                    {institution.name}
                  </h3>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-gray-600">No users found for the selected institution.</p>
        ) : (
          <>
          <div className="hidden md:block overflow-x-auto">
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
                  <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
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
          <div className="space-y-3 md:hidden">
            {users.map((user) => (
              <div key={user.id} className="rounded-lg border border-gray-200 p-4">
                <p className="font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-sm text-gray-700 truncate">{user.email}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <span>Role: {user.role}</span>
                  <span>Verified: {user.isVerified ? 'Yes' : 'No'}</span>
                </div>
                <p className="mt-2 text-xs text-gray-500 truncate">{user.institutionName}</p>
                <p className="text-xs text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
          </>
        )}
      </Card>
    </div>
  );
}
