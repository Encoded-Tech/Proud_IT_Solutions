import Link from "next/link";
import PartForm from "../../../../components/admin/parts-option-form";
import { fetchPartTypes } from "@/lib/server/actions/admin/BuildMyPc/partsAction";
import { ArrowLeft } from "lucide-react";

export default async function AddPartPage() {
  // Fetch part types on the server
  const res = await fetchPartTypes();
  const partTypes = res.success ? res.data : [];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="max-w-6xl mx-auto ">
      <Link href="/admin/build-user-pc/parts-table">
      <button
         
          className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Build User PC</span>
        </button></Link>
      </div>
      <PartForm partTypes={partTypes} />
    </div>
  );
}
