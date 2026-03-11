'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileCheck } from 'lucide-react';
import { SectionWrapper } from './SectionWrapper';

const securityFeatures = [
  {
    icon: Shield,
    title: 'GDPR Compliant',
    description: 'Fully compliant with GDPR, CCPA, and international data protection regulations.',
  },
  {
    icon: Lock,
    title: 'End-to-End Encryption',
    description: '256-bit AES encryption for all data in transit and at rest.',
  },
  {
    icon: Eye,
    title: 'Privacy-First Design',
    description: 'Facial embeddings are encrypted and never stored as images.',
  },
  {
    icon: FileCheck,
    title: 'SOC 2 Certified',
    description: 'Enterprise-grade security audited and certified by third parties.',
  },
];

export function SecuritySection() {
  return (
    <SectionWrapper id="security">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Enterprise-Grade Security
            </span>
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Your data security and privacy are our top priorities. AttendAI is built with security-first architecture.
          </p>

          <div className="space-y-6">
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-start space-x-4"
              >
                <div className="flex-shrink-0">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Visual */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
            {/* Shield Icon with glow */}
            <div className="relative mb-8">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 blur-3xl opacity-50"
              />
              <div className="relative flex items-center justify-center">
                <Shield className="h-32 w-32 text-green-400" strokeWidth={1} />
              </div>
            </div>

            {/* Security Badges */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                <Lock className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-white">256-bit</p>
                <p className="text-xs text-gray-400">Encryption</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                <Shield className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-white">SOC 2</p>
                <p className="text-xs text-gray-400">Certified</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                <FileCheck className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-white">GDPR</p>
                <p className="text-xs text-gray-400">Compliant</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                <Eye className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-white">Privacy</p>
                <p className="text-xs text-gray-400">First</p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <p className="text-sm text-gray-300 text-center">
                Regular security audits • Penetration tested • Bug bounty program
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
