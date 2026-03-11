'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { SectionWrapper } from './SectionWrapper';

const testimonials = [
  {
    name: 'Dr. Sarah Chen',
    role: 'Dean of Student Affairs',
    organization: 'Stanford University',
    avatar: 'SC',
    rating: 5,
    text: 'AttendAI has transformed how we manage attendance across 200+ classrooms. The accuracy is remarkable, and it saves our faculty countless hours.',
  },
  {
    name: 'Michael Rodriguez',
    role: 'HR Director',
    organization: 'TechCorp Global',
    avatar: 'MR',
    rating: 5,
    text: 'We deployed AttendAI across 15 office locations. The seamless integration with our existing CCTV system made implementation effortless.',
  },
  {
    name: 'Prof. Emily Watson',
    role: 'Department Head',
    organization: 'MIT Computer Science',
    avatar: 'EW',
    rating: 5,
    text: 'As a computer scientist myself, I\'m impressed by the AI architecture. It\'s fast, accurate, and respects student privacy.',
  },
  {
    name: 'James Park',
    role: 'School Principal',
    organization: 'Riverside High School',
    avatar: 'JP',
    rating: 5,
    text: 'Parents love the real-time notifications. We\'ve seen improved attendance rates since implementing AttendAI.',
  },
  {
    name: 'Lisa Thompson',
    role: 'Training Manager',
    organization: 'Global Learning Institute',
    avatar: 'LT',
    rating: 5,
    text: 'Perfect for our certification programs. The automated reports meet all compliance requirements effortlessly.',
  },
  {
    name: 'David Kim',
    role: 'Operations Manager',
    organization: 'Enterprise Solutions Inc',
    avatar: 'DK',
    rating: 5,
    text: 'ROI was evident within the first month. Reduced administrative overhead and eliminated time theft completely.',
  },
];

export function TestimonialsSection() {
  return (
    <SectionWrapper id="testimonials">
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Loved by Thousands
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Hear from institutions and companies using AttendAI
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl hover:bg-white/10 transition-all group"
          >
            {/* Quote Icon */}
            <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Quote className="h-12 w-12 text-purple-400" />
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-1 mb-4">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>

            {/* Testimonial Text */}
            <p className="text-gray-300 leading-relaxed mb-6 relative z-10">
              "{testimonial.text}"
            </p>

            {/* Author Info */}
            <div className="flex items-center space-x-3 relative z-10">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                {testimonial.avatar}
              </div>
              <div>
                <p className="font-semibold text-white">{testimonial.name}</p>
                <p className="text-sm text-gray-400">{testimonial.role}</p>
                <p className="text-xs text-gray-500">{testimonial.organization}</p>
              </div>
            </div>

            {/* Hover border effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />
          </motion.div>
        ))}
      </div>

      {/* Trust Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
      >
        <div>
          <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            10K+
          </p>
          <p className="text-sm text-gray-400">Active Institutions</p>
        </div>
        <div>
          <p className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
            5M+
          </p>
          <p className="text-sm text-gray-400">Daily Attendees</p>
        </div>
        <div>
          <p className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
            99.9%
          </p>
          <p className="text-sm text-gray-400">Uptime SLA</p>
        </div>
        <div>
          <p className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
            4.9/5
          </p>
          <p className="text-sm text-gray-400">Customer Rating</p>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
