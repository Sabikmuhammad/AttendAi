'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface InstitutionDetails {
  _id: string;
  name: string;
  subdomain: string;
  code: string;
  contactEmail: string;
  status: 'active' | 'suspended' | 'trial';
  plan: 'starter' | 'professional' | 'enterprise';
  createdAt: string;
}

interface UsageStats {
  totalStudents: number;
  totalFaculty: number;
  totalCameras: number;
  totalClasses: number;
}

interface Limits {
  students: number;
  faculty: number;
  cameras: number;
  classes: number;
}

export default function InstitutionDetailsPage() {
  const params = useParams<{ institutionId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [institution, setInstitution] = useState<InstitutionDetails | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [limits, setLimits] = useState<Limits | null>(null);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    if (!params?.institutionId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/super-admin/institutions/${params.institutionId}`);
      const data = await res.json();
      if (data.success) {
        setInstitution(data.institution);
        setUsage(data.usage);
        setLimits(data.limits);
      } else {
        setMessage(data.error || 'Failed to load institution');
      }
    } finally {
      setLoading(false);
    }
  }, [params?.institutionId]);

  useEffect(() => {
    load();
  }, [load]);

  const updateInstitution = async (payload: Partial<InstitutionDetails>) => {
    if (!institution) return;
    setMessage('');
    const res = await fetch(`/api/super-admin/institutions/${institution._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || 'Update failed');
      return;
    }
    setInstitution(data.institution);
    setMessage('Institution updated');
    await load();
  };

  if (loading) {
    return <p className="text-gray-600">Loading institution details...</p>;
  }

  if (!institution) {
    return <p className="text-gray-600">Institution not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{institution.name}</h1>
          <p className="text-gray-600">Institution details, subscription and usage statistics</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/super-admin/institutions')}>
          Back
        </Button>
      </div>

      {message ? <p className="text-sm text-gray-700">{message}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Institution Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="font-medium">Name:</span> {institution.name}</p>
          <p><span className="font-medium">Subdomain:</span> {institution.subdomain}</p>
          <p><span className="font-medium">Code:</span> {institution.code}</p>
          <p><span className="font-medium">Contact Email:</span> {institution.contactEmail}</p>
          <div className="flex gap-2 items-center">
            <span className="font-medium">Status:</span>
            <Badge variant={institution.status === 'active' ? 'success' : institution.status === 'trial' ? 'warning' : 'destructive'}>
              {institution.status}
            </Badge>
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline" onClick={() => updateInstitution({ status: 'active' })}>
              Activate
            </Button>
            <Button size="sm" variant="secondary" onClick={() => updateInstitution({ status: 'suspended' })}>
              Suspend
            </Button>
            <Button size="sm" variant="outline" onClick={() => updateInstitution({ status: 'trial' })}>
              Set Trial
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge variant="info">{institution.plan}</Badge>
            <select
              className="border rounded-md p-2"
              value={institution.plan}
              onChange={(e) =>
                updateInstitution({
                  plan: e.target.value as 'starter' | 'professional' | 'enterprise',
                })
              }
            >
              <option value="starter">starter</option>
              <option value="professional">professional</option>
              <option value="enterprise">enterprise</option>
            </select>
          </div>
          {limits ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="p-3 rounded-md border">Students limit: {limits.students}</div>
              <div className="p-3 rounded-md border">Faculty limit: {limits.faculty}</div>
              <div className="p-3 rounded-md border">Cameras limit: {limits.cameras}</div>
              <div className="p-3 rounded-md border">Classes limit: {limits.classes}</div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border">
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold">{usage?.totalStudents ?? 0}</p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-sm text-gray-600">Total Faculty</p>
              <p className="text-2xl font-bold">{usage?.totalFaculty ?? 0}</p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-sm text-gray-600">Total Cameras</p>
              <p className="text-2xl font-bold">{usage?.totalCameras ?? 0}</p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-sm text-gray-600">Total Classes</p>
              <p className="text-2xl font-bold">{usage?.totalClasses ?? 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
