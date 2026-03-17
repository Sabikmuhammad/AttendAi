'use client';

import Link from 'next/link';
import { useState, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { ResendNavbar } from '@/components/landing/ResendNavbar';
import { ResendFooter } from '@/components/landing/ResendFooter';
import {
  Check,
  Minus,
  ArrowRight,
  Zap,
  ChevronDown,
  Building2,
  Users,
  Shield,
  Headphones,
  BarChart3,
  Camera,
  Loader2,
} from 'lucide-react';

// ─── Data ────────────────────────────────────────────────────────────────────

const plans = [
  {
    name: 'Starter',
    price: '$79',
    period: '/month',
    description: 'For small colleges piloting AI-powered attendance.',
    cta: 'Start Free Trial',
    ctaHref: '/onboarding',
    highlight: false,
    badge: null as string | null,
    color: 'from-white/5 to-transparent',
    features: [
      'Up to 500 students',
      'AI attendance detection',
      'Classroom camera integration',
      'Basic analytics dashboard',
      'Email support',
    ],
  },
  {
    name: 'Growth',
    price: '$249',
    period: '/month',
    description: 'For growing institutions with multiple departments.',
    cta: 'Get Started',
    ctaHref: '/onboarding',
    highlight: true,
    badge: 'Most Popular' as string | null,
    color: 'from-purple-600/20 to-violet-600/10',
    features: [
      'Up to 5,000 students',
      'Multi-department support',
      'Real-time analytics',
      'Role-based dashboards',
      'Camera monitoring',
      'Priority support',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large universities and multi-campus networks.',
    cta: 'Contact Sales',
    ctaHref: 'mailto:sales@attendai.com',
    highlight: false,
    badge: null as string | null,
    color: 'from-blue-500/10 to-indigo-600/5',
    features: [
      'Unlimited students',
      'Multi-campus management',
      'Dedicated AI infrastructure',
      'SSO authentication',
      '24/7 support',
      'Custom integrations',
    ],
  },
];

const tableFeatures = [
  {
    category: 'Core',
    icon: Zap,
    rows: [
      { label: 'Students', starter: '500', growth: '5,000', enterprise: 'Unlimited' },
      { label: 'Classrooms', starter: '5', growth: '50', enterprise: 'Unlimited' },
      { label: 'AI attendance detection', starter: true, growth: true, enterprise: true },
      { label: 'Camera integration', starter: true, growth: true, enterprise: true },
    ],
  },
  {
    category: 'Analytics',
    icon: BarChart3,
    rows: [
      { label: 'Basic dashboard', starter: true, growth: true, enterprise: true },
      { label: 'Real-time analytics', starter: false, growth: true, enterprise: true },
      { label: 'Custom reports', starter: false, growth: false, enterprise: true },
      { label: 'Data export (CSV/PDF)', starter: false, growth: true, enterprise: true },
    ],
  },
  {
    category: 'Management',
    icon: Building2,
    rows: [
      { label: 'Multi-department', starter: false, growth: true, enterprise: true },
      { label: 'Multi-campus', starter: false, growth: false, enterprise: true },
      { label: 'Role-based dashboards', starter: false, growth: true, enterprise: true },
      { label: 'SSO authentication', starter: false, growth: false, enterprise: true },
    ],
  },
  {
    category: 'Security',
    icon: Shield,
    rows: [
      { label: 'SSL encryption', starter: true, growth: true, enterprise: true },
      { label: 'GDPR compliance', starter: true, growth: true, enterprise: true },
      { label: 'Dedicated infrastructure', starter: false, growth: false, enterprise: true },
      { label: 'Custom data residency', starter: false, growth: false, enterprise: true },
    ],
  },
  {
    category: 'Support',
    icon: Headphones,
    rows: [
      { label: 'Email support', starter: true, growth: true, enterprise: true },
      { label: 'Priority support', starter: false, growth: true, enterprise: true },
      { label: '24/7 dedicated support', starter: false, growth: false, enterprise: true },
      { label: 'Onboarding assistance', starter: false, growth: true, enterprise: true },
    ],
  },
];

const faqs = [
  {
    q: 'Is there a free trial available?',
    a: 'Yes. Every plan starts with a 14-day free trial — no credit card required. You can explore all features before committing.',
  },
  {
    q: 'How is the student count calculated?',
    a: 'Students are counted by unique registered face embeddings. A student registered across multiple classes counts as one.',
  },
  {
    q: 'What camera hardware is supported?',
    a: 'AttendAI works with any IP camera, CCTV system, or laptop webcam that supports RTSP or HTTP streaming. No proprietary hardware required.',
  },
  {
    q: 'Can we switch plans as we grow?',
    a: 'Absolutely. You can upgrade or downgrade at any time from your admin dashboard. Changes take effect immediately with prorated billing.',
  },
  {
    q: 'How is student biometric data handled?',
    a: 'Face embeddings are encrypted at rest using AES-256 and are never shared across institutions. Each institution\'s data is fully isolated.',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function UpgradeButton({ plan, cta, ctaHref, highlight }: {
  plan: string; cta: string; ctaHref: string; highlight?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (ctaHref.startsWith('mailto') || ctaHref === '/onboarding') {
      router.push(ctaHref);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan.toLowerCase() }),
      });
      if (res.ok) {
        router.push('/admin/dashboard');
      } else {
        // Not logged in — send to onboarding
        router.push('/onboarding');
      }
    } catch {
      router.push('/onboarding');
    } finally {
      setLoading(false);
    }
  };

  const cls = [
    'mb-8 flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition active:scale-95 disabled:opacity-60',
    highlight
      ? 'bg-white text-black hover:bg-gray-100'
      : 'border border-white/10 bg-white/5 text-white hover:bg-white/10',
  ].join(' ');

  return (
    <button onClick={handleClick} disabled={loading} className={cls}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{cta} <ArrowRight className="h-4 w-4" /></>}
    </button>
  );
}

function TableCell({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <div className="flex justify-center">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20">
          <Check className="h-3 w-3 text-purple-400" />
        </div>
      </div>
    ) : (
      <div className="flex justify-center">
        <Minus className="h-4 w-4 text-white/15" />
      </div>
    );
  }
  return <p className="text-center text-sm font-medium text-white">{value}</p>;
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/8">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-sm font-medium text-white">{q}</span>
        <ChevronDown
          className={[
            'h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200',
            open ? 'rotate-180' : '',
          ].join(' ')}
        />
      </button>
      {open && (
        <p className="pb-5 text-sm leading-relaxed text-gray-500">{a}</p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <ResendNavbar />

      <main className="pt-24">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative px-6 py-28 text-center">
          {/* Glow */}
          <div className="pointer-events-none absolute inset-0 flex items-start justify-center pt-10">
            <div className="h-[600px] w-[800px] rounded-full bg-purple-700/10 blur-[140px]" />
          </div>

          <div className="relative mx-auto max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-gray-400">
              <Zap className="h-3 w-3 text-purple-400" />
              Simple, transparent pricing
            </div>

            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Simple, scalable pricing{' '}
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
                for institutions
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-gray-400">
              AttendAI scales from small colleges to large universities with AI-powered
              attendance infrastructure. No hidden fees.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-sm font-semibold text-black transition hover:bg-gray-100 active:scale-95"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="mailto:sales@attendai.com"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/10 hover:text-white active:scale-95"
              >
                Contact Sales
              </a>
            </div>

            <p className="mt-5 text-xs text-gray-600">
              14-day free trial · No credit card required · Cancel anytime
            </p>
          </div>
        </section>

        {/* ── Pricing Cards ────────────────────────────────────────────────── */}
        <section className="px-6 pb-28">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-6 lg:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={[
                    'group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300',
                    plan.highlight
                      ? 'border-purple-500/40 bg-gradient-to-b from-purple-950/40 to-black shadow-2xl shadow-purple-900/30 hover:shadow-purple-900/40'
                      : 'border-white/8 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]',
                  ].join(' ')}
                >
                  {/* Top gradient strip */}
                  <div className={`h-px w-full bg-gradient-to-r ${plan.color}`} />

                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute right-5 top-5">
                      <span className="rounded-full bg-purple-500 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-8">
                    {/* Header */}
                    <div className="mb-8">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
                        {plan.name}
                      </p>
                      <div className="flex items-end gap-1.5">
                        <span className="text-5xl font-bold tracking-tight text-white">
                          {plan.price}
                        </span>
                        {plan.period && (
                          <span className="mb-1.5 text-sm text-gray-500">{plan.period}</span>
                        )}
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-gray-500">
                        {plan.description}
                      </p>
                    </div>

                    {/* CTA */}
                    <UpgradeButton
                      plan={plan.name}
                      cta={plan.cta}
                      ctaHref={plan.ctaHref}
                      highlight={plan.highlight}
                    />

                    {/* Divider */}
                    <div className="mb-7 border-t border-white/8" />

                    {/* Features */}
                    <ul className="flex-1 space-y-3.5">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-3">
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/15">
                            <Check className="h-3 w-3 text-purple-400" />
                          </div>
                          <span className="text-sm text-gray-300">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-8 text-center text-xs text-gray-700">
              All plans include SSL encryption · GDPR-compliant data handling · 99.9% uptime SLA
            </p>
          </div>
        </section>

        {/* ── Trial Includes ───────────────────────────────────────────────── */}
        <section className="border-t border-white/5 px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-purple-500/20 bg-purple-950/20 p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
                    <Zap className="h-3 w-3" />
                    14-day free trial
                  </div>
                  <h3 className="text-xl font-bold text-white">Start free, no card needed</h3>
                  <p className="mt-2 text-sm text-gray-400">Every new institution gets a full 14-day trial. No credit card required.</p>
                </div>
                <Link
                  href="/onboarding"
                  className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-100"
                >
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-2 border-t border-white/8 pt-6 sm:grid-cols-2">
                {[
                  'Up to 200 students',
                  '3 classrooms',
                  '3 camera streams',
                  'AI attendance detection',
                  'Full admin dashboard',
                  'No credit card required',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-purple-500/20">
                      <Check className="h-2.5 w-2.5 text-purple-400" />
                    </div>
                    <span className="text-sm text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Feature Comparison Table ──────────────────────────────────────── */}
        <section className="border-t border-white/5 px-6 py-28">
          <div className="mx-auto max-w-5xl">
            <div className="mb-16 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-purple-400">
                Compare Plans
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Everything in one view
              </h2>
              <p className="mt-4 text-gray-500">
                See exactly what&apos;s included in each plan before you decide.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/8">
              <table className="w-full min-w-[640px]">
                {/* Column headers */}
                <thead>
                  <tr className="border-b border-white/8">
                    <th className="px-6 py-5 text-left text-xs font-medium text-gray-600">
                      Feature
                    </th>
                    {['Starter', 'Growth', 'Enterprise'].map((col, i) => (
                      <th key={col} className="px-4 py-5 text-center">
                        <span
                          className={[
                            'text-sm font-semibold',
                            i === 1 ? 'text-purple-400' : 'text-white',
                          ].join(' ')}
                        >
                          {col}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {tableFeatures.map((group) => (
                    <Fragment key={group.category}>
                      {/* Category row */}
                      <tr key={group.category} className="border-b border-white/5 bg-white/[0.02]">
                        <td colSpan={4} className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <group.icon className="h-3.5 w-3.5 text-purple-400" />
                            <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
                              {group.category}
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Feature rows */}
                      {group.rows.map((row, ri) => (
                        <tr
                          key={row.label}
                          className={[
                            'border-b border-white/5 transition-colors hover:bg-white/[0.02]',
                            ri === group.rows.length - 1 ? 'border-white/8' : '',
                          ].join(' ')}
                        >
                          <td className="px-6 py-4 text-sm text-gray-400">{row.label}</td>
                          <td className="px-4 py-4">
                            <TableCell value={row.starter} />
                          </td>
                          <td className="bg-purple-950/10 px-4 py-4">
                            <TableCell value={row.growth} />
                          </td>
                          <td className="px-4 py-4">
                            <TableCell value={row.enterprise} />
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <section className="border-t border-white/5 px-6 py-28">
          <div className="mx-auto max-w-2xl">
            <div className="mb-14 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-purple-400">
                FAQ
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Common questions
              </h2>
              <p className="mt-4 text-gray-500">
                Everything institutions ask before signing up.
              </p>
            </div>

            <div>
              {faqs.map(({ q, a }) => (
                <FaqItem key={q} q={q} a={a} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Enterprise CTA ───────────────────────────────────────────────── */}
        <section className="px-6 pb-28">
          <div className="mx-auto max-w-5xl">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-950/50 via-black to-indigo-950/30 px-8 py-16 text-center">
              {/* Background glow */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-[400px] w-[600px] rounded-full bg-purple-700/15 blur-[100px]" />
              </div>

              {/* Icon */}
              <div className="relative mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <Building2 className="h-6 w-6 text-purple-400" />
              </div>

              <div className="relative">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-purple-400">
                  Enterprise
                </p>
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Running a large university?
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-gray-400">
                  Talk to our team about deploying AttendAI across multiple campuses with
                  dedicated infrastructure, custom integrations, and white-glove onboarding.
                </p>

                {/* Feature pills */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                  {[
                    { icon: Users, label: 'Unlimited students' },
                    { icon: Camera, label: 'Unlimited cameras' },
                    { icon: Shield, label: 'Dedicated infrastructure' },
                    { icon: Headphones, label: '24/7 support' },
                  ].map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-gray-400"
                    >
                      <Icon className="h-3 w-3 text-purple-400" />
                      {label}
                    </div>
                  ))}
                </div>

                <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <a
                    href="mailto:sales@attendai.com"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-black transition hover:bg-gray-100 active:scale-95"
                  >
                    Contact Sales
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <Link
                    href="/demo"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-medium text-gray-300 transition hover:bg-white/10 hover:text-white active:scale-95"
                  >
                    Watch Demo
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <ResendFooter />
    </div>
  );
}
