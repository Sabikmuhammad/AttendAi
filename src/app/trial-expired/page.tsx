import Link from 'next/link';
import { AlertTriangle, Check, ArrowRight } from 'lucide-react';

const trialIncludes = [
  'Up to 200 students',
  '3 classrooms',
  '3 camera streams',
  'AI attendance detection',
  'Full admin dashboard',
];

export default function TrialExpiredPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-24">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
        <div className="h-[600px] w-[600px] rounded-full bg-red-900/10 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-lg w-full text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10">
          <AlertTriangle className="h-7 w-7 text-red-400" />
        </div>

        {/* Heading */}
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
          Trial Expired
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Your free trial has ended
        </h1>
        <p className="mt-4 text-base leading-relaxed text-gray-400">
          Upgrade your plan to continue using AttendAI and keep your attendance data, students,
          and classroom configurations intact.
        </p>

        {/* CTA buttons */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-sm font-semibold text-black transition hover:bg-gray-100 active:scale-95"
          >
            View Pricing Plans
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="mailto:sales@attendai.com"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/10 hover:text-white active:scale-95"
          >
            Contact Sales
          </a>
        </div>

        {/* What was included */}
        <div className="mt-12 rounded-2xl border border-white/8 bg-white/[0.02] p-6 text-left">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
            Your 14-day free trial included
          </p>
          <ul className="space-y-2.5">
            {trialIncludes.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/15">
                  <Check className="h-3 w-3 text-purple-400" />
                </div>
                <span className="text-sm text-gray-300">{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-gray-600">No credit card was required during trial.</p>
        </div>

        <p className="mt-6 text-xs text-gray-600">
          Questions?{' '}
          <a href="mailto:support@attendai.com" className="text-gray-400 hover:text-white transition">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
