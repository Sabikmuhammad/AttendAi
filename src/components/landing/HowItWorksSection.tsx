'use client';

import { Video, Scan, UserCheck, Database } from 'lucide-react';

const steps = [
  {
    icon: Video,
    title: 'Camera Capture',
    description: 'CCTV cameras capture classroom video in real time.',
    color: 'purple'
  },
  {
    icon: Scan,
    title: 'Face Detection',
    description: 'AI detects human faces in the video stream.',
    color: 'blue'
  },
  {
    icon: UserCheck,
    title: 'Face Recognition',
    description: 'Faces are matched with registered students.',
    color: 'green'
  },
  {
    icon: Database,
    title: 'Attendance Recorded',
    description: 'Attendance is stored automatically in the database.',
    color: 'orange'
  }
];

const colorClasses = {
  purple: 'bg-purple-600/20 text-purple-400',
  blue: 'bg-blue-600/20 text-blue-400',
  green: 'bg-green-600/20 text-green-400',
  orange: 'bg-orange-600/20 text-orange-400'
};

export function HowItWorksSection() {
  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-black relative overflow-hidden">
      {/* Background Effects */}
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
            How It Works
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
            AttendAI automates attendance in four simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line (desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-white/20 to-transparent" />
              )}
              
              <div className="relative p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
                {/* Step Number */}
                <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black border border-white/20 flex items-center justify-center text-xs sm:text-sm font-bold text-white">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${colorClasses[step.color as keyof typeof colorClasses]} flex items-center justify-center mb-4 sm:mb-6`}>
                  <step.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                {/* Content */}
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
