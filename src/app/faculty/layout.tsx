import { DashboardLayout } from '@/components/DashboardLayout';
import { ClassActivationService } from '@/components/ClassActivationService';

/**
 * Faculty Layout - Authentication disabled
 */
export default function FacultyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mock user data (authentication disabled)
  const user = { name: 'Faculty User', role: 'faculty' };

  const navItems = [
    { href: '/faculty/dashboard', icon: 'LayoutDashboard', label: 'Dashboard' },
    { href: '/faculty/create-class', icon: 'Plus', label: 'Create Class' },
    { href: '/faculty/live-class', icon: 'Camera', label: 'Live Class' },
    { href: '/faculty/attendance', icon: 'FileText', label: 'Attendance' },
    { href: '/faculty/profile', icon: 'User', label: 'Profile' },
    { href: '/faculty/settings', icon: 'Settings', label: 'Settings' },
  ];

  return (
    <DashboardLayout
      navItems={navItems}
      title="Faculty Dashboard"
      subtitle={`Welcome, ${user.name.split(' ')[0] || 'Faculty'}`}
      sidebarTitle="Faculty Portal"
    >
      <ClassActivationService />
      {children}
    </DashboardLayout>
  );
}
