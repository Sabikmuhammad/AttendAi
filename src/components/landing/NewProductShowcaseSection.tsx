'use client';

import { motion } from 'framer-motion';
import { Camera, BarChart3, Users, ArrowRight } from 'lucide-react';
import Image from 'next/image';

const showcases = [
  {
    title: 'Camera Monitoring Dashboard',
    description: 'Real-time camera feed with AI-powered face detection and live attendance tracking.',
    icon: Camera,
    features: ['Live Video Feed', 'Face Detection Overlay', 'Student Recognition', 'Instant Notifications'],
    gradient: 'from-purple-600 to-purple-400',
  },
  {
    title: 'Attendance Analytics',
    description: 'Comprehensive analytics dashboard with attendance trends, patterns, and insights.',
    icon: BarChart3,
    features: ['Attendance Reports', 'Trend Analysis', 'Visual Charts', 'Export Options'],
    gradient: 'from-blue-600 to-blue-400',
  },
  {
    title: 'Student Management',
    description: 'Manage student profiles, enrollment, face registration, and attendance history.',
    icon: Users,
    features: ['Profile Management', 'Face Registration', 'Attendance History', 'Performance Metrics'],
    gradient: 'from-orange-600 to-orange-400',
  },
];

export function ProductShowcaseSection() {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
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
            Product Preview
          </div>
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive dashboards designed for students, faculty, and administrators
          </p>
        </motion.div>

        {/* Showcase Cards */}
        <div className="space-y-32">
          {showcases.map((showcase, index) => {
            const Icon = showcase.icon;
            const isEven = index % 2 === 0;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.7 }}
                className={`grid lg:grid-cols-2 gap-12 items-center ${isEven ? '' : 'lg:grid-flow-dense'}`}
              >
                {/* Content */}
                <div className={isEven ? '' : 'lg:col-start-2'}>
                  <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${showcase.gradient} mb-6`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-4xl font-bold text-gray-900 mb-4">
                    {showcase.title}
                  </h3>

                  <p className="text-lg text-gray-600 mb-8">
                    {showcase.description}
                  </p>

                  {/* Features List */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {showcase.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${showcase.gradient}`} />
                        <span className="text-sm text-gray-700 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* UI Preview Placeholder */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.7 }}
                  className={isEven ? '' : 'lg:col-start-1 lg:row-start-1'}
                >
                  <div className={`relative aspect-video rounded-3xl bg-gradient-to-br ${showcase.gradient} p-1 shadow-2xl`}>
                    <div className="w-full h-full bg-white rounded-3xl p-8 flex items-center justify-center">
                      {/* Placeholder for actual dashboard screenshot */}
                      <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center border border-gray-200">
                        <div className="text-center">
                          <Icon className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${showcase.gradient} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent', backgroundClip: 'text' }} />
                          <p className="text-gray-400 font-medium">Dashboard Preview</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="absolute -bottom-6 -right-6 bg-white px-6 py-4 rounded-2xl shadow-xl border border-gray-200"
                  >
                    <p className="text-sm text-gray-600">Active Users</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">1,200+</p>
                  </motion.div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
