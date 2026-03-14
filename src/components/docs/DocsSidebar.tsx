'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BookOpen, 
  Layers, 
  Download, 
  Camera, 
  UserPlus, 
  Workflow, 
  Code, 
  LayoutDashboard, 
  Shield, 
  HelpCircle 
} from 'lucide-react';

const docsLinks = [
  {
    title: 'Introduction',
    href: '/docs/introduction',
    icon: BookOpen,
  },
  {
    title: 'System Architecture',
    href: '/docs/system-architecture',
    icon: Layers,
  },
  {
    title: 'Installation',
    href: '/docs/installation',
    icon: Download,
  },
  {
    title: 'Camera Setup',
    href: '/docs/camera-setup',
    icon: Camera,
  },
  {
    title: 'Face Registration',
    href: '/docs/face-registration',
    icon: UserPlus,
  },
  {
    title: 'Attendance Workflow',
    href: '/docs/attendance-workflow',
    icon: Workflow,
  },
  {
    title: 'API Reference',
    href: '/docs/api-reference',
    icon: Code,
  },
  {
    title: 'Dashboard Guide',
    href: '/docs/dashboard-guide',
    icon: LayoutDashboard,
  },
  {
    title: 'Security',
    href: '/docs/security',
    icon: Shield,
  },
  {
    title: 'FAQ',
    href: '/docs/faq',
    icon: HelpCircle,
  },
];

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 overflow-y-auto border-r border-white/10 bg-black/50 backdrop-blur-xl">
      <nav className="p-6 space-y-1">
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Documentation
          </h3>
        </div>
        
        {docsLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`
                flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all
                ${isActive 
                  ? 'bg-white/10 text-white font-medium' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{link.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
