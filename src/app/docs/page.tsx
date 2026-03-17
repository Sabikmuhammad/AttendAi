import { DocsArticle } from '@/components/docs/DocsArticle';
import { DocsCallout } from '@/components/docs/DocsCallout';
import { Brain, CalendarCheck, Building2, MonitorPlay } from 'lucide-react';

const featureCards = [
  {
    icon: Brain,
    title: 'AI Face Recognition',
    description: 'Automatically detects and identifies students during class using computer vision.',
  },
  {
    icon: CalendarCheck,
    title: 'Automated Attendance',
    description: 'Attendance is recorded without manual roll calls — zero faculty overhead.',
  },
  {
    icon: Building2,
    title: 'Multi-Institution Support',
    description: 'Manage multiple institutions, campuses, and departments from one platform.',
  },
  {
    icon: MonitorPlay,
    title: 'Real-Time Monitoring',
    description: 'Track live attendance activity across classrooms during active sessions.',
  },
];

export default function DocsPage() {
  return (
    <DocsArticle
      title="AttendAI Documentation"
      subtitle="Learn how to set up your institution, manage classes, and automate attendance using AI-powered classroom monitoring."
    >
      {/* Hero banner */}
      <section
        id="hero"
        className="not-prose rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/40"
      >
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Documentation Hub
        </p>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Build institution-ready AI attendance workflows
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          This documentation helps administrators, faculty teams, and students launch AttendAI
          with confidence across pilot campuses and production classrooms.
        </p>
      </section>

      {/* Feature cards */}
      <div id="key-features" className="not-prose">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Key Features
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {featureCards.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-xl border border-zinc-200 p-5 transition-all hover:border-zinc-300 hover:bg-zinc-50/80 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/40"
            >
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
                <Icon className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              </div>
              <p className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</p>
              <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{description}</p>
            </div>
          ))}
        </div>
      </div>

      <h2 id="what-is-attendai">What Is AttendAI?</h2>
      <p>
        AttendAI is purpose-built for educational institutions that want reliable, contactless,
        and auditable attendance operations across multiple classrooms and departments.
      </p>

      <h2 id="who-uses-attendai">Who Uses AttendAI?</h2>
      <ul>
        <li>Admin teams managing institution setup and governance</li>
        <li>Faculty teams running classes and monitoring outcomes</li>
        <li>Students reviewing attendance history and percentage trends</li>
      </ul>

      <h2 id="quick-product-view">Quick Product View</h2>
      <pre>
        <code>{`Institution Onboards
→ Admin Configures Departments
→ Faculty and Students Registered
→ Classes Scheduled
→ Camera Source Connected
→ Attendance Recorded Automatically`}</code>
      </pre>

      <DocsCallout>
        AttendAI supports both laptop webcams (development) and classroom CCTV cameras
        (production).
      </DocsCallout>
    </DocsArticle>
  );
}
