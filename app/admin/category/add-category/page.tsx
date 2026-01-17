

import Link from "next/link";
import AddCategoryPage from "./category-form";
import { ArrowLeft } from "lucide-react";



export default async function Page() {


  return (
   <div className=" bg-gray-50 py-10 px-4">
        <div className="max-w-5xl mx-auto">
      <Link href="/admin/category">
      <button
         
          className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Categories</span>
        </button></Link>
      </div>
      <AddCategoryPage  />
    </div>
  );
}
