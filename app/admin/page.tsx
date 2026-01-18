import AdminDashboard from "@/components/admin/dashboardSats";
import { getDashboardStats } from "@/lib/server/actions/admin/stats/dashboardStats";


export default async function AdminPage() {
  const stats = await getDashboardStats();

  return <AdminDashboard stats={stats} />;
}

