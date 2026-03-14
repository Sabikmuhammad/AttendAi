'use client';

import { Sparkles, Video, Brain, CheckCircle } from 'lucide-react';

export function SolutionSection() {
  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-black relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] lg:w-[600px] lg:h-[600px] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left - Content */}
          <div className="space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-600/20 border border-purple-600/30 rounded-full text-xs sm:text-sm text-purple-400 font-medium">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              The Solution
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              Meet AttendAI
            </h2>

            <p className="text-base sm:text-lg lg:text-xl text-gray-400 leading-relaxed">
              AttendAI uses advanced AI and computer vision technology to automatically 
              record attendance using existing CCTV cameras. No manual intervention, 
              no queues, no cards—just seamless, accurate attendance tracking.
            </p>

            <div className="space-y-3 sm:space-y-4">
              {[
                'Automatic face detection and recognition',
                'Works with existing CCTV infrastructure',
                'Real-time attendance recording',
                'No physical contact required'
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Visual */}
          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-white/10 p-6 sm:p-8 lg:p-12 flex items-center justify-center">
              <div className="space-y-4 sm:space-y-6 w-full">
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10">
                  <Video className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs sm:text-sm text-white font-medium">CCTV Feed</div>
                    <div className="text-[10px] sm:text-xs text-gray-500">Live Processing</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl text-gray-600">↓</div>
                </div>
                
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10">
                  <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs sm:text-sm text-white font-medium">AI Processing</div>
                    <div className="text-[10px] sm:text-xs text-gray-500">Face Recognition</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl text-gray-600">↓</div>
                </div>
                
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 rounded-lg border border-green-600/20">
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs sm:text-sm text-white font-medium">Attendance Recorded</div>
                    <div className="text-[10px] sm:text-xs text-gray-500">Automatic</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
