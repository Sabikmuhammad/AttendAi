'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    const fetchAndRedirect = async () => {
      try {
        const response = await fetch('/api/profile');
        const data = await response.json();

        if (data.success) {
          const userRole = data.profile.role;
          router.replace(`/${userRole}/profile`);
        } else {
          router.replace('/login');
        }
      } catch (error) {
        console.error('Error:', error);
        router.replace('/login');
      }
    };

    fetchAndRedirect();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
