'use client';

import { useEffect } from 'react';

/**
 * Background service component to:
 * 1. Automatically activate classes when their start time arrives
 * 2. Auto-start monitoring for CCTV (production mode) classes
 * 3. Complete classes when their end time arrives
 * 
 * Runs every 30 seconds on the client side
 */
export function ClassActivationService() {
  useEffect(() => {
    // Initial calls
    activateClasses();
    autoStartMonitoring();

    // Set up intervals
    const activateInterval = setInterval(activateClasses, 30000); // Every 30 seconds
    const monitorInterval = setInterval(autoStartMonitoring, 30000); // Every 30 seconds

    return () => {
      clearInterval(activateInterval);
      clearInterval(monitorInterval);
    };
  }, []);

  const activateClasses = async () => {
    try {
      const response = await fetch('/api/classes/auto-activate', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success && data.activated > 0) {
        console.log(`✅ Activated ${data.activated} class(es)`);
        
        // Optionally show a notification
        if ('Notification' in window && Notification.permission === 'granted') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data.activatedClasses.forEach((cls: any) => {
            new Notification('Class Activated', {
              body: `${cls.courseName} is now active`,
              icon: '/icon.png',
            });
          });
        }
      }
      
      if (data.success && data.completed > 0) {
        console.log(`✅ Completed ${data.completed} class(es)`);
      }
    } catch (error) {
      console.error('Error activating classes:', error);
    }
  };

  const autoStartMonitoring = async () => {
    try {
      const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000';
      
      // Get all active classes
      const classesResponse = await fetch('/api/classes?status=active');
      const classesData = await classesResponse.json();
      
      if (!classesData.success || !classesData.classes) {
        return;
      }

      // Filter for production mode classes with autoMonitoring enabled
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cctvClasses = classesData.classes.filter((cls: any) => 
        cls.monitoringMode === 'production' && 
        cls.autoMonitoring === true &&
        cls.rtspUrl
      );

      if (cctvClasses.length === 0) {
        return;
      }

      // Check which ones are already being monitored
      for (const cls of cctvClasses) {
        try {
          const statusResponse = await fetch(`${AI_SERVICE_URL}/monitor/status/${cls._id}`);
          const statusData = await statusResponse.json();

          // If not monitoring yet, start it
          if (!statusData.monitoring_active) {
            console.log(`🎥 Auto-starting CCTV monitoring for: ${cls.courseName}`);
            
            const startResponse = await fetch(`${AI_SERVICE_URL}/monitor/start`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                classId: cls._id,
                mode: 'production',
                rtspUrl: cls.rtspUrl
              })
            });

            const startData = await startResponse.json();
            
            if (startData.success) {
              console.log(`✅ CCTV monitoring started for: ${cls.courseName}`);
              
              // Show notification
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('CCTV Monitoring Started', {
                  body: `Automatic monitoring active for ${cls.courseName}`,
                  icon: '/icon.png',
                });
              }
            } else {
              console.error(`❌ Failed to start monitoring for ${cls.courseName}:`, startData.message);
            }
          }
        } catch (error) {
          console.error(`Error checking/starting monitoring for ${cls.courseName}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in auto-start monitoring:', error);
    }
  };

  // This component doesn't render anything
  return null;
}
