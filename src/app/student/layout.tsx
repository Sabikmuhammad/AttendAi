import { DashboardLayout } from '@/components/DashboardLayout';

/**
 * Student Layout - Authentication disabled
 */
export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mock user data (authentication disabled)
  const user = { name: 'Student User', role: 'student' };

  const navItems = [
    { href: '/student/dashboard', icon: 'LayoutDashboard', label: 'Dashboard' },
    { href: '/student/classes', icon: 'BookOpen', label: 'My Classes' },
    { href: '/student/attendance', icon: 'ClipboardCheck', label: 'Attendance' },
    { href: '/student/profile', icon: 'User', label: 'Profile' },
  ];

  return (
    <DashboardLayout
      navItems={navItems}
      title="Student Portal"
      subtitle={`Welcome, ${user.name.split(' ')[0] || 'Student'}`}
      sidebarTitle="Student Portal"
    >
      {children}
    </DashboardLayout>
  );
}
