
import { fetchPartOptions } from "@/lib/server/actions/admin/BuildMyPc/partsAction";
import PartsTable from "../../parts-option/partsOptionTable";

export default async function PartsTablePage() {
  const res = await fetchPartOptions(false); 
  const parts = res.success ? res.data : [];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Parts Table</h1>
      <PartsTable initialParts={parts} />
    </div>
  );
}
