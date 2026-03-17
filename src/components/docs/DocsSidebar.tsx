'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { title: 'Introduction', href: '/docs' },
      { title: 'Getting Started', href: '/docs/getting-started' },
      { title: 'Platform Overview', href: '/docs/platform' },
    ],
  },
  {
    label: 'Guides',
    items: [
      { title: 'Admin Guide', href: '/docs/admin' },
      { title: 'Faculty Guide', href: '/docs/faculty' },
      { title: 'Student Guide', href: '/docs/student' },
    ],
  },
  {
    label: 'Technical',
    items: [
      { title: 'AI Attendance System', href: '/docs/ai-attendance' },
      { title: 'Camera Setup', href: '/docs/camera-setup' },
      { title: 'Security & Privacy', href: '/docs/security' },
    ],
  },
  {
    label: 'Support',
    items: [{ title: 'FAQ', href: '/docs/faq' }],
  },
];

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] overflow-y-auto border-r border-zinc-200/80 bg-white/75 px-3 py-8 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/60 lg:block">
      <nav className="space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/docs' && pathname.startsWith(item.href));

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={[
                        'block rounded-md px-3 py-1.5 text-sm transition',
                        isActive
                          ? 'bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                          : 'text-zinc-600 hover:bg-zinc-100/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200',
                      ].join(' ')}
                    >
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
