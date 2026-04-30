'use client';

import { motion } from 'framer-motion';
import { Eye, Video, Zap, Camera, Activity, Shield } from 'lucide-react';

const features = [
  {
    icon: Eye,
    title: 'AI Identifies Students Instantly',
    description: 'Automatically recognize students in real time without manual attendance.',
    gradient: 'from-purple-600 to-purple-400',
  },
  {
    icon: Video,
    title: 'Works With Any Camera',
    description: 'Use existing CCTV or webcams without changing your infrastructure.',
    gradient: 'from-blue-600 to-blue-400',
  },
  {
    icon: Zap,
    title: 'Fully Automatic Attendance',
    description: 'No roll calls. Attendance is recorded instantly when class starts.',
    gradient: 'from-orange-600 to-orange-400',
  },
  {
    icon: Camera,
    title: 'Easy Classroom Setup',
    description: 'Connect cameras to classes in minutes with a simple setup flow.',
    gradient: 'from-green-600 to-green-400',
  },
  {
    icon: Activity,
    title: 'Live Attendance Dashboard',
    description: 'Monitor attendance in real time with actionable insights.',
    gradient: 'from-pink-600 to-pink-400',
  },
  {
    icon: Shield,
    title: 'Secure & Institution-Ready',
    description: 'Role-based access, data isolation, and secure infrastructure.',
    gradient: 'from-indigo-600 to-indigo-400',
  },
];

export function NewFeaturesSection() {
  return (
    <section className="py-32 bg-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(120,119,198,0.15),transparent_60%)]" />
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-purple-400 font-medium mb-6">
            Everything You Need
          </div>
          <h2 className="text-5xl font-bold text-white mb-6">
            Replace Manual Attendance With AI — Completely
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need to automate attendance across classrooms, departments, and institutions.
          </p>
          <div className="flex justify-center gap-8 mt-6 text-sm text-gray-500">
            <div><span className="font-bold text-white">99.9%</span> Accuracy</div>
            <div><span className="font-bold text-white">&lt;500ms</span> Detection</div>
            <div><span className="font-bold text-white">24/7</span> Monitoring</div>
          </div>
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
                <div className="relative p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 hover:border-white/20 transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-2 group-hover:bg-gradient-to-br group-hover:from-purple-500/10 group-hover:to-transparent">
                  {/* Icon */}
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
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
