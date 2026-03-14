'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

function getProfileRouteByRole(role?: string): string {
  switch (role) {
    case 'student':
      return '/student/profile';
    case 'faculty':
      return '/faculty/profile';
    case 'admin':
    case 'institution_admin':
    case 'department_admin':
      return '/admin/profile';
    case 'super_admin':
      return '/super-admin/dashboard';
    default:
      return '/login';
  }
}

export default function ProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    const fetchAndRedirect = async () => {
      try {
        const response = await fetch('/api/profile');
        const data = await response.json();

        if (data.success) {
          const userRole = data.profile.role;
          router.replace(getProfileRouteByRole(userRole));
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
