import CctvRequestsTable from "@/components/client/CctvRequestsTable";
import { fetchMyCctvInstallationRequests } from "@/lib/server/fetchers/fetchCctv";
import Link from "next/link";
import { connection } from "next/server";

export default async function CctvInstallationsPage() {
  await connection();
  const result = await fetchMyCctvInstallationRequests();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">CCTV Installations</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track CCTV installation requests and selected package items.
          </p>
        </div>
        <Link
          href="/install-cctv"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
        >
          Start CCTV Setup
        </Link>
      </div>

      <CctvRequestsTable requests={result.data} />
    </div>
  );
}
