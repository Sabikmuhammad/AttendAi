'use client';

import { motion } from 'framer-motion';
import { SectionWrapper } from './SectionWrapper';

const institutions = [
  { name: 'Stanford University', logo: 'SU' },
  { name: 'MIT', logo: 'MIT' },
  { name: 'Google', logo: 'G' },
  { name: 'Microsoft', logo: 'MS' },
  { name: 'Harvard', logo: 'HU' },
  { name: 'Yale', logo: 'YU' },
];

export function TrustedBySection() {
  return (
    <SectionWrapper className="py-16">
      <div className="text-center mb-12">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-sm uppercase tracking-wider text-gray-500"
        >
          Trusted by Leading Institutions
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative overflow-hidden"
      >
        {/* Gradient overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent z-10" />

        <motion.div
          animate={{
            x: [0, -1000],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: 20,
              ease: 'linear',
            },
          }}
          className="flex space-x-16"
        >
          {[...institutions, ...institutions].map((institution, index) => (
            <div
              key={`${institution.name}-${index}`}
              className="flex items-center justify-center min-w-[200px]"
            >
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  {institution.logo}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </SectionWrapper>
  );
}
