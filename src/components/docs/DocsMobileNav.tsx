'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DOCS_NAV_ITEMS } from '@/components/docs/docs-nav';

export function DocsMobileNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-zinc-200/80 bg-white/90 px-4 py-2.5 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80 lg:hidden">
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
        {DOCS_NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== '/docs' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                'whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition',
                active
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                  : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100',
              ].join(' ')}
            >
              {item.title}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
