'use client';

import Link from 'next/link';
import { ArrowRight, MessageSquare } from 'lucide-react';

export function ResendCTA() {
  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-black relative overflow-hidden border-t border-white/10">
      {/* Background Glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] lg:w-[600px] lg:h-[600px] bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6">
          Start Automating
          <br className="hidden sm:block" />
          <span className="sm:hidden"> </span>
          Attendance Today
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-gray-400 mb-8 sm:mb-12 max-w-2xl mx-auto">
          Deploy AttendAI and transform how attendance works at your institution.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link href="/sign-up">
            <button className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2 text-sm sm:text-base">
              Get Started
              <ArrowRight 
                size={18} 
                className="group-hover:translate-x-1 transition-transform sm:w-5 sm:h-5" 
              />
            </button>
          </Link>
          
          <Link href="#contact">
            <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/5 text-white font-semibold rounded-lg hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 text-sm sm:text-base">
              <MessageSquare size={18} className="sm:w-5 sm:h-5" />
              Request Demo
            </button>
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 sm:mt-16 pt-12 sm:pt-16 border-t border-white/10">
          <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">50K+</div>
              <div className="text-xs sm:text-sm text-gray-500">Students Tracked</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">500+</div>
              <div className="text-xs sm:text-sm text-gray-500">Institutions</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">99.9%</div>
              <div className="text-xs sm:text-sm text-gray-500">Accuracy</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
