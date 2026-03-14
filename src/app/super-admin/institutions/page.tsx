'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Institution {
  _id: string;
  name: string;
  subdomain: string;
  code: string;
  plan: 'starter' | 'professional' | 'enterprise';
  contactEmail: string;
  status: 'active' | 'suspended' | 'trial';
  createdAt: string;
}

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>('');
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    subdomain: '',
    code: '',
    contactEmail: '',
    plan: 'starter',
  });
  const [deletingInstitutionId, setDeletingInstitutionId] = useState<string | null>(null);

  const loadInstitutions = async () => {
    const res = await fetch('/api/super-admin/institutions');
    const data = await res.json();
    if (data.success) {
      setInstitutions(data.institutions);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        await loadInstitutions();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleStatusToggle = async (institution: Institution) => {
    setMessage('');
    const nextStatus = institution.status === 'suspended' ? 'active' : 'suspended';

    try {
      const res = await fetch(`/api/super-admin/institutions/${institution._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Failed to update status');
        return;
      }

      setMessage(`Institution ${nextStatus === 'suspended' ? 'suspended' : 'activated'} successfully`);
      await loadInstitutions();
    } catch {
      setMessage('Failed to update institution status');
    }
  };

  const openEdit = (institution: Institution) => {
    setEditingInstitution(institution);
    setEditForm({
      name: institution.name,
      subdomain: institution.subdomain,
      code: institution.code,
      contactEmail: institution.contactEmail,
      plan: institution.plan,
    });
  };

  const submitEdit = async () => {
    if (!editingInstitution) return;
    setMessage('');

    try {
      const res = await fetch(`/api/super-admin/institutions/${editingInstitution._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Failed to update institution');
        return;
      }

      setEditingInstitution(null);
      setMessage('Institution updated successfully');
      await loadInstitutions();
    } catch {
      setMessage('Failed to update institution');
    }
  };

  const handleDelete = async () => {
    if (!deletingInstitutionId) return;
    setMessage('');
    try {
      const res = await fetch(`/api/super-admin/institutions/${deletingInstitutionId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Failed to delete institution');
        return;
      }
      setDeletingInstitutionId(null);
      setMessage('Institution deleted');
      await loadInstitutions();
    } catch {
      setMessage('Failed to delete institution');
    }
  };

  const statusVariant = (status: Institution['status']) => {
    if (status === 'active') return 'success' as const;
    if (status === 'trial') return 'warning' as const;
    return 'destructive' as const;
  };

  const planVariant = (plan: Institution['plan']) => {
    if (plan === 'enterprise') return 'info' as const;
    if (plan === 'professional') return 'secondary' as const;
    return 'outline' as const;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
        <h1 className="text-2xl font-bold text-gray-900">Institutions</h1>
          <p className="text-gray-600">Create, manage, suspend and monitor tenant institutions</p>
        </div>
        <Button asChild>
          <Link href="/super-admin/institutions/create">Create Institution</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Institution List</CardTitle>
          {message ? <p className="text-sm text-gray-600">{message}</p> : null}
        </CardHeader>
        <CardContent>
        {loading ? (
          <p className="text-gray-600">Loading institutions...</p>
        ) : institutions.length === 0 ? (
          <p className="text-gray-600">No institutions found.</p>
        ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institution Name</TableHead>
                  <TableHead>Subdomain</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
            {institutions.map((institution) => (
                  <TableRow key={institution._id}>
                    <TableCell>
                      <div className="font-medium text-gray-900">{institution.name}</div>
                      <div className="text-xs text-gray-500">{institution.code}</div>
                    </TableCell>
                    <TableCell>{institution.subdomain}</TableCell>
                    <TableCell>
                      <Badge variant={planVariant(institution.plan)}>{institution.plan}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(institution.status)}>{institution.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(institution.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/super-admin/institutions/${institution._id}`}>View</Link>
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openEdit(institution)}>
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant={institution.status === 'suspended' ? 'default' : 'secondary'}
                          onClick={() => handleStatusToggle(institution)}
                        >
                          {institution.status === 'suspended' ? 'Activate' : 'Suspend'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeletingInstitutionId(institution._id)}
                        >
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

      <Dialog open={!!editingInstitution} onOpenChange={(open) => !open && setEditingInstitution(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Institution</DialogTitle>
            <DialogDescription>Update institution information and subscription plan.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              value={editForm.name}
              onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Institution Name"
            />
            <Input
              value={editForm.subdomain}
              onChange={(e) => setEditForm((prev) => ({ ...prev, subdomain: e.target.value }))}
              placeholder="Subdomain"
            />
            <Input
              value={editForm.code}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
              }
              placeholder="Institution Code"
            />
            <Input
              value={editForm.contactEmail}
              onChange={(e) => setEditForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
              placeholder="Contact Email"
            />
            <select
              className="w-full border rounded-md p-2"
              value={editForm.plan}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  plan: e.target.value as 'starter' | 'professional' | 'enterprise',
                }))
              }
            >
              <option value="starter">starter</option>
              <option value="professional">professional</option>
              <option value="enterprise">enterprise</option>
            </select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingInstitution(null)}>
              Cancel
            </Button>
            <Button onClick={submitEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingInstitutionId} onOpenChange={(open) => !open && setDeletingInstitutionId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Institution</DialogTitle>
            <DialogDescription>
              This action cannot be undone. You can only delete institutions without users.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingInstitutionId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
