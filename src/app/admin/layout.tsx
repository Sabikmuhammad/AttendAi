import { DashboardLayout } from '@/components/DashboardLayout';
import { TrialBanner } from '@/components/TrialBanner';

/**
 * Admin Layout - Authentication disabled
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mock user data (authentication disabled)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const user = { name: 'Admin User', role: 'admin' };

  // Define navigation items for admin
  const navItems = [
    { href: '/admin/dashboard', icon: 'LayoutDashboard', label: 'Dashboard' },
    { href: '/admin/students', icon: 'Users', label: 'Students' },
    { href: '/admin/sections', icon: 'Layers', label: 'Sections' },
    { href: '/admin/faculty', icon: 'GraduationCap', label: 'Faculty' },
    { href: '/admin/departments', icon: 'Building2', label: 'Departments' },
    { href: '/admin/classes', icon: 'BookOpen', label: 'Classes' },
    { href: '/admin/classrooms', icon: 'Building2', label: 'Classrooms' },
    { href: '/admin/create-class', icon: 'Plus', label: 'Create Class' },
    { href: '/admin/create-classroom', icon: 'PlusCircle', label: 'Create Classroom' },
    { href: '/admin/camera', icon: 'Camera', label: 'Camera Control' },
    { href: '/admin/live-feed', icon: 'Video', label: 'Live Feed' },
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
      <TrialBanner />
      {children}
    </DashboardLayout>
  );
}

