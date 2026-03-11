'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function ResendCTA() {
  return (
    <section className="py-32 bg-black relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
          Ready to get started?
        </h2>
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
          Join modern institutions using AttendAI to automate their attendance tracking with facial recognition.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/sign-up">
            <button className="group px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
              Get Started for Free
              <ArrowRight 
                size={20} 
                className="group-hover:translate-x-1 transition-transform" 
              />
            </button>
          </Link>
          
          <Link href="#docs">
            <button className="px-8 py-4 bg-white/5 text-white font-semibold rounded-lg hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all">
              View Documentation
            </button>
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 pt-16 border-t border-white/10">
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-white mb-2">50K+</div>
              <div className="text-sm text-gray-500">Students Tracked</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">500+</div>
              <div className="text-sm text-gray-500">Institutions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">99.9%</div>
              <div className="text-sm text-gray-500">Accuracy</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
