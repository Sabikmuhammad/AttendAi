'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { AIDetectionAnimation } from './AIDetectionAnimation';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white via-purple-50/30 to-white">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 2 }}
          className="absolute top-1/4 -left-1/4 w-96 h-96 bg-purple-400 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-purple-400 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-full text-sm text-purple-700 font-medium"
          >
            <span className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
            Powered by Deep Learning & Computer Vision
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl lg:text-7xl font-bold tracking-tight"
          >
            <span className="text-gray-900">AI-Powered</span>
            <br />
            <span className="gradient-text">Smart Classroom</span>
            <br />
            <span className="text-gray-900">Attendance</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600 leading-relaxed max-w-xl"
          >
            Transform attendance tracking with cutting-edge{' '}
            <span className="font-semibold text-purple-600">computer vision</span>,{' '}
            <span className="font-semibold text-purple-600">deep learning</span>, and{' '}
            <span className="font-semibold text-purple-600">video analytics</span>.
            Real-time face recognition for automated classroom attendance.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/role">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-purple-600 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 hover:bg-purple-700 transition-colors"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-white text-gray-900 rounded-2xl font-semibold flex items-center justify-center gap-2 border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-colors"
            >
              <Play className="w-5 h-5" />
              View Demo
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex gap-8 pt-8 border-t border-gray-200"
          >
            <div>
              <p className="text-3xl font-bold text-gray-900">99.9%</p>
              <p className="text-sm text-gray-600">Accuracy</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">&lt;2s</p>
              <p className="text-sm text-gray-600">Detection Time</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">24/7</p>
              <p className="text-sm text-gray-600">Monitoring</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right - AI Detection Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="relative"
        >
          <AIDetectionAnimation />

          {/* Floating Tech Badges */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.5 }}
            className="absolute -left-4 top-1/4 bg-white px-4 py-2 rounded-xl shadow-lg border border-gray-200"
          >
            <p className="text-xs text-gray-500">Technology</p>
            <p className="font-semibold text-gray-900">Deep Learning</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.7 }}
            className="absolute -right-4 bottom-1/4 bg-white px-4 py-2 rounded-xl shadow-lg border border-gray-200"
          >
            <p className="text-xs text-gray-500">Processing</p>
            <p className="font-semibold text-gray-900">Real-time</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
