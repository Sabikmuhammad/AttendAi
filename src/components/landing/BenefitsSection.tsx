'use client';

import { Clock, Target, Waves, TrendingUp } from 'lucide-react';

const benefits = [
  {
    icon: Clock,
    title: 'Save Time',
    description: 'Eliminate 10-15 minutes of manual roll calls every class. Teachers can start teaching immediately.',
    stat: '90%',
    statLabel: 'Time Saved'
  },
  {
    icon: Target,
    title: 'Improve Accuracy',
    description: 'AI-powered recognition ensures 99.9% accurate attendance with zero manual errors.',
    stat: '99.9%',
    statLabel: 'Accuracy'
  },
  {
    icon: Waves,
    title: 'Contactless Attendance',
    description: 'No physical touchpoints, no cards, no queues. Completely automated and hygienic.',
    stat: '100%',
    statLabel: 'Contactless'
  },
  {
    icon: TrendingUp,
    title: 'Scalable for Institutions',
    description: 'Works for classrooms of any size. From small training centers to large universities.',
    stat: '∞',
    statLabel: 'Scalability'
  }
];

export function BenefitsSection() {
  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-black relative overflow-hidden border-t border-white/10">
      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(to right, white 1px, transparent 1px),
                          linear-gradient(to bottom, white 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Why Choose AttendAI
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
            Transform your attendance system with measurable benefits
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2 sm:mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-400 leading-relaxed mb-3 sm:mb-4">
                    {benefit.description}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-bold text-purple-400">
                      {benefit.stat}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {benefit.statLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
