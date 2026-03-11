'use client';

import { motion } from 'framer-motion';
import { Eye, Cpu, Layers, BarChart3, Lock, Zap } from 'lucide-react';
import { SectionWrapper } from './SectionWrapper';

const technologies = [
  {
    icon: Eye,
    title: 'Computer Vision',
    description: 'Deep learning models trained on millions of faces',
    specs: ['OpenCV', 'YOLO v8', 'CNN'],
  },
  {
    icon: Cpu,
    title: 'Face Recognition',
    description: 'State-of-the-art facial recognition algorithms',
    specs: ['FaceNet', 'ArcFace', 'DeepFace'],
  },
  {
    icon: Layers,
    title: 'Edge Processing',
    description: 'Low-latency processing at the edge',
    specs: ['TensorRT', 'ONNX', 'Edge TPU'],
  },
  {
    icon: BarChart3,
    title: 'Cloud Analytics',
    description: 'Scalable cloud infrastructure for analytics',
    specs: ['AWS', 'Real-time DB', 'ML Ops'],
  },
];

export function TechnologySection() {
  return (
    <SectionWrapper id="technology" className="bg-black/30">
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Powered by Advanced AI
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Built on cutting-edge artificial intelligence and computer vision technology
          </p>
        </motion.div>
      </div>

      {/* Technology Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {technologies.map((tech, index) => (
          <motion.div
            key={tech.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl hover:bg-white/10 transition-all group"
          >
            {/* Icon */}
            <div className="relative mb-4 inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity rounded-xl" />
              <div className="relative p-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl">
                <tech.icon className="h-6 w-6 text-white" />
              </div>
            </div>

            {/* Content */}
            <h3 className="text-lg font-bold text-white mb-2">
              {tech.title}
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              {tech.description}
            </p>

            {/* Specs */}
            <div className="flex flex-wrap gap-2">
              {tech.specs.map((spec) => (
                <span
                  key={spec}
                  className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400"
                >
                  {spec}
                </span>
              ))}
            </div>

            {/* Hover border */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none" />
          </motion.div>
        ))}
      </div>

      {/* Architecture Diagram */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative max-w-4xl mx-auto"
      >
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            System Architecture
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Input */}
            <div className="relative">
              <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 rounded-xl p-6 text-center">
                <Eye className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                <h4 className="font-semibold text-white mb-2">Input Layer</h4>
                <p className="text-sm text-gray-400">CCTV Camera Feeds</p>
              </div>
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500"
              />
            </div>

            {/* Processing */}
            <div className="relative">
              <div className="backdrop-blur-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/30 rounded-xl p-6 text-center">
                <Cpu className="h-8 w-8 text-cyan-400 mx-auto mb-3" />
                <h4 className="font-semibold text-white mb-2">Processing</h4>
                <p className="text-sm text-gray-400">AI Recognition Engine</p>
              </div>
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gradient-to-r from-cyan-500 to-green-500"
              />
            </div>

            {/* Output */}
            <div className="relative">
              <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 rounded-xl p-6 text-center">
                <BarChart3 className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <h4 className="font-semibold text-white mb-2">Output Layer</h4>
                <p className="text-sm text-gray-400">Attendance Records</p>
              </div>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Zap className="h-5 w-5 text-yellow-400" />
              </div>
              <p className="text-2xl font-bold text-white">0.15s</p>
              <p className="text-xs text-gray-400">Processing Time</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <BarChart3 className="h-5 w-5 text-cyan-400" />
              </div>
              <p className="text-2xl font-bold text-white">99.9%</p>
              <p className="text-xs text-gray-400">Accuracy Rate</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Layers className="h-5 w-5 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">100+</p>
              <p className="text-xs text-gray-400">Concurrent Cams</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Lock className="h-5 w-5 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white">256-bit</p>
              <p className="text-xs text-gray-400">Encryption</p>
            </div>
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
