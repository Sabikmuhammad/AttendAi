import { DashboardLayout } from '@/components/DashboardLayout';

/**
 * Admin Layout - Authentication disabled
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mock user data (authentication disabled)
  const user = { name: 'Admin User', role: 'admin' };

  // Define navigation items for admin
  const navItems = [
    { href: '/admin/dashboard', icon: 'LayoutDashboard', label: 'Dashboard' },
    { href: '/admin/students', icon: 'Users', label: 'Students' },
    { href: '/admin/faculty', icon: 'GraduationCap', label: 'Faculty' },
    { href: '/admin/classes', icon: 'BookOpen', label: 'Classes' },
    { href: '/admin/create-class', icon: 'Plus', label: 'Create Class' },
    { href: '/admin/live-monitor', icon: 'Camera', label: 'Live Monitor' },
    { href: '/admin/reports', icon: 'FileText', label: 'Reports' },
    { href: '/admin/analytics', icon: 'BarChart3', label: 'Analytics' },
    { href: '/admin/profile', icon: 'User', label: 'Profile' },
    { href: '/admin/settings', icon: 'Settings', label: 'Settings' },
  ];

  return (
    <DashboardLayout
      navItems={navItems}
      title="Admin Dashboard"
      subtitle="Manage your attendance system"
      sidebarTitle="Admin Panel"
    >
      {children}
    </DashboardLayout>
  );
}

