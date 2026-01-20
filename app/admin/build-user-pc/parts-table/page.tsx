
import PartsTable from "@/components/admin/partsOptionTable";
import { PART_TYPES } from "@/constants/part";
import { fetchPartOptions } from "@/lib/server/actions/admin/BuildMyPc/partsAction";


export default async function PartsTablePage() {
  const res = await fetchPartOptions(false); 
  const parts = res.success ? res.data : [];

  
  

  return (
    <div className="p-6 space-y-6">

      <PartsTable initialParts={parts} partTypes={PART_TYPES} />
    </div>
  );
}
