import { connectDB } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ACCESS_COOKIE_NAME } from '@/lib/auth-cookies';
import { verifyAccessToken } from '@/lib/jwt';
import Institution from '@/models/Institution';
import User from '@/models/User';
import Student from '@/models/Student';

export const dynamic = 'force-dynamic';

export default async function SuperAdminDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  if (!token) redirect('/login');

  try {
    const payload = await verifyAccessToken(token);
    if (payload.role !== 'super_admin') redirect('/unauthorized');
  } catch {
    redirect('/login');
  }

  await connectDB();

  const [totalInstitutions, activeInstitutions, trialInstitutions, suspendedInstitutions, totalUsers, totalStudents] =
    await Promise.all([
      Institution.countDocuments({}),
      Institution.countDocuments({ status: 'active' }),
      Institution.countDocuments({ status: 'trial' }),
      Institution.countDocuments({ status: 'suspended' }),
      User.countDocuments({}),
      Student.countDocuments({}),
    ]);

  const planBreakdown = await Institution.aggregate([
    { $group: { _id: '$plan', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  const recentInstitutions = await Institution.find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .select('name code plan status createdAt')
    .lean<{ _id: { toString(): string }; name: string; code: string; plan: string; status: string; createdAt: Date }[]>();

  const stats = [
    { label: 'Total Institutions', value: totalInstitutions, color: 'bg-purple-500/10 text-purple-700' },
    { label: 'Active', value: activeInstitutions, color: 'bg-green-500/10 text-green-700' },
    { label: 'On Trial', value: trialInstitutions, color: 'bg-amber-500/10 text-amber-700' },
    { label: 'Suspended', value: suspendedInstitutions, color: 'bg-red-500/10 text-red-700' },
    { label: 'Total Users', value: totalUsers, color: 'bg-blue-500/10 text-blue-700' },
    { label: 'Total Students', value: totalStudents, color: 'bg-indigo-500/10 text-indigo-700' },
  ];

  const statusColor: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    trial: 'bg-amber-100 text-amber-700',
    suspended: 'bg-red-100 text-red-700',
  };

  const planColor: Record<string, string> = {
    trial: 'bg-gray-100 text-gray-600',
    starter: 'bg-blue-100 text-blue-700',
    growth: 'bg-purple-100 text-purple-700',
    enterprise: 'bg-indigo-100 text-indigo-700',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
        <p className="text-gray-500 text-sm">Real-time stats across all institutions</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold rounded-lg px-2 py-0.5 inline-block ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Plan breakdown */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Plan Breakdown</h2>
        <div className="flex flex-wrap gap-3">
          {planBreakdown.map((p) => (
            <div key={p._id} className={`rounded-full px-3 py-1 text-sm font-medium ${planColor[p._id] || 'bg-gray-100 text-gray-600'}`}>
              {p._id}: {p.count}
            </div>
          ))}
        </div>
      </div>

      {/* Recent institutions */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Recent Institutions</h2>
          <a href="/super-admin/institutions" className="text-xs text-purple-600 hover:underline">View all →</a>
        </div>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Institution</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Code</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Plan</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Status</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recentInstitutions.map((inst) => (
              <tr key={inst._id.toString()} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-900">{inst.name}</td>
                <td className="px-5 py-3 text-gray-500 font-mono text-xs">{inst.code}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${planColor[inst.plan] || 'bg-gray-100 text-gray-600'}`}>
                    {inst.plan}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[inst.status] || 'bg-gray-100 text-gray-600'}`}>
                    {inst.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-500">{new Date(inst.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
