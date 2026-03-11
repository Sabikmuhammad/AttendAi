'use client';

import { Bell, Search, User } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';

interface NavbarProps {
  title: string;
  subtitle?: string;
  userRole?: 'admin' | 'faculty' | 'student';
}

export function Navbar({ title, subtitle }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="h-full px-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative hover:bg-gray-100">
            <Search className="w-5 h-5 text-gray-600" />
          </Button>

          <Button variant="ghost" size="icon" className="relative hover:bg-gray-100">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-purple-600 rounded-full ring-2 ring-white" />
          </Button>

          <div className="ml-2">
            <Link href="/profile">
              <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center ring-2 ring-gray-200 hover:ring-gray-300 transition-all">
                  <User className="w-5 h-5 text-white" />
                </div>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
