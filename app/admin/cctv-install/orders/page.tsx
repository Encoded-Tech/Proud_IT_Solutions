import CctvRequestsAdminTable from "@/components/admin/cctv-requests-table";
import { adminGetCctvInstallationRequests } from "@/lib/server/actions/admin/cctv/cctvAdminActions";
import Link from "next/link";
import { connection } from "next/server";

export default async function AdminCctvOrdersPage() {
  await connection();
  const result = await adminGetCctvInstallationRequests({ limit: 50 });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">CCTV Installation Orders</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review, schedule and update CCTV installation requests.
          </p>
        </div>
        <Link
          href="/admin/cctv-install/parts"
          className="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-700"
        >
          Manage CCTV Items
        </Link>
      </div>
      <CctvRequestsAdminTable initialRequests={result.data} />
    </div>
  );
}
