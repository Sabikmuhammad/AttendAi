import { DashboardLayout } from '@/components/DashboardLayout';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { href: '/super-admin/institutions', icon: 'Building2', label: 'Institutions' },
    { href: '/super-admin/users', icon: 'Users', label: 'Users' },
    { href: '/super-admin/analytics', icon: 'BarChart3', label: 'Analytics' },
  ];

  return (
    <DashboardLayout
      navItems={navItems}
      title="Super Admin"
      subtitle="Global multi-institution management"
      sidebarTitle="Platform Console"
    >
      {children}
    </DashboardLayout>
  );
}
