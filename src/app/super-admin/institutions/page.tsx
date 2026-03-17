'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Plan = 'trial' | 'starter' | 'growth' | 'enterprise';
type Status = 'active' | 'suspended' | 'trial';

interface Institution {
  _id: string;
  name: string;
  code: string;
  plan: Plan;
  contactEmail: string;
  status: Status;
  createdAt: string;
}

const PLANS: Plan[] = ['trial', 'starter', 'growth', 'enterprise'];

const planColor: Record<Plan, string> = {
  trial:      'secondary',
  starter:    'outline',
  growth:     'info',
  enterprise: 'success',
} as Record<Plan, string>;

const statusColor: Record<Status, 'success' | 'warning' | 'destructive'> = {
  active:    'success',
  trial:     'warning',
  suspended: 'destructive',
};

function institutionLoginUrl(code: string) {
  return `/login?institutionCode=${encodeURIComponent(code)}`;
}

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);
  const [editForm, setEditForm] = useState({ name: '', code: '', contactEmail: '', plan: 'starter' as Plan });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    const res = await fetch('/api/super-admin/institutions');
    const data = await res.json();
    if (data.success) setInstitutions(data.institutions);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const toggleStatus = async (inst: Institution) => {
    const next = inst.status === 'suspended' ? 'active' : 'suspended';
    const res = await fetch(`/api/super-admin/institutions/${inst._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    const data = await res.json();
    setMessage(res.ok ? `Institution ${next}` : data.error || 'Failed');
    if (res.ok) await load();
  };

  const openEdit = (inst: Institution) => {
    setEditingInstitution(inst);
    setEditForm({ name: inst.name, code: inst.code, contactEmail: inst.contactEmail, plan: inst.plan });
  };

  const submitEdit = async () => {
    if (!editingInstitution) return;
    const res = await fetch(`/api/super-admin/institutions/${editingInstitution._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    const data = await res.json();
    setMessage(res.ok ? 'Institution updated' : data.error || 'Failed');
    if (res.ok) { setEditingInstitution(null); await load(); }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    const res = await fetch(`/api/super-admin/institutions/${deletingId}`, { method: 'DELETE' });
    const data = await res.json();
    setMessage(res.ok ? 'Institution deleted' : data.error || 'Failed');
    if (res.ok) { setDeletingId(null); await load(); }
  };

  const filtered = institutions.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Institutions</h1>
          <p className="text-gray-500 text-sm">Manage all tenant institutions</p>
        </div>
        <Button asChild>
          <Link href="/super-admin/institutions/create">+ Create Institution</Link>
        </Button>
      </div>

      {message && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          {message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Institution List</CardTitle>
          <Input
            placeholder="Search by name or code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500 text-sm">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-gray-500 text-sm">No institutions found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institution</TableHead>
                  <TableHead>Login</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((inst) => (
                  <TableRow key={inst._id}>
                    <TableCell>
                      <div className="font-medium text-gray-900">{inst.name}</div>
                      <div className="text-xs text-gray-400">{inst.code}</div>
                    </TableCell>
                    <TableCell>
                      <a
                        href={institutionLoginUrl(inst.code)}
                        className="text-xs text-purple-600 hover:underline font-mono"
                      >
                        /login?institutionCode={inst.code}
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge variant={planColor[inst.plan] as never}>{inst.plan}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColor[inst.status]}>{inst.status}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-500 text-xs">
                      {new Date(inst.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/super-admin/institutions/${inst._id}`}>View</Link>
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openEdit(inst)}>Edit</Button>
                        <Button
                          size="sm"
                          variant={inst.status === 'suspended' ? 'default' : 'secondary'}
                          onClick={() => toggleStatus(inst)}
                        >
                          {inst.status === 'suspended' ? 'Activate' : 'Suspend'}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => setDeletingId(inst._id)}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={!!editingInstitution} onOpenChange={(o) => !o && setEditingInstitution(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Institution</DialogTitle>
            <DialogDescription>Update institution details and plan.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} placeholder="Name" />
            <Input value={editForm.code} onChange={(e) => setEditForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="Code" />
            <Input value={editForm.contactEmail} onChange={(e) => setEditForm((p) => ({ ...p, contactEmail: e.target.value }))} placeholder="Contact Email" />
            <select
              className="w-full border rounded-md p-2 text-sm"
              value={editForm.plan}
              onChange={(e) => setEditForm((p) => ({ ...p, plan: e.target.value as Plan }))}
            >
              {PLANS.map((pl) => <option key={pl} value={pl}>{pl}</option>)}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingInstitution(null)}>Cancel</Button>
            <Button onClick={submitEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Institution</DialogTitle>
            <DialogDescription>This cannot be undone. Only institutions without users can be deleted.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
