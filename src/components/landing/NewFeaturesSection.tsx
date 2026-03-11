'use client';

import { motion } from 'framer-motion';
import { Eye, Video, Zap, Camera, Activity, Shield } from 'lucide-react';

const features = [
  {
    icon: Eye,
    title: 'Deep Face Recognition',
    description: 'Advanced neural networks for accurate student identification with 99.9% precision.',
    gradient: 'from-purple-600 to-purple-400',
  },
  {
    icon: Video,
    title: 'Computer Vision Analytics',
    description: 'Real-time video processing and analysis powered by state-of-the-art CV models.',
    gradient: 'from-blue-600 to-blue-400',
  },
  {
    icon: Zap,
    title: 'Automated Detection',
    description: 'Instantly detect and record attendance without manual intervention or roll calls.',
    gradient: 'from-orange-600 to-orange-400',
  },
  {
    icon: Camera,
    title: 'CCTV & Webcam Integration',
    description: 'Seamlessly integrate with existing camera infrastructure and webcam systems.',
    gradient: 'from-green-600 to-green-400',
  },
  {
    icon: Activity,
    title: 'Real-time Monitoring',
    description: 'Live attendance tracking with instant notifications and activity monitoring.',
    gradient: 'from-pink-600 to-pink-400',
  },
  {
    icon: Shield,
    title: 'Privacy & Security',
    description: 'Enterprise-grade security with encrypted data storage and GDPR compliance.',
    gradient: 'from-indigo-600 to-indigo-400',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-50/50 to-white pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-full text-sm text-purple-700 font-medium mb-6">
            Core Technologies
          </div>
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Powered by Advanced AI
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Cutting-edge computer vision and deep learning technologies for intelligent attendance automation
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -8 }}
                className="group relative"
              >
                <div className="relative p-8 bg-white rounded-3xl border border-gray-200 hover:border-purple-300 transition-all duration-300 shadow-sm hover:shadow-xl">
                  {/* Icon */}
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover gradient effect */}
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
