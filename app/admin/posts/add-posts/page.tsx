import React from "react";
import PostForm from "../../../../components/admin/AddPostForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";


export default function AddPostPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="max-w-5xl mx-auto">
           <Link href="/admin/posts">
           <button
              
               className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors group"
             >
               <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
               <span className="font-medium">Back to Posts</span>
             </button></Link>
           </div>
      <PostForm />
    </div>
  );
}
