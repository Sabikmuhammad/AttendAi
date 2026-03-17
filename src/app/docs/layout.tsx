import { DocsNavbar } from '@/components/docs/DocsNavbar';
import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { DocsMobileNav } from '@/components/docs/DocsMobileNav';
import { DocsTableOfContents } from '@/components/docs/DocsTableOfContents';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <DocsNavbar />
      <DocsMobileNav />

      <div className="mx-auto flex w-full max-w-[1400px]">
        {/* Left sidebar */}
        <DocsSidebar />

        {/* Main content — max-w-3xl for readability */}
        <main className="min-w-0 flex-1 px-6 py-10 sm:px-10 lg:px-12 xl:px-16">
          <div className="mx-auto max-w-3xl">{children}</div>
        </main>

        {/* Right TOC */}
        <div className="hidden w-56 shrink-0 xl:block">
          <DocsTableOfContents />
        </div>
      </div>
    </div>
  );
}
