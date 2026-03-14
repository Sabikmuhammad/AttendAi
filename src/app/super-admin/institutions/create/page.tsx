'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function CreateInstitutionPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [credentials, setCredentials] = useState<{ email: string; temporaryPassword: string } | null>(
    null
  );

  const [form, setForm] = useState({
    name: '',
    subdomain: '',
    code: '',
    adminEmail: '',
    contactEmail: '',
    plan: 'starter',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setCredentials(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/super-admin/institutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || 'Failed to create institution');
        return;
      }

      setMessage('Institution created successfully');
      if (data.adminCredentials) {
        setCredentials(data.adminCredentials);
      }
    } catch {
      setMessage('Failed to create institution');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Institution</h1>
          <p className="text-gray-600">Provision a new institution tenant and admin access</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/super-admin/institutions')}>
          Back to Institutions
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Institution Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Institution Name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
            <Input
              placeholder="Subdomain (e.g. acme-college)"
              value={form.subdomain}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, subdomain: e.target.value.toLowerCase() }))
              }
              required
            />
            <Input
              placeholder="Institution Code (e.g. ACME)"
              value={form.code}
              onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
              required
            />
            <Input
              placeholder="Institution Admin Email"
              type="email"
              value={form.adminEmail}
              onChange={(e) => setForm((prev) => ({ ...prev, adminEmail: e.target.value }))}
              required
            />
            <Input
              placeholder="Contact Email"
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
              required
            />
            <select
              className="w-full border rounded-md p-2"
              value={form.plan}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  plan: e.target.value as 'starter' | 'professional' | 'enterprise',
                }))
              }
            >
              <option value="starter">starter</option>
              <option value="professional">professional</option>
              <option value="enterprise">enterprise</option>
            </select>
            <div className="md:col-span-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Institution'}
              </Button>
            </div>
          </form>

          {message ? <p className="mt-4 text-sm text-gray-700">{message}</p> : null}
          {credentials ? (
            <div className="mt-4 p-4 rounded-md border bg-gray-50 text-sm">
              <p className="font-semibold text-gray-900 mb-2">Institution Admin Login Access</p>
              <p>Email: {credentials.email}</p>
              <p>Temporary Password: {credentials.temporaryPassword}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
