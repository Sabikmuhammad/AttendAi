'use client';

import Link from 'next/link';
import { ArrowRight, FileText } from 'lucide-react';

export function ResendHero() {
  return (
    <section className="relative min-h-[600px] sm:min-h-[700px] lg:min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px),
                            linear-gradient(to bottom, white 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }}
        />
        
        {/* Radial Gradient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] lg:w-[800px] lg:h-[800px] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[600px] lg:h-[600px] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center">
          {/* Left Side - Content */}
          <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1]">
              Attendance
              <br />
              <span className="text-gray-400">Without</span>
              <br />
              Roll Calls
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg lg:text-xl text-gray-400 leading-relaxed max-w-lg mx-auto lg:mx-0">
              AttendAI uses advanced AI facial recognition and CCTV cameras to automatically 
              detect and verify student attendance in real time.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Link href="/sign-up" className="w-full sm:w-auto">
                <button className="w-full group px-6 sm:px-8 py-3 sm:py-3.5 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2 text-sm sm:text-base">
                  Get Started
                  <ArrowRight 
                    size={18} 
                    className="group-hover:translate-x-1 transition-transform" 
                  />
                </button>
              </Link>
              
              <Link href="/docs" className="w-full sm:w-auto">
                <button className="w-full px-6 sm:px-8 py-3 sm:py-3.5 bg-white/5 text-white font-medium rounded-lg hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 text-sm sm:text-base">
                  <FileText size={18} />
                  Documentation
                </button>
              </Link>
            </div>

            {/* Stats or Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-6 lg:gap-8 pt-4">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-white">99.9%</div>
                <div className="text-xs sm:text-sm text-gray-500">Accuracy</div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-white">&lt;500ms</div>
                <div className="text-xs sm:text-sm text-gray-500">Detection</div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-white">24/7</div>
                <div className="text-xs sm:text-sm text-gray-500">Monitoring</div>
              </div>
            </div>
          </div>

          {/* Right Side - AI Face Visualization */}
          <div className="relative flex items-center justify-center mt-8 lg:mt-0 order-first lg:order-last">
            {/* Glow Effect Behind Image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-purple-600/30 rounded-full blur-[80px] sm:blur-[100px] animate-pulse-slow" />
            </div>
            
            {/* AI Face Image with Floating Animation */}
            <div className="relative animate-float">
              <div className="relative w-full max-w-[240px] sm:max-w-[320px] lg:max-w-md aspect-square mx-auto">
                {/* Placeholder for AI Face Image */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm border border-white/10" />
                
                {/* Scan Lines Effect */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/10 to-transparent animate-scan" />
                </div>
                
                {/* Grid Overlay */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-20"
                  style={{
                    backgroundImage: `linear-gradient(to right, rgba(139, 92, 246, 0.3) 1px, transparent 1px),
                                    linear-gradient(to bottom, rgba(139, 92, 246, 0.3) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                  }}
                />
                
                {/* Center Content - AI Face Icon/Image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-3 sm:space-y-4">
                    {/* AI Face Icon Placeholder */}
                    <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto rounded-full border-2 sm:border-4 border-purple-500/30 flex items-center justify-center relative">
                      <div className="w-28 h-28 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full border-2 border-purple-500/50 flex items-center justify-center">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-purple-600/20 backdrop-blur-sm flex items-center justify-center">
                          {/* Face Recognition Points */}
                          <svg className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Animated Corner Markers */}
                      <div className="absolute top-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-l-2 border-t-2 border-purple-500 rounded-tl-lg animate-pulse" />
                      <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-r-2 border-t-2 border-purple-500 rounded-tr-lg animate-pulse" />
                      <div className="absolute bottom-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-l-2 border-b-2 border-purple-500 rounded-bl-lg animate-pulse" />
                      <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-r-2 border-b-2 border-purple-500 rounded-br-lg animate-pulse" />
                    </div>
                    
                    {/* Status Text */}
                    <div className="text-purple-400 font-mono text-xs sm:text-sm animate-pulse">
                      SCANNING...
                    </div>
                  </div>
                </div>
                
                {/* Corner Brackets */}
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 w-8 h-8 sm:w-12 sm:h-12 border-l-2 border-t-2 border-purple-500/50" />
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-12 sm:h-12 border-r-2 border-t-2 border-purple-500/50" />
                <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 w-8 h-8 sm:w-12 sm:h-12 border-l-2 border-b-2 border-purple-500/50" />
                <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 w-8 h-8 sm:w-12 sm:h-12 border-r-2 border-b-2 border-purple-500/50" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}
