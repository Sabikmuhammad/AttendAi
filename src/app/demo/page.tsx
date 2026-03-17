import Link from 'next/link';
import { ResendNavbar } from '@/components/landing/ResendNavbar';
import { ResendFooter } from '@/components/landing/ResendFooter';
import {
  Brain,
  CalendarCheck,
  Building2,
  MonitorPlay,
  ScanFace,
  Database,
  Bell,
  BarChart3,
  ArrowRight,
  Play,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI Face Recognition',
    description:
      'Deep learning models identify each student in milliseconds — even in crowded classrooms.',
  },
  {
    icon: CalendarCheck,
    title: 'Automated Attendance',
    description:
      'Zero manual roll calls. Attendance is captured and stored the moment class begins.',
  },
  {
    icon: Building2,
    title: 'Multi-Institution Management',
    description:
      'One platform for every campus, department, and section across your entire institution.',
  },
  {
    icon: MonitorPlay,
    title: 'Real-Time Monitoring',
    description:
      'Live classroom feeds with instant attendance overlays visible to faculty and admins.',
  },
];

const steps = [
  {
    number: '01',
    icon: ScanFace,
    title: 'Camera Captures Frame',
    description:
      'The classroom camera continuously captures frames during the active class window.',
  },
  {
    number: '02',
    icon: Brain,
    title: 'AI Detects Faces',
    description:
      'The AI service detects all faces in the frame using a real-time detection pipeline.',
  },
  {
    number: '03',
    icon: Database,
    title: 'Faces Are Matched',
    description:
      'Each detected face is compared against registered student embeddings in the database.',
  },
  {
    number: '04',
    icon: CalendarCheck,
    title: 'Attendance Recorded',
    description:
      'Matched students are marked present. Records are written to the database instantly.',
  },
  {
    number: '05',
    icon: Bell,
    title: 'Faculty Notified',
    description:
      'Faculty receive a live summary of who is present, absent, or unrecognized.',
  },
  {
    number: '06',
    icon: BarChart3,
    title: 'Analytics Generated',
    description:
      'Attendance trends, percentages, and reports are available immediately after class.',
  },
];

export default function DemoPage() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <ResendNavbar />

      <main className="pt-24">
        {/* ── Hero ── */}
        <section className="relative px-6 py-24 text-center">
          {/* Radial glow */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[600px] w-[600px] rounded-full bg-purple-600/10 blur-[120px]" />
          </div>

          <div className="relative mx-auto max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-gray-400">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
              Live Demo Available
            </div>

            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              See AttendAI{' '}
              <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                in Action
              </span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-gray-400 sm:text-xl">
              AI-powered classroom attendance in real time. Watch how AttendAI detects, identifies,
              and records student presence — automatically.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-gray-100"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/10 hover:text-white"
              >
                Read the Docs
              </Link>
            </div>
          </div>
        </section>

        {/* ── Video Player ── */}
        <section className="px-6 pb-24">
          <div className="mx-auto max-w-5xl">
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl shadow-black/50">
              {/* Fake video player chrome */}
              <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3">
                <span className="h-3 w-3 rounded-full bg-red-500/70" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
                <span className="h-3 w-3 rounded-full bg-green-500/70" />
                <span className="ml-3 text-xs text-gray-500">attendai-demo.mp4</span>
              </div>

              {/* Video embed area */}
              <div className="relative aspect-video w-full bg-zinc-950">
                {/* Replace src with your actual video URL */}
                <iframe
                  className="h-full w-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1"
                  title="AttendAI Demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />

                {/* Play overlay — hidden once iframe loads */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-0">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                    <Play className="h-6 w-6 fill-white text-white" />
                  </div>
                </div>
              </div>

              {/* Caption bar */}
              <div className="flex items-center justify-between border-t border-white/10 px-5 py-3">
                <p className="text-xs text-gray-500">
                  AttendAI — Automated Classroom Attendance Demo
                </p>
                <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-[10px] font-medium text-purple-300">
                  3 min watch
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Feature Highlights ── */}
        <section className="border-t border-white/5 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-purple-400">
                Capabilities
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Everything you saw — explained
              </h2>
              <p className="mt-4 text-gray-400">
                Four core capabilities that make AttendAI the most reliable attendance platform
                for modern institutions.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="group rounded-2xl border border-white/8 bg-white/3 p-6 transition-all duration-200 hover:border-purple-500/30 hover:bg-white/6"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition group-hover:border-purple-500/30 group-hover:bg-purple-500/10">
                    <Icon className="h-5 w-5 text-gray-400 transition group-hover:text-purple-400" />
                  </div>
                  <h3 className="mb-2 text-sm font-semibold text-white">{title}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="border-t border-white/5 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-purple-400">
                Workflow
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                How attendance happens
              </h2>
              <p className="mt-4 text-gray-400">
                Six automated steps — from camera frame to analytics report.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {steps.map(({ number, icon: Icon, title, description }) => (
                <div
                  key={number}
                  className="relative rounded-2xl border border-white/8 bg-white/3 p-6 transition-all hover:border-white/15 hover:bg-white/5"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-3xl font-bold tabular-nums text-white/10">{number}</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                      <Icon className="h-4 w-4 text-purple-400" />
                    </div>
                  </div>
                  <h3 className="mb-2 text-sm font-semibold text-white">{title}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="border-t border-white/5 px-6 py-24 text-center">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to automate attendance?
            </h2>
            <p className="mt-4 text-gray-400">
              Join institutions already running AttendAI in production classrooms.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-gray-100"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/10 hover:text-white"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </section>
      </main>

      <ResendFooter />
    </div>
  );
}
