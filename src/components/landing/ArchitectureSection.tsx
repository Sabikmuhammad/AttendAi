'use client';

import { Code, Brain, Database, Cloud, Lock } from 'lucide-react';

const techStack = [
  {
    icon: Code,
    title: 'Frontend',
    description: 'Next.js + TypeScript + Tailwind CSS',
    color: 'blue'
  },
  {
    icon: Brain,
    title: 'AI Engine',
    description: 'Python + OpenCV + Face Recognition',
    color: 'purple'
  },
  {
    icon: Database,
    title: 'Database',
    description: 'MongoDB Atlas',
    color: 'green'
  },
  {
    icon: Cloud,
    title: 'Media Storage',
    description: 'Cloudinary',
    color: 'orange'
  },
  {
    icon: Lock,
    title: 'Authentication',
    description: 'Secure role-based login',
    color: 'red'
  }
];

const colorClasses = {
  blue: 'bg-blue-600/20 text-blue-400 border-blue-600/30',
  purple: 'bg-purple-600/20 text-purple-400 border-purple-600/30',
  green: 'bg-green-600/20 text-green-400 border-green-600/30',
  orange: 'bg-orange-600/20 text-orange-400 border-orange-600/30',
  red: 'bg-red-600/20 text-red-400 border-red-600/30'
};

export function ArchitectureSection() {
  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-black relative overflow-hidden border-t border-white/10">
      {/* Glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] lg:w-[600px] lg:h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            System Architecture
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
            Built with modern technologies for reliability and scale
          </p>
        </div>

        {/* Tech Stack Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {techStack.map((tech, index) => (
            <div
              key={index}
              className={`p-6 sm:p-8 rounded-2xl border ${colorClasses[tech.color as keyof typeof colorClasses]} hover:brightness-110 transition-all duration-300`}
            >
              <tech.icon className="w-6 h-6 sm:w-8 sm:h-8 mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                {tech.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-400">
                {tech.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 sm:mt-16 text-center">
          <p className="text-gray-500 text-xs sm:text-sm">
            Scalable • Secure • Fast • Reliable
          </p>
        </div>
      </div>
    </section>
  );
}
