'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DOCS_NAV_ITEMS } from '@/components/docs/docs-nav';

interface DocsArticleProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function DocsArticle({ title, subtitle, children }: DocsArticleProps) {
  const pathname = usePathname();

  const currentIndex = DOCS_NAV_ITEMS.findIndex(
    (item) => item.href === pathname || (item.href !== '/docs' && pathname.startsWith(item.href))
  );
  const prev = currentIndex > 0 ? DOCS_NAV_ITEMS[currentIndex - 1] : null;
  const next = currentIndex < DOCS_NAV_ITEMS.length - 1 ? DOCS_NAV_ITEMS[currentIndex + 1] : null;

  // Slug for GitHub edit link
  const slug = pathname === '/docs' ? 'introduction' : pathname.replace('/docs/', '');

  useEffect(() => {
    const article = document.querySelector('article[data-docs-article]');
    if (!article) return;

    const blocks = Array.from(article.querySelectorAll('pre'));
    const cleanups: Array<() => void> = [];

    blocks.forEach((pre) => {
      if (pre.dataset.copyReady === 'true') return;
      pre.dataset.copyReady = 'true';
      pre.classList.add('group', 'relative', 'overflow-x-auto');

      const button = document.createElement('button');
      button.type = 'button';
      button.className =
        'absolute right-3 top-3 rounded-md border border-zinc-700 bg-zinc-900/95 px-2 py-1 text-xs font-medium text-zinc-100 transition hover:bg-zinc-800 dark:border-zinc-600';
      button.textContent = 'Copy';

      const onClick = async () => {
        const code = pre.querySelector('code')?.textContent ?? pre.textContent ?? '';
        try {
          await navigator.clipboard.writeText(code);
          button.textContent = 'Copied';
          window.setTimeout(() => { button.textContent = 'Copy'; }, 1200);
        } catch {
          button.textContent = 'Failed';
          window.setTimeout(() => { button.textContent = 'Copy'; }, 1200);
        }
      };

      button.addEventListener('click', onClick);
      pre.appendChild(button);
      cleanups.push(() => {
        button.removeEventListener('click', onClick);
        button.remove();
        delete pre.dataset.copyReady;
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <article data-docs-article className="scroll-smooth">
      {/* Page header */}
      <header className="mb-10 border-b border-zinc-200 pb-8 dark:border-zinc-800">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          AttendAI Docs
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-500 dark:text-zinc-400 sm:text-lg">
          {subtitle}
        </p>
      </header>

      {/* Content */}
      <div className="prose prose-zinc max-w-none dark:prose-invert prose-headings:scroll-mt-28 prose-h2:mt-12 prose-h2:text-2xl prose-h2:font-semibold prose-h3:mt-6 prose-h3:text-lg prose-h3:font-medium prose-p:leading-relaxed prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-li:leading-relaxed prose-li:text-zinc-600 dark:prose-li:text-zinc-400 prose-pre:rounded-xl prose-pre:border prose-pre:border-zinc-800 prose-pre:bg-zinc-950 prose-pre:text-zinc-100 prose-code:rounded prose-code:bg-zinc-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-zinc-800 prose-code:before:content-none prose-code:after:content-none dark:prose-code:bg-zinc-800 dark:prose-code:text-zinc-200">
        <div className="space-y-10">{children}</div>
      </div>

      {/* Divider */}
      <hr className="my-12 border-zinc-200 dark:border-zinc-800" />

      {/* Prev / Next navigation */}
      <nav className="flex items-center justify-between text-sm">
        {prev ? (
          <Link
            href={prev.href}
            className="group flex items-center gap-2 text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <ChevronLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Previous</p>
              <p className="font-medium">{prev.title}</p>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {next ? (
          <Link
            href={next.href}
            className="group flex items-center gap-2 text-right text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Next</p>
              <p className="font-medium">{next.title}</p>
            </div>
            <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        ) : (
          <div />
        )}
      </nav>

      {/* Edit on GitHub */}
      <div className="mt-8 flex justify-center">
        <a
          href={`https://github.com/Sabikmuhammad/AttendAi/edit/main/content/docs/${slug}.mdx`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-zinc-400 transition hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400"
        >
          Edit this page on GitHub →
        </a>
      </div>
    </article>
  );
}
