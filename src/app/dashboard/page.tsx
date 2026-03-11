import { redirect } from 'next/navigation';

/**
 * Dashboard redirect - Authentication disabled
 * Redirects to admin dashboard by default
 */
export default function DashboardRedirect() {
  redirect('/admin/dashboard');
}
