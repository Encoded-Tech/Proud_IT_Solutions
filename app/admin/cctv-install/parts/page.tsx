import CctvPartsTable from "@/components/admin/cctv-parts-table";
import { fetchCctvPartsAdmin } from "@/lib/server/actions/admin/cctv/cctvAdminActions";
import { connection } from "next/server";

export default async function AdminCctvPartsPage() {
  await connection();
  const result = await fetchCctvPartsAdmin(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-950">CCTV Install Items</h1>
        <p className="mt-1 text-sm text-slate-500">
          Add, edit and activate CCTV package items for the public builder.
        </p>
      </div>
      <CctvPartsTable initialParts={result.data} />
    </div>
  );
}
