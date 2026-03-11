'use client';

import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  title: string;
  subtitle?: string;
  sidebarTitle: string;
}

export function DashboardLayout({
  children,
  navItems,
  title,
  subtitle,
  sidebarTitle,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <Sidebar navItems={navItems} title={sidebarTitle} />
      
      {/* Main Content Area */}
      <div className="pl-64">
        {/* Sticky Navbar */}
        <Navbar title={title} subtitle={subtitle} />
        
        {/* Page Content */}
        <main className="p-8">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
