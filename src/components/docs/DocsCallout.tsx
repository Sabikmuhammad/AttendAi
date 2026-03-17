import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface DocsCalloutProps {
  title?: string;
  children: ReactNode;
  className?: string;
  variant?: 'info' | 'warning' | 'tip';
}

const variants = {
  info: {
    border: 'border-blue-500',
    bg: 'bg-blue-500/8 dark:bg-blue-500/10',
    icon: 'text-blue-600 dark:text-blue-400',
    title: 'text-blue-900 dark:text-blue-200',
    body: 'text-blue-900/80 dark:text-blue-100/80',
  },
  warning: {
    border: 'border-amber-500',
    bg: 'bg-amber-500/8 dark:bg-amber-500/10',
    icon: 'text-amber-600 dark:text-amber-400',
    title: 'text-amber-900 dark:text-amber-200',
    body: 'text-amber-900/80 dark:text-amber-100/80',
  },
  tip: {
    border: 'border-emerald-500',
    bg: 'bg-emerald-500/8 dark:bg-emerald-500/10',
    icon: 'text-emerald-600 dark:text-emerald-400',
    title: 'text-emerald-900 dark:text-emerald-200',
    body: 'text-emerald-900/80 dark:text-emerald-100/80',
  },
};

export function DocsCallout({
  title = 'Note',
  children,
  className,
  variant = 'info',
}: DocsCalloutProps) {
  const v = variants[variant];

  return (
    <div
      className={cn(
        'not-prose my-8 rounded-r-lg border-l-4 p-4',
        v.border,
        v.bg,
        className
      )}
      role="note"
    >
      <div className="mb-1.5 flex items-center gap-2">
        <Info className={cn('h-4 w-4 shrink-0', v.icon)} />
        <p className={cn('text-sm font-semibold', v.title)}>{title}</p>
      </div>
      <div className={cn('text-sm leading-relaxed', v.body)}>{children}</div>
    </div>
  );
}
