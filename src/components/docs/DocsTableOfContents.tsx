'use client';

import { useEffect, useMemo, useState } from 'react';

type TocItem = { id: string; text: string; level: 2 | 3 };

export function DocsTableOfContents() {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const headings = Array.from(
      document.querySelectorAll<HTMLElement>(
        'article[data-docs-article] h2, article[data-docs-article] h3'
      )
    );

    const nextItems: TocItem[] = headings
      .map((h) => {
        if (!h.id) return null;
        return { id: h.id, text: h.innerText, level: h.tagName === 'H2' ? 2 : 3 } as TocItem;
      })
      .filter((item): item is TocItem => Boolean(item));

    setItems(nextItems);
    if (!nextItems.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target?.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0, 1] }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, []);

  const hasItems = useMemo(() => items.length > 0, [items]);
  if (!hasItems) return null;

  return (
    <aside className="sticky top-14 hidden xl:block">
      <div className="max-h-[calc(100vh-4rem)] overflow-y-auto py-8 pl-4 pr-2">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
          On This Page
        </p>
        <nav className="space-y-0.5">
          {items.map((item) => {
            const isActive = item.id === activeId;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={[
                  'block border-l-2 py-1 pl-3 text-xs transition',
                  item.level === 3 ? 'ml-3' : '',
                  isActive
                    ? 'border-zinc-900 font-medium text-zinc-900 dark:border-zinc-100 dark:text-zinc-100'
                    : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:text-zinc-300',
                ].join(' ')}
              >
                {item.text}
              </a>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
