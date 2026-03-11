'use client';

import { motion } from 'framer-motion';
import { GraduationCap, Building2, Briefcase, Users, Calendar } from 'lucide-react';
import { SectionWrapper } from './SectionWrapper';
import { GlassCard } from './GlassCard';

const useCases = [
  {
    icon: GraduationCap,
    title: 'Universities',
    description: 'Track student attendance across lecture halls, labs, and seminars automatically.',
    stats: '500K+ students tracked',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Building2,
    title: 'Schools',
    description: 'Monitor classroom attendance and ensure student safety with real-time notifications.',
    stats: '2000+ schools using',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Briefcase,
    title: 'Corporate Offices',
    description: 'Manage employee attendance, track work hours, and generate payroll reports.',
    stats: '10K+ companies trust us',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: Users,
    title: 'Training Centers',
    description: 'Monitor trainee participation and generate certification-ready attendance records.',
    stats: '5000+ training programs',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: Calendar,
    title: 'Events & Conferences',
    description: 'Track attendee participation, session attendance, and engagement metrics.',
    stats: '50K+ events managed',
    gradient: 'from-violet-500 to-purple-500',
  },
];

export function UseCasesSection() {
  return (
    <SectionWrapper id="use-cases">
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Built for Every Industry
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            From education to enterprise, AttendAI adapts to your needs
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {useCases.slice(0, 3).map((useCase, index) => (
          <motion.div
            key={useCase.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group"
          >
            <GlassCard className="h-full">
              {/* Icon */}
              <div className="relative mb-6 inline-block">
                <div className={`absolute inset-0 bg-gradient-to-r ${useCase.gradient} blur-xl opacity-50 group-hover:opacity-75 transition-opacity rounded-xl`} />
                <div className={`relative p-4 bg-gradient-to-r ${useCase.gradient} rounded-xl`}>
                  <useCase.icon className="h-8 w-8 text-white" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-white mb-3">
                {useCase.title}
              </h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                {useCase.description}
              </p>

              {/* Stats */}
              <div className="mt-auto pt-4 border-t border-white/10">
                <p className={`text-sm font-semibold bg-gradient-to-r ${useCase.gradient} bg-clip-text text-transparent`}>
                  {useCase.stats}
                </p>
              </div>

              {/* Hover border */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${useCase.gradient} opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none`} />
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 max-w-4xl mx-auto">
        {useCases.slice(3).map((useCase, index) => (
          <motion.div
            key={useCase.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group"
          >
            <GlassCard className="h-full">
              {/* Icon */}
              <div className="relative mb-6 inline-block">
                <div className={`absolute inset-0 bg-gradient-to-r ${useCase.gradient} blur-xl opacity-50 group-hover:opacity-75 transition-opacity rounded-xl`} />
                <div className={`relative p-4 bg-gradient-to-r ${useCase.gradient} rounded-xl`}>
                  <useCase.icon className="h-8 w-8 text-white" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-white mb-3">
                {useCase.title}
              </h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                {useCase.description}
              </p>

              {/* Stats */}
              <div className="mt-auto pt-4 border-t border-white/10">
                <p className={`text-sm font-semibold bg-gradient-to-r ${useCase.gradient} bg-clip-text text-transparent`}>
                  {useCase.stats}
                </p>
              </div>

              {/* Hover border */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${useCase.gradient} opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none`} />
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
