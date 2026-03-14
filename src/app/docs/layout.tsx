import { DocsNavbar } from '@/components/docs/DocsNavbar';
import { DocsSidebar } from '@/components/docs/DocsSidebar';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black">
      <DocsNavbar />
      
      {/* Desktop: Sidebar + Content */}
      <div className="hidden md:flex">
        <DocsSidebar />
        <main className="ml-64 pt-16 flex-1">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile: Content only (sidebar in navbar menu) */}
      <div className="md:hidden pt-16">
        <main className="px-4 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
