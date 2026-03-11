/**
 * AttendAI Landing Page
 * Resend-inspired dark premium developer-style UI
 */

import { ResendNavbar } from '@/components/landing/ResendNavbar';
import { ResendHero } from '@/components/landing/ResendHero';
import { ResendFeatures } from '@/components/landing/ResendFeatures';
import { ResendCTA } from '@/components/landing/ResendCTA';
import { ResendFooter } from '@/components/landing/ResendFooter';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AttendAI - Attendance Without Roll Calls',
  description: 'AttendAI uses advanced AI facial recognition and CCTV cameras to automatically detect and verify student attendance in real time.',
  keywords: ['attendance system', 'AI attendance', 'face recognition', 'automated attendance', 'computer vision', 'CCTV attendance', 'deep learning'],
  openGraph: {
    title: 'AttendAI - Attendance Without Roll Calls',
    description: 'AttendAI uses advanced AI facial recognition and CCTV cameras to automatically detect and verify student attendance in real time.',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <ResendNavbar />
      <main>
        <ResendHero />
        <ResendFeatures />
        <ResendCTA />
      </main>
      <ResendFooter />
    </div>
  );
}
