import { isAdmin } from '@/lib/admin-auth';
import AdminLogin from '@/components/admin/admin-login';
import AdminDashboard from '@/components/admin/admin-layout';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const admin = await isAdmin();
  if (!admin) return <AdminLogin />;
  return <AdminDashboard />;
}
