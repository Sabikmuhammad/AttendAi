'use client';

import { Bell, Search, User, Menu } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  title: string;
  subtitle?: string;
  userRole?: 'admin' | 'faculty' | 'student';
  onMobileMenuToggle?: () => void;
}

export function Navbar({ title, subtitle, onMobileMenuToggle }: NavbarProps) {
  const pathname = usePathname();

  const getProfileHref = () => {
    if (pathname.startsWith('/admin') || pathname.startsWith('/institutionadmin')) {
      return '/admin/profile';
    }
    if (pathname.startsWith('/faculty')) {
      return '/faculty/profile';
    }
    if (pathname.startsWith('/student')) {
      return '/student/profile';
    }
    if (pathname.startsWith('/super-admin') || pathname.startsWith('/super_admin')) {
      return '/super-admin/profile';
    }
    return '/profile';
  };

  return (
    <header className="sticky top-0 z-30 h-14 sm:h-16 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden hover:bg-gray-100"
            onClick={onMobileMenuToggle}
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </Button>

          <div className="min-w-0">
            <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 truncate max-w-[52vw] sm:max-w-none">{title}</h1>
            {subtitle && <p className="hidden sm:block text-xs sm:text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" className="hidden sm:flex relative hover:bg-gray-100">
            <Search className="w-5 h-5 text-gray-600" />
          </Button>

          <Button variant="ghost" size="icon" className="relative hover:bg-gray-100">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-600 rounded-full ring-1 sm:ring-2 ring-white" />
          </Button>

          <div className="ml-1 sm:ml-2">
            <Link href={getProfileHref()}>
              <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-purple-600 flex items-center justify-center ring-2 ring-gray-200 hover:ring-gray-300 transition-all">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
