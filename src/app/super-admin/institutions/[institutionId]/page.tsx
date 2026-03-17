'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Plan = 'trial' | 'starter' | 'growth' | 'enterprise';
type Status = 'active' | 'suspended' | 'trial';

interface InstitutionDetails {
  _id: string;
  name: string;
  code: string;
  contactEmail: string;
  status: Status;
  plan: Plan;
  trial?: { startDate: string; endDate: string; isActive: boolean };
  createdAt: string;
}

interface UsageStats { totalStudents: number; totalFaculty: number; totalCameras: number; totalClasses: number; }
interface Limits { students: number; faculty: number; cameras: number; classes: number; }

const PLANS: Plan[] = ['trial', 'starter', 'growth', 'enterprise'];

const statusColor: Record<Status, 'success' | 'warning' | 'destructive'> = {
  active: 'success', trial: 'warning', suspended: 'destructive',
};

function UsageBar({ label, used, max }: { label: string; used: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0;
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-purple-500';
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{label}</span>
        <span>{used} / {max}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-100">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
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
      if (data.success) { setInstitution(data.institution); setUsage(data.usage); setLimits(data.limits); }
      else setMessage(data.error || 'Failed to load');
    } finally { setLoading(false); }
  }, [params?.institutionId]);

  useEffect(() => { load(); }, [load]);

  const update = async (payload: Record<string, unknown>) => {
    if (!institution) return;
    setMessage('');
    const res = await fetch(`/api/super-admin/institutions/${institution._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) { setMessage(data.error || 'Update failed'); return; }
    setMessage('Updated successfully');
    await load();
  };

  if (loading) return <p className="text-gray-500 text-sm">Loading…</p>;
  if (!institution) return <p className="text-gray-500 text-sm">Institution not found.</p>;

  const loginUrl = `/login?institutionCode=${encodeURIComponent(institution.code)}`;

  const trialDaysLeft = institution.trial?.endDate
    ? Math.max(0, Math.ceil((new Date(institution.trial.endDate).getTime() - Date.now()) / 86400000))
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{institution.name}</h1>
          <a href={loginUrl}
            className="text-xs font-mono text-purple-600 hover:underline mt-0.5 inline-block">
            {loginUrl}
          </a>
        </div>
        <Button variant="outline" onClick={() => router.push('/super-admin/institutions')}>Back</Button>
      </div>

      {message && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">{message}</div>
      )}

      {/* Info */}
      <Card>
        <CardHeader><CardTitle>Institution Info</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-500">Code</span><p className="font-mono font-medium">{institution.code}</p></div>
          <div><span className="text-gray-500">Contact Email</span><p>{institution.contactEmail}</p></div>
          <div><span className="text-gray-500">Login URL</span><p className="font-mono text-xs break-all">{loginUrl}</p></div>
          <div><span className="text-gray-500">Created</span><p>{new Date(institution.createdAt).toLocaleDateString()}</p></div>
          <div>
            <span className="text-gray-500">Status</span>
            <div className="mt-1"><Badge variant={statusColor[institution.status]}>{institution.status}</Badge></div>
          </div>
          {institution.plan === 'trial' && institution.trial?.endDate && (
            <div>
              <span className="text-gray-500">Trial</span>
              <p className={`font-medium ${trialDaysLeft <= 3 ? 'text-red-600' : trialDaysLeft <= 7 ? 'text-amber-600' : 'text-green-600'}`}>
                {trialDaysLeft} days remaining
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status controls */}
      <Card>
        <CardHeader><CardTitle>Status Control</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => update({ status: 'active' })}>Set Active</Button>
          <Button size="sm" variant="secondary" onClick={() => update({ status: 'suspended' })}>Suspend</Button>
          <Button size="sm" variant="outline" onClick={() => update({ status: 'trial' })}>Set Trial</Button>
        </CardContent>
      </Card>

      {/* Plan */}
      <Card>
        <CardHeader><CardTitle>Subscription Plan</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge variant="outline">{institution.plan}</Badge>
            <select
              className="border rounded-md p-2 text-sm"
              value={institution.plan}
              onChange={(e) => update({ plan: e.target.value as Plan })}
            >
              {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          {limits && (
            <div className="space-y-3 pt-2">
              <UsageBar label="Students" used={usage?.totalStudents ?? 0} max={limits.students} />
              <UsageBar label="Faculty" used={usage?.totalFaculty ?? 0} max={limits.faculty} />
              <UsageBar label="Cameras" used={usage?.totalCameras ?? 0} max={limits.cameras} />
              <UsageBar label="Classes" used={usage?.totalClasses ?? 0} max={limits.classes} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage stats */}
      <Card>
        <CardHeader><CardTitle>Usage Statistics</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Students', value: usage?.totalStudents ?? 0 },
              { label: 'Faculty', value: usage?.totalFaculty ?? 0 },
              { label: 'Cameras', value: usage?.totalCameras ?? 0 },
              { label: 'Classes', value: usage?.totalClasses ?? 0 },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border p-4">
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
