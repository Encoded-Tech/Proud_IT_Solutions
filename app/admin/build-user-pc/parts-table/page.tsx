
import PartsTable from "@/components/admin/partsOptionTable";
import { fetchPartOptions, fetchPartTypes } from "@/lib/server/actions/admin/BuildMyPc/partsAction";


export default async function PartsTablePage() {
  const res = await fetchPartOptions(false); 
  const parts = res.success ? res.data : [];

  const resType = await fetchPartTypes(false);
  const partTypes = resType.success ? resType.data : [];

  return (
    <div className="p-6 space-y-6">

      <PartsTable initialParts={parts} partTypes={partTypes} />
    </div>
  );
}
