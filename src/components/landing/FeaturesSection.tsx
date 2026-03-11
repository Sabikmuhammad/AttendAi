'use client';

import { motion } from 'framer-motion';
import { Camera, Zap, FileText, Shield, Grid3x3, Cloud } from 'lucide-react';
import { SectionWrapper } from './SectionWrapper';
import { GlassCard } from './GlassCard';

const features = [
  {
    icon: Camera,
    title: 'AI Face Recognition',
    description: 'Advanced neural networks identify faces with 99.9% accuracy in real-time.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Zap,
    title: 'Real-Time CCTV Processing',
    description: 'Process multiple camera feeds simultaneously with sub-second latency.',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    icon: FileText,
    title: 'Automated Reports',
    description: 'Generate comprehensive attendance reports automatically with analytics.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: Shield,
    title: 'Anti-Proxy Detection',
    description: 'Prevent fraud with liveness detection and anti-spoofing technology.',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: Grid3x3,
    title: 'Multi-Camera Integration',
    description: 'Seamlessly integrate with existing CCTV infrastructure across locations.',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: Cloud,
    title: 'Secure Cloud Dashboard',
    description: 'Access attendance data from anywhere with enterprise-grade security.',
    gradient: 'from-blue-500 to-cyan-500',
  },
];

export function FeaturesSection() {
  return (
    <SectionWrapper id="features" className="bg-black/30">
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Powerful Features
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need to transform your attendance system with AI
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group"
          >
            <GlassCard className="h-full group">
              {/* Icon with gradient background */}
              <div className="relative mb-6 inline-block">
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} blur-xl opacity-50 group-hover:opacity-75 transition-opacity rounded-xl`} />
                <div className={`relative p-4 bg-gradient-to-r ${feature.gradient} rounded-xl`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition-all">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover border effect */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none`} />
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
