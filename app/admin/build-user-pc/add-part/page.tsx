import Link from "next/link";
import PartForm from "../../../../components/admin/parts-option-form";

import { ArrowLeft } from "lucide-react";
import { PART_TYPES } from "@/constants/part";

export default async function AddPartPage() {
  // Fetch part types on the server


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
      <PartForm partTypes={PART_TYPES} />
    </div>
  );
}
