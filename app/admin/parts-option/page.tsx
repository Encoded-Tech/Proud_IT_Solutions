// app/admin/build-my-pc/parts-option/page.tsx
import { fetchPartOptions } from "@/lib/server/actions/admin/BuildMyPc/partsAction";
import PartForm from "./parts-option-form";

import { PartOptionInput } from "@/lib/server/actions/admin/BuildMyPc/partsAction";
import PartsTable from "./partsOptionTable";

type PartForClient = PartOptionInput & {
  _id?: string;
  image?: string; // for client display
};

export default async function PartsAdminPage() {
  const res = await fetchPartOptions(false); // fetch all parts (active & inactive)

  // Minimal transformation: just rename imageUrl → image for client
  const parts: PartForClient[] = res.success
    ? res.data.map((p) => ({
        ...p,
        image: p.imageUrl || undefined,
        type: p.type as PartOptionInput["type"], // ensure type matches client union
      }))
    : [];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Parts Management</h1>

      {/* Form to create new part */}
      <PartForm />

      {/* Table to view/update/delete */}
      <PartsTable initialParts={parts} />
    </div>
  );
}
