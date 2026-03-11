'use client';

import { motion } from 'framer-motion';
import { Camera, Brain, Database, ArrowRight } from 'lucide-react';
import { SectionWrapper } from './SectionWrapper';

const steps = [
  {
    number: '01',
    icon: Camera,
    title: 'Connect CCTV Cameras',
    description: 'Integrate your existing CCTV infrastructure with our secure AI platform in minutes.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    number: '02',
    icon: Brain,
    title: 'AI Detects Faces',
    description: 'Our computer vision models identify and recognize faces in real-time with 99.9% accuracy.',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    number: '03',
    icon: Database,
    title: 'Auto-Record Attendance',
    description: 'Attendance is automatically logged, verified, and synced to your dashboard instantly.',
    gradient: 'from-green-500 to-emerald-500',
  },
];

export function HowItWorksSection() {
  return (
    <SectionWrapper id="how-it-works" className="bg-black/30">
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              How AttendAI Works
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Three simple steps to transform your attendance system
          </p>
        </motion.div>
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Connection Lines */}
        <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 via-cyan-500 to-green-500 opacity-20 -translate-y-1/2" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative"
            >
              {/* Step Card */}
              <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl hover:bg-white/10 transition-all group">
                {/* Step Number */}
                <div className="absolute -top-6 -left-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-black to-gray-900 border border-white/20 flex items-center justify-center">
                  <span className={`text-2xl font-bold bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent`}>
                    {step.number}
                  </span>
                </div>

                {/* Icon */}
                <div className="relative mb-6 inline-block mt-6">
                  <div className={`absolute inset-0 bg-gradient-to-r ${step.gradient} blur-xl opacity-50 group-hover:opacity-75 transition-opacity rounded-xl`} />
                  <div className={`relative p-4 bg-gradient-to-r ${step.gradient} rounded-xl`}>
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {step.description}
                </p>

                {/* Hover Effect */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${step.gradient} opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none`} />
              </div>

              {/* Arrow Connector (Desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:flex absolute top-1/2 -right-6 -translate-y-1/2 z-10">
                  <motion.div
                    animate={{
                      x: [0, 5, 0],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="h-8 w-8 text-cyan-400" />
                  </motion.div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="text-center mt-16"
      >
        <p className="text-gray-400 mb-4">Ready to get started?</p>
        <div className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all cursor-pointer">
          <span>Start Your Free Trial</span>
          <ArrowRight className="h-5 w-5" />
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
