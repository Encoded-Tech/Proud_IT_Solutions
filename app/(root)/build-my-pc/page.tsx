

import BuildClient from "@/components/client/BuildClient";
import { fetchPartOptions } from "@/lib/server/actions/admin/BuildMyPc/partsAction";



export default async function BuildPage() {
  const result = await fetchPartOptions(true);

  if (!result.success) {
    return <div className="p-10 text-red-500">Failed to load parts</div>;
  }

  const parts = result.data.map((p) => ({
    _id: p._id!,
    name: p.name,
    brand: p.brand ?? "Unknown",
    price: p.price ?? 0,
    type: p.type,          
    image: p.imageUrl,
    specs: [],
  }));

  return <BuildClient parts={parts} />;
}

