import { DocsArticle } from '@/components/docs/DocsArticle';
import { DocsCallout } from '@/components/docs/DocsCallout';

const steps = [
  {
    title: 'Create Institution',
    description: 'Create your institution workspace and verify the admin account.',
  },
  {
    title: 'Configure Academic Structure',
    description: 'Create departments, programs, and sections to reflect your institution layout.',
  },
  {
    title: 'Register Users',
    description: 'Add faculty members and students, assigning them to the correct departments.',
  },
  {
    title: 'Create Classes',
    description: 'Define class schedules, assign faculty, and link student groups.',
  },
  {
    title: 'Connect Classroom Camera',
    description: 'Attach a classroom camera source to the class for AI attendance detection.',
  },
  {
    title: 'Automatic Attendance',
    description:
      'When the class begins, AttendAI automatically detects students and records attendance.',
  },
];

export default function GettingStartedPage() {
  return (
    <DocsArticle
      title="Getting Started"
      subtitle="How institutions onboard and launch AttendAI from account setup to automated attendance capture."
    >
      <h2 id="setup-steps">Setup Steps</h2>

      <div className="not-prose space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="group flex gap-4 rounded-xl border border-zinc-200 p-5 transition-all hover:border-zinc-300 hover:bg-zinc-50/60 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/40"
          >
            {/* Number badge */}
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
              {index + 1}
            </div>

            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{step.title}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <h2 id="prerequisites">Prerequisites</h2>
      <ul>
        <li>A verified admin account with institution creation permissions</li>
        <li>At least one classroom camera (webcam or CCTV) available</li>
        <li>Student face images for initial AI model registration</li>
      </ul>

      <DocsCallout title="Tip" variant="tip">
        You can complete steps 1–4 before any camera hardware is available. Camera setup can be
        done independently once the academic structure is in place.
      </DocsCallout>
    </DocsArticle>
  );
}
