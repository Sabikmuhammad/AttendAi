'use client';

import { Clock, Users, CreditCard, AlertCircle } from 'lucide-react';

const problems = [
  {
    icon: Clock,
    title: 'Manual roll calls waste time',
    description: 'Teachers spend 10-15 minutes every class just marking attendance.'
  },
  {
    icon: Users,
    title: 'Biometric systems create queues',
    description: 'Students wait in long lines at fingerprint or iris scanners.'
  },
  {
    icon: CreditCard,
    title: 'RFID cards can be misused',
    description: 'Students can proxy attendance for absent classmates.'
  },
  {
    icon: AlertCircle,
    title: 'Manual errors are common',
    description: 'Human mistakes lead to incorrect attendance records.'
  }
];

export function ProblemSection() {
  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-black relative overflow-hidden">
      {/* Background Grid */}
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
            Attendance Systems Are Broken
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
            Institutions need a smarter automated solution.
          </p>
        </div>

        {/* Problems Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-red-600/20 flex items-center justify-center mb-4 sm:mb-6">
                <problem.icon className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                {problem.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
