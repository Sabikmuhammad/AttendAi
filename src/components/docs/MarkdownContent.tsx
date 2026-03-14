'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="prose prose-invert prose-purple max-w-none">
      <style jsx global>{`
        .prose {
          color: #e5e7eb;
        }
        .prose h1 {
          color: #ffffff;
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          margin-top: 2rem;
        }
        .prose h2 {
          color: #ffffff;
          font-size: 2rem;
          font-weight: 600;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .prose h3 {
          color: #ffffff;
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
        }
        .prose h4 {
          color: #ffffff;
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .prose p {
          color: #d1d5db;
          line-height: 1.75;
          margin-bottom: 1.25rem;
        }
        .prose a {
          color: #a78bfa;
          text-decoration: underline;
        }
        .prose a:hover {
          color: #c4b5fd;
        }
        .prose code {
          background-color: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.25rem;
          padding: 0.125rem 0.375rem;
          font-size: 0.875em;
          color: #e5e7eb;
          font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
        }
        .prose pre {
          background-color: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          padding: 1rem;
          overflow-x: auto;
          margin-bottom: 1.5rem;
        }
        .prose pre code {
          background-color: transparent;
          border: none;
          padding: 0;
          color: #e5e7eb;
        }
        .prose ul {
          list-style-type: disc;
          margin-left: 1.5rem;
          margin-bottom: 1.25rem;
          color: #d1d5db;
        }
        .prose ol {
          list-style-type: decimal;
          margin-left: 1.5rem;
          margin-bottom: 1.25rem;
          color: #d1d5db;
        }
        .prose li {
          margin-bottom: 0.5rem;
        }
        .prose li::marker {
          color: #a78bfa;
        }
        .prose blockquote {
          border-left: 4px solid #a78bfa;
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #9ca3af;
        }
        .prose table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1.5rem;
        }
        .prose th {
          background-color: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.75rem;
          text-align: left;
          color: #ffffff;
          font-weight: 600;
        }
        .prose td {
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.75rem;
          color: #d1d5db;
        }
        .prose strong {
          color: #ffffff;
          font-weight: 600;
        }
        .prose em {
          color: #d1d5db;
          font-style: italic;
        }
        .prose hr {
          border: none;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          margin: 2rem 0;
        }
      `}</style>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
