import { DashboardLayout } from '@/components/DashboardLayout';

export default function InstitutionAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { href: '/institutionadmin/students', icon: 'Users', label: 'Students' },
    { href: '/institutionadmin/faculty', icon: 'GraduationCap', label: 'Faculty' },
    { href: '/institutionadmin/departments', icon: 'Building2', label: 'Departments' },
    { href: '/institutionadmin/classes', icon: 'BookOpen', label: 'Classes' },
    { href: '/institutionadmin/cameras', icon: 'Camera', label: 'Cameras' },
  ];

  return (
    <DashboardLayout
      navItems={navItems}
      title="Institution Admin"
      subtitle="Tenant-scoped operations"
      sidebarTitle="Institution Console"
    >
      {children}
    </DashboardLayout>
  );
}
