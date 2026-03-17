'use client';

import Link from 'next/link';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DocsSearch } from '@/components/docs/DocsSearch';

export function DocsNavbar() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem('attendai-docs-theme');
    if (!stored) return;
    const shouldDark = stored === 'dark';
    document.documentElement.classList.toggle('dark', shouldDark);
    setDarkMode(shouldDark);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const next = !root.classList.contains('dark');
    root.classList.toggle('dark', next);
    setDarkMode(next);
    window.localStorage.setItem('attendai-docs-theme', next ? 'dark' : 'light');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/85">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/docs"
          className="shrink-0 text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 hover:opacity-75 transition"
        >
          AttendAI <span className="text-zinc-400 font-normal">Docs</span>
        </Link>

        {/* Divider */}
        <div className="hidden h-5 w-px bg-zinc-200 dark:bg-zinc-800 md:block" />

        {/* Top nav links */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {[
            { href: '/docs/platform', label: 'Platform' },
            { href: '/docs/security', label: 'Security' },
            { href: '/docs/faq', label: 'FAQ' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-md px-3 py-1.5 text-sm text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Search — grows to fill space */}
        <div className="flex-1 max-w-sm ml-auto mr-2">
          <DocsSearch />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <Link
            href="/"
            className="hidden rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 sm:inline-flex"
          >
            Open App
          </Link>
        </div>
      </div>
    </header>
  );
}
