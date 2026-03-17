export interface DocsNavItem {
  title: string;
  href: string;
  description: string;
}

export const DOCS_NAV_ITEMS: DocsNavItem[] = [
  {
    title: 'Introduction',
    href: '/docs',
    description: 'What AttendAI is and what it solves.',
  },
  {
    title: 'Getting Started',
    href: '/docs/getting-started',
    description: 'Institution onboarding and first-time setup path.',
  },
  {
    title: 'Platform Overview',
    href: '/docs/platform',
    description: 'How roles, institutions, and core workflows connect.',
  },
  {
    title: 'Admin Guide',
    href: '/docs/admin',
    description: 'How admins manage people, classes, and analytics.',
  },
  {
    title: 'Faculty Guide',
    href: '/docs/faculty',
    description: 'How faculty run classes and monitor attendance.',
  },
  {
    title: 'Student Guide',
    href: '/docs/student',
    description: 'How students view records and attendance trends.',
  },
  {
    title: 'AI Attendance System',
    href: '/docs/ai-attendance',
    description: 'Simple explanation of detection and recognition flow.',
  },
  {
    title: 'Camera Setup',
    href: '/docs/camera-setup',
    description: 'Linking classroom camera sources with class schedules.',
  },
  {
    title: 'Security & Privacy',
    href: '/docs/security',
    description: 'Authentication, encryption, and data isolation model.',
  },
  {
    title: 'FAQ',
    href: '/docs/faq',
    description: 'Answers to common institutional questions.',
  },
];
