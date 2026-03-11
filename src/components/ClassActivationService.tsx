'use client';

import { useEffect } from 'react';

/**
 * Background service component to automatically activate classes
 * This runs on the client side and calls the auto-activate API every minute
 */
export function ClassActivationService() {
  useEffect(() => {
    // Initial call
    activateClasses();

    // Set up interval to check every 30 seconds
    const interval = setInterval(activateClasses, 30000);

    return () => clearInterval(interval);
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

  // This component doesn't render anything
  return null;
}
