import { DashboardLayout } from '@/components/DashboardLayout';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { href: '/super-admin', icon: 'LayoutDashboard', label: 'Dashboard' },
    { href: '/super-admin/institutions', icon: 'Building2', label: 'Institutions' },
    { href: '/super-admin/users', icon: 'Users', label: 'Users' },
    { href: '/super-admin/analytics', icon: 'BarChart3', label: 'Analytics' },
  ];

  return (
    <DashboardLayout
      navItems={navItems}
      title="Platform Console"
      subtitle="Super admin — all institutions"
      sidebarTitle="AttendAI Platform"
    >
      {children}
    </DashboardLayout>
  );
}
