'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function ResendNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-lg sm:text-xl font-semibold text-white">AttendAI</span>
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/demo" className="text-sm text-gray-400 hover:text-white transition-colors">
              Demo
            </Link>
            <Link href="/docs" className="text-sm text-gray-400 hover:text-white transition-colors">
              Docs
            </Link>
            <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
              Pricing
            </Link>

          </div>

          {/* Desktop CTA - Right */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Log In
            </Link>
            <Link href="/pricing">
              <button className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                Get Started
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden min-h-10 min-w-10 flex items-center justify-center p-2 text-gray-400 hover:text-white transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 px-4 sm:px-6 border-t border-white/10 bg-black/80">
            <div className="flex flex-col gap-3">
              <Link href="/demo" className="min-h-10 flex items-center px-4 text-sm text-gray-400 hover:text-white transition-colors" onClick={() => setIsOpen(false)}>
                Demo
              </Link>
              <Link href="/docs" className="min-h-10 flex items-center px-4 text-sm text-gray-400 hover:text-white transition-colors" onClick={() => setIsOpen(false)}>
                Docs
              </Link>
              <Link href="/pricing" className="min-h-10 flex items-center px-4 text-sm text-gray-400 hover:text-white transition-colors" onClick={() => setIsOpen(false)}>
                Pricing
              </Link>

              <div className="flex flex-col gap-2 pt-3 border-t border-white/10">
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <button className="w-full min-h-10 px-4 py-2 border border-white/20 bg-white/5 text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-colors">
                    Log In
                  </button>
                </Link>
                <Link href="/sign-up" onClick={() => setIsOpen(false)}>
                  <button className="w-full min-h-10 px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                    Get Started
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
