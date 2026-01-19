import AdminDashboard from "@/components/admin/dashboardSats";
import { requireAdmin } from "@/lib/auth/requireSession";
import { getDashboardStats } from "@/lib/server/actions/admin/stats/dashboardStats";


export default async function AdminPage() {
  await requireAdmin();
  const stats = await getDashboardStats();

  return <AdminDashboard stats={stats} />;
}

