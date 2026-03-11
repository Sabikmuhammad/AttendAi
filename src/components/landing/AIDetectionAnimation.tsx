'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export function AIDetectionAnimation() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [confidence, setConfidence] = useState(0);

  useEffect(() => {
    const detectTimer = setTimeout(() => {
      setIsDetecting(true);
      // Animate confidence from 0 to 96
      let current = 0;
      const interval = setInterval(() => {
        current += 4;
        if (current >= 96) {
          setConfidence(96);
          clearInterval(interval);
        } else {
          setConfidence(current);
        }
      }, 30);
    }, 500);

    return () => clearTimeout(detectTimer);
  }, []);

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Student Image Container */}
      <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 shadow-2xl border border-purple-200">
        {/* Placeholder for student image - replace with actual image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 rounded-full bg-gradient-to-br from-purple-200 to-purple-300 flex items-center justify-center">
            <svg
              className="w-24 h-24 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        </div>

        {/* Scanning Grid Effect */}
        <AnimatePresence>
          {isDetecting && (
            <>
              <motion.div
                initial={{ top: 0, opacity: 0 }}
                animate={{ top: '100%', opacity: [0, 1, 1, 0] }}
                transition={{ duration: 2, ease: 'linear', repeat: Infinity }}
                className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"
                style={{ boxShadow: '0 0 20px rgba(147, 51, 234, 0.5)' }}
              />

              {/* Corner Brackets */}
              {[
                'top-6 left-6',
                'top-6 right-6',
                'bottom-6 left-6',
                'bottom-6 right-6',
              ].map((position, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className={`absolute ${position}`}
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    className="text-purple-600"
                  >
                    <path
                      d={
                        i === 0
                          ? 'M8 0H0V8M0 0H8V8'
                          : i === 1
                          ? 'M24 0H32V8M32 0H24V8'
                          : i === 2
                          ? 'M8 32H0V24M0 32H8V24'
                          : 'M24 32H32V24M32 32H24V24'
                      }
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </motion.div>
              ))}

              {/* Face Detection Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-purple-600 rounded-lg"
                style={{ boxShadow: '0 0 30px rgba(147, 51, 234, 0.3)' }}
              />

              {/* Detection Label */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-md px-6 py-3 rounded-full shadow-xl border border-purple-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900">Student Detected</p>
                    <p className="text-purple-600 font-medium">Sabik</p>
                  </div>
                </div>
              </motion.div>

              {/* Confidence Score */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-md px-6 py-3 rounded-full shadow-xl border border-purple-200"
              >
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="text-sm">
                    <p className="text-gray-600 font-medium">Confidence:</p>
                    <p className="text-purple-600 font-bold text-lg">{confidence}%</p>
                  </div>
                </div>
              </motion.div>

              {/* Scanning Data Points */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                  transition={{
                    delay: 0.8 + i * 0.1,
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                  className="absolute w-2 h-2 bg-purple-600 rounded-full"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
