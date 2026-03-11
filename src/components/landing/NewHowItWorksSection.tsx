'use client';

import { motion } from 'framer-motion';
import { Camera, Scan, Brain, CheckCircle } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Camera,
    title: 'Camera Captures Classroom',
    description: 'CCTV cameras or webcams continuously monitor the classroom environment in real-time.',
    color: 'purple',
  },
  {
    number: '02',
    icon: Scan,
    title: 'AI Detects Student Faces',
    description: 'Computer vision algorithms scan video feed and detect human faces with precise localization.',
    color: 'blue',
  },
  {
    number: '03',
    icon: Brain,
    title: 'Deep Learning Identifies Students',
    description: 'Neural networks match detected faces against student database with 99.9% accuracy.',
    color: 'orange',
  },
  {
    number: '04',
    icon: CheckCircle,
    title: 'Attendance Recorded Automatically',
    description: 'System instantly marks attendance and notifies administrators without manual intervention.',
    color: 'green',
  },
];

const colorClasses = {
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-600',
    gradient: 'from-purple-600 to-purple-400',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-600',
    gradient: 'from-blue-600 to-blue-400',
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-600',
    gradient: 'from-orange-600 to-orange-400',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-600',
    gradient: 'from-green-600 to-green-400',
  },
};

export function HowItWorksSection() {
  return (
    <section className="py-32 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-full text-sm text-purple-700 font-medium mb-6">
            Process Overview
          </div>
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Four simple steps from camera capture to automated attendance recording
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-24 left-0 w-full h-0.5 bg-gradient-to-r from-purple-200 via-blue-200 via-orange-200 to-green-200" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            const colors = colorClasses[step.color as keyof typeof colorClasses];

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="relative"
              >
                {/* Step Card */}
                <div className="relative bg-white rounded-3xl p-8 border border-gray-200 hover:border-purple-300 transition-all duration-300 shadow-sm hover:shadow-lg group">
                  {/* Number Badge */}
                  <div className={`absolute -top-4 -right-4 w-12 h-12 rounded-full ${colors.bg} ${colors.border} border-2 flex items-center justify-center font-bold ${colors.text} text-sm shadow-lg`}>
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${colors.gradient} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Connection Dot */}
                <div className={`hidden lg:block absolute top-24 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gradient-to-br ${colors.gradient} border-4 border-white shadow-lg z-10`} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
