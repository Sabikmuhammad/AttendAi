'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Plan = 'trial' | 'starter' | 'growth' | 'enterprise';

export default function CreateInstitutionPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<{
    code: string;
    credentials: { email: string; temporaryPassword: string } | null;
  } | null>(null);

  const [form, setForm] = useState({
    name: '', code: '', adminEmail: '', contactEmail: '', plan: 'trial' as Plan,
  });

  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/super-admin/institutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create institution'); return; }
      setCreated({ code: data.institution.code, credentials: data.adminCredentials });
    } catch {
      setError('Failed to create institution');
    } finally {
      setSubmitting(false);
    }
  };

  const loginUrl = created
    ? `/login?institutionCode=${encodeURIComponent(created.code)}`
    : '';

  if (created) {
    return (
      <div className="space-y-6 max-w-lg">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Institution Created</h1>
          <p className="text-gray-500 text-sm">The institution is ready with a 14-day free trial.</p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Institution Login URL</p>
              <a
                href={loginUrl}
                className="text-sm font-mono text-purple-600 hover:underline break-all"
              >
                {loginUrl}
              </a>
            </div>

            {created.credentials && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
                <p className="font-semibold text-amber-800 mb-2">Admin Credentials (share securely)</p>
                <p className="text-amber-700">Email: <span className="font-mono">{created.credentials.email}</span></p>
                <p className="text-amber-700">Password: <span className="font-mono">{created.credentials.temporaryPassword}</span></p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button onClick={() => router.push('/super-admin/institutions')}>Back to Institutions</Button>
              <Button variant="outline" onClick={() => { setCreated(null); setForm({ name: '', code: '', adminEmail: '', contactEmail: '', plan: 'trial' }); }}>
                Create Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Institution</h1>
          <p className="text-gray-500 text-sm">Provision a new tenant institution</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/super-admin/institutions')}>
          Back
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}

      <Card>
        <CardHeader><CardTitle>Institution Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Institution Name" value={form.name} onChange={(e) => set('name', e.target.value)} required />
            <Input placeholder="Institution Code (e.g. SAHYADRI)" value={form.code} onChange={(e) => set('code', e.target.value.toUpperCase())} required />
            <Input placeholder="Contact Email" type="email" value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} required />
            <Input placeholder="Admin Email" type="email" value={form.adminEmail} onChange={(e) => set('adminEmail', e.target.value)} required />
            <select
              className="w-full border rounded-md p-2 text-sm"
              value={form.plan}
              onChange={(e) => set('plan', e.target.value as Plan)}
            >
              <option value="trial">Trial (14 days free)</option>
              <option value="starter">Starter — $79/mo</option>
              <option value="growth">Growth — $249/mo</option>
              <option value="enterprise">Enterprise — Custom</option>
            </select>
            <div className="md:col-span-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating…' : 'Create Institution'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
