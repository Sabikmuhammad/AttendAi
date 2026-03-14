import { notFound } from 'next/navigation';
import { getDocBySlug, getAllDocSlugs } from '@/lib/docs';
import { MarkdownContent } from '@/components/docs/MarkdownContent';

interface DocPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = getAllDocSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: DocPageProps) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  
  if (!doc) {
    return {
      title: 'Page Not Found',
    };
  }

  return {
    title: `${doc.title} - AttendAI Documentation`,
    description: doc.description,
  };
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  return (
    <article className="docs-content">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">{doc.title}</h1>
        {doc.description && (
          <p className="text-lg text-gray-400">{doc.description}</p>
        )}
      </div>

      <MarkdownContent content={doc.content} />

      {/* On This Page - Table of Contents (optional enhancement) */}
      <div className="mt-16 pt-8 border-t border-white/10">
        <p className="text-sm text-gray-400">
          Need help? Visit our{' '}
          <a href="/docs/faq" className="text-purple-400 hover:text-purple-300">
            FAQ
          </a>{' '}
          or contact{' '}
          <a href="mailto:support@attendai.com" className="text-purple-400 hover:text-purple-300">
            support@attendai.com
          </a>
        </p>
      </div>
    </article>
  );
}
