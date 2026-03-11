'use client';

import { motion } from 'framer-motion';
import { Camera, CheckCircle2, Clock, Users } from 'lucide-react';
import { SectionWrapper } from './SectionWrapper';
import { useEffect, useState } from 'react';

const attendanceLog = [
  { id: 1, name: 'John Smith', time: '09:00:15', status: 'present' },
  { id: 2, name: 'Sarah Johnson', time: '09:00:18', status: 'present' },
  { id: 3, name: 'Michael Chen', time: '09:00:22', status: 'present' },
  { id: 4, name: 'Emma Davis', time: '09:00:25', status: 'present' },
];

export function LiveDemoSection() {
  const [activeLog, setActiveLog] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLog((prev) => (prev + 1) % attendanceLog.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SectionWrapper id="demo">
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              See AI in Action
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Watch how AttendAI processes CCTV feeds in real-time
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Camera Feed Simulation */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative aspect-video backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Camera Header */}
          <div className="absolute top-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-4 z-10 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Camera className="h-5 w-5 text-cyan-400" />
                <span className="text-sm font-medium text-white">Camera 01</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-xs text-gray-400">LIVE</span>
              </div>
            </div>
          </div>

          {/* Simulated Camera View */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
            
            {/* Face detection boxes */}
            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-1/4 left-1/4 w-32 h-40 border-2 border-cyan-400 rounded-lg"
            >
              <div className="absolute -top-6 left-0 bg-cyan-500 text-black text-xs font-bold px-2 py-1 rounded">
                John Smith - 98%
              </div>
            </motion.div>

            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              className="absolute top-1/3 right-1/4 w-32 h-40 border-2 border-purple-400 rounded-lg"
            >
              <div className="absolute -top-6 right-0 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded">
                Sarah Johnson - 99%
              </div>
            </motion.div>

            {/* Scanning animation */}
            <motion.div
              animate={{
                y: ['-100%', '100%'],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30"
            />
          </div>

          {/* Stats Overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs z-10">
            <div className="backdrop-blur-sm bg-black/50 px-3 py-2 rounded-lg border border-white/10">
              <span className="text-gray-400">Detected: </span>
              <span className="text-cyan-400 font-bold">4 faces</span>
            </div>
            <div className="backdrop-blur-sm bg-black/50 px-3 py-2 rounded-lg border border-white/10">
              <span className="text-gray-400">Processing: </span>
              <span className="text-green-400 font-bold">0.15s</span>
            </div>
          </div>
        </motion.div>

        {/* Attendance Log */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white flex items-center">
              <CheckCircle2 className="h-6 w-6 text-green-400 mr-2" />
              Attendance Log
            </h3>
            <div className="text-sm text-gray-400 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Real-time
            </div>
          </div>

          <div className="space-y-3">
            {attendanceLog.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: index <= activeLog ? 1 : 0.3,
                  x: 0,
                  scale: index === activeLog ? 1.02 : 1,
                }}
                transition={{ duration: 0.3 }}
                className={`p-4 rounded-xl transition-all ${
                  index === activeLog
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-2 border-cyan-500/50'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                      {log.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{log.name}</p>
                      <p className="text-xs text-gray-400">{log.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                    <span className="text-sm text-green-400 font-medium">Present</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Users className="h-5 w-5 text-cyan-400" />
              </div>
              <p className="text-2xl font-bold text-white">24</p>
              <p className="text-xs text-gray-400">Total</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white">22</p>
              <p className="text-xs text-gray-400">Present</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Clock className="h-5 w-5 text-orange-400" />
              </div>
              <p className="text-2xl font-bold text-white">2</p>
              <p className="text-xs text-gray-400">Absent</p>
            </div>
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
