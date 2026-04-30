
import PartsTable from "@/components/admin/partsOptionTable";
import { PART_TYPES } from "@/constants/part";
import { fetchPartOptions } from "@/lib/server/actions/admin/BuildMyPc/partsAction";
import { connection } from "next/server";

export default async function PartsTablePage() {
  await connection();
  const res = await fetchPartOptions(false); 
  const parts = res.success ? res.data : [];

  
  

  return (
    <div className="p-6 space-y-6">

      <PartsTable initialParts={parts} partTypes={PART_TYPES} />
    </div>
  );
}
