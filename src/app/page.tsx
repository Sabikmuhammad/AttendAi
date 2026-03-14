/**
 * AttendAI Landing Page
 * Resend-inspired dark premium developer-style UI
 */

import { ResendNavbar } from '@/components/landing/ResendNavbar';
import { ResendHero } from '@/components/landing/ResendHero';
import { TrustedBySection } from '@/components/landing/TrustedBySection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { SolutionSection } from '@/components/landing/SolutionSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { ResendFeatures } from '@/components/landing/ResendFeatures';
import { ArchitectureSection } from '@/components/landing/ArchitectureSection';
import { LiveDemoSection } from '@/components/landing/LiveDemoSection';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { UseCasesSection } from '@/components/landing/UseCasesSection';
import { PricingSection } from '@/components/landing/PricingSection';
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
        <TrustedBySection />
        <ProblemSection />
        <SolutionSection />
        <HowItWorksSection />
        <ResendFeatures />
        <ArchitectureSection />
        <LiveDemoSection />
        <BenefitsSection />
        <UseCasesSection />
        <PricingSection />
        <ResendCTA />
      </main>
      <ResendFooter />
    </div>
  );
}
