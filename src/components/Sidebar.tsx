'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Camera, 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  Shield,
  BookOpen,
  Plus,
  User,
  GraduationCap,
  LucideIcon 
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface SidebarProps {
  navItems: NavItem[];
  title: string;
}

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Camera,
  Users,
  FileText,
  BarChart3,
  BookOpen,
  Plus,
  Settings,
  Shield,
  User,
  GraduationCap,
};

export function Sidebar({ navItems, title }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-40">
      {/* Logo & Title */}
      <div className="h-16 px-6 flex items-center border-b border-gray-200">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <div>
            <span className="text-lg font-semibold text-gray-900 block leading-none">AttendAI</span>
            <span className="text-xs text-gray-500 mt-0.5 block">{title}</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon] || LayoutDashboard;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-purple-50 text-purple-600 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                  isActive ? '' : 'group-hover:scale-110'
                }`} />
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
