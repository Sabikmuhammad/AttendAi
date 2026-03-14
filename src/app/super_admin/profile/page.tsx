import { redirect } from 'next/navigation';

export default function LegacySuperAdminProfilePage() {
  redirect('/super-admin/dashboard');
}
