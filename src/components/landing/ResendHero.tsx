'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, FileText } from 'lucide-react';

export function ResendHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Content */}
          <div className="space-y-8">
            {/* Headline */}
            <h1 className="text-5xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1]">
              Attendance
              <br />
              <span className="text-gray-400">Without</span>
              <br />
              Roll Calls
            </h1>

            {/* Subtext */}
            <p className="text-lg lg:text-xl text-gray-400 leading-relaxed max-w-lg">
              AttendAI uses advanced AI facial recognition and CCTV cameras to automatically 
              detect and verify student attendance in real time.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/sign-up">
                <button className="group px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                  Get Started
                  <ArrowRight 
                    size={18} 
                    className="group-hover:translate-x-1 transition-transform" 
                  />
                </button>
              </Link>
              
              <Link href="#docs">
                <button className="px-6 py-3 bg-white/5 text-white font-medium rounded-lg hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2">
                  <FileText size={18} />
                  Documentation
                </button>
              </Link>
            </div>

            {/* Stats or Trust Indicators */}
            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-2xl font-bold text-white">99.9%</div>
                <div className="text-sm text-gray-500">Accuracy</div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <div className="text-2xl font-bold text-white">&lt;500ms</div>
                <div className="text-sm text-gray-500">Detection</div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-sm text-gray-500">Monitoring</div>
              </div>
            </div>
          </div>

          {/* Right Side - AI Face Visualization */}
          <div className="relative flex items-center justify-center">
            {/* Glow Effect Behind Image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-96 h-96 bg-purple-600/30 rounded-full blur-[100px] animate-pulse-slow" />
            </div>
            
            {/* AI Face Image with Floating Animation */}
            <div className="relative animate-float">
              <div className="relative w-full max-w-md aspect-square">
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
                  <div className="text-center space-y-4">
                    {/* AI Face Icon Placeholder */}
                    <div className="w-48 h-48 mx-auto rounded-full border-4 border-purple-500/30 flex items-center justify-center relative">
                      <div className="w-40 h-40 rounded-full border-2 border-purple-500/50 flex items-center justify-center">
                        <div className="w-32 h-32 rounded-full bg-purple-600/20 backdrop-blur-sm flex items-center justify-center">
                          {/* Face Recognition Points */}
                          <svg className="w-24 h-24 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Animated Corner Markers */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-purple-500 rounded-tl-lg animate-pulse" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-purple-500 rounded-tr-lg animate-pulse" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-purple-500 rounded-bl-lg animate-pulse" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-purple-500 rounded-br-lg animate-pulse" />
                    </div>
                    
                    {/* Status Text */}
                    <div className="text-purple-400 font-mono text-sm animate-pulse">
                      SCANNING...
                    </div>
                  </div>
                </div>
                
                {/* Corner Brackets */}
                <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-purple-500/50" />
                <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-purple-500/50" />
                <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-purple-500/50" />
                <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-purple-500/50" />
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
