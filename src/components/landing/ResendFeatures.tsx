'use client';

import { Eye, Video, Zap, Camera, Activity, Shield } from 'lucide-react';

const features = [
  {
    icon: Eye,
    title: 'Deep Face Recognition',
    description: 'Advanced neural networks for accurate student identification with 99.9% precision.',
  },
  {
    icon: Video,
    title: 'Computer Vision Analytics',
    description: 'Real-time video processing and analysis powered by state-of-the-art CV models.',
  },
  {
    icon: Zap,
    title: 'Automated Detection',
    description: 'Instantly detect and record attendance without manual intervention or roll calls.',
  },
  {
    icon: Camera,
    title: 'CCTV & Webcam Integration',
    description: 'Seamlessly integrate with existing camera infrastructure and webcam systems.',
  },
  {
    icon: Activity,
    title: 'Real-time Monitoring',
    description: 'Live attendance tracking with instant notifications and activity monitoring.',
  },
  {
    icon: Shield,
    title: 'Privacy & Security',
    description: 'Enterprise-grade security with encrypted data storage and GDPR compliance.',
  },
];

export function ResendFeatures() {
  return (
    <section id="features" className="py-32 bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px),
                            linear-gradient(to bottom, white 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto px-4">
            Everything you need to automate attendance tracking with AI-powered facial recognition
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-purple-600/20 flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-purple-600/30 transition-colors">
                <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
