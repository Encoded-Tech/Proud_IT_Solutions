// "use client";

// import { useMemo, useState, useTransition } from "react";
// import Image from "next/image";
// import { Edit, Trash2, Search, Loader2 } from "lucide-react";
// import toast from "react-hot-toast";
// import { useRouter } from "next/navigation";

// import { productType, ProductVariantType } from "@/types/product";
// import { deleteProductVariantAction } from "@/lib/server/actions/admin/variants/variantsActions";
// import { VariantForm } from "./AddVariantForm";


// export default function VariantTable({
//   variants,
//   products,
// }: {
//   variants: ProductVariantType[];
//   products: productType[];
// }) {
//   const router = useRouter();
//   const [search, setSearch] = useState("");
//   const [page, setPage] = useState(1);
//   const [editTarget, setEditTarget] = useState<ProductVariantType | null>(null);
//   const [deleteTarget, setDeleteTarget] = useState<ProductVariantType | null>(null);
//   const [isPending, startTransition] = useTransition();

//   const ITEMS_PER_PAGE = 6;

//   /* 🔍 SEARCH */
//   const filtered = useMemo(() => {
//     return variants.filter(v =>
//       `${v.productName} ${v.sku} ${v.specs.cpu} ${v.specs.ram}`
//         .toLowerCase()
//         .includes(search.toLowerCase())
//     );
//   }, [variants, search]);

//   /* 📄 PAGINATION */
//   const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
//   const paginated = filtered.slice(
//     (page - 1) * ITEMS_PER_PAGE,
//     page * ITEMS_PER_PAGE
//   );

//   /* 🗑 DELETE */
//   const confirmDelete = () => {
//     if (!deleteTarget) return;

//     startTransition(async () => {
//       const res = await deleteProductVariantAction(deleteTarget.id);
//       if (!res.success) {
//         toast.error(res.message);
//         return;
//       }
//       toast.success("Variant deleted");
//       setDeleteTarget(null);
//       router.refresh();
//     });
//   };

//   return (
//     <>
//       {/* HEADER */}
//       <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
//         <div className="p-6 border-b flex justify-between items-center">
//           <div>
//             <h2 className="text-2xl font-bold">Product Variants</h2>
//             <p className="text-sm text-gray-500">
//               Showing {paginated.length} of {filtered.length}
//             </p>
//           </div>

//           <div className="relative">
//             <input
//               value={search}
//               onChange={e => {
//                 setSearch(e.target.value);
//                 setPage(1);
//               }}
//               placeholder="Search variants..."
//               className="border px-12 py-3 rounded-lg w-80"
//             />
//             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//           </div>
//         </div>

//         {/* TABLE */}
//         <table className="w-full">
//           <thead className="bg-gray-50 border-b">
//             <tr>
//               <th className="px-6 py-4 text-left">Variant</th>
//               <th className="px-6 py-4 text-center">Stock</th>
//               <th className="px-6 py-4 text-center">Offer</th>
//               <th className="px-6 py-4 text-center">Status</th>
//               <th className="px-6 py-4 text-center">Actions</th>
//             </tr>
//           </thead>

//           <tbody className="divide-y">
//             {paginated.map(v => (
//               <tr key={v.id} className="hover:bg-gray-50">
//                 {/* VARIANT INFO */}
//                 <td className="px-6 py-4 flex gap-4">
//                   <div className="relative w-14 h-14 rounded-lg overflow-hidden border">
//                     <Image
//                       src={v.images[0]}
//                       alt=""
//                       fill
//                       className="object-cover"
//                     />
//                   </div>

//                   <div>
//                     <p className="font-semibold">{v.productName}</p>
//                     <p className="text-sm text-gray-500">
//                       {v.specs.cpu} / {v.specs.ram}
//                     </p>
//                     <p className="text-xs text-gray-400">{v.sku}</p>
//                   </div>
//                 </td>

//                 {/* STOCK */}
//                 <td className="px-6 py-4 text-center">
//                   <span
//                     className={`px-3 py-1 rounded-full text-xs font-semibold
//                       ${v.stock > 10 ? "bg-green-100 text-green-700"
//                         : v.stock > 0 ? "bg-yellow-100 text-yellow-700"
//                         : "bg-red-100 text-red-700"}`}
//                   >
//                     {v.stock} units
//                   </span>
//                 </td>

//                 {/* OFFER */}
//                 <td className="px-6 py-4 text-center">
//                   <span
//                     className={`px-3 py-1 rounded-full text-xs font-semibold
//                       ${v.isOfferActive
//                         ? "bg-green-100 text-green-700"
//                         : "bg-red-100 text-red-700"}`}
//                   >
//                     {v.isOfferActive ? `${v.discountPercent}% OFF` : "No Offer"}
//                   </span>
//                 </td>

//                 {/* STATUS */}
//                 <td className="px-6 py-4 text-center">
//                   <span
//                     className={`px-3 py-1 rounded-full text-xs font-semibold
//                       ${v.isActive
//                         ? "bg-green-100 text-green-700"
//                         : "bg-gray-200 text-gray-600"}`}
//                   >
//                     {v.isActive ? "Active" : "Disabled"}
//                   </span>
//                 </td>

//                 {/* ACTIONS */}
//                 <td className="px-6 py-4 text-center flex justify-center gap-2">
//                   <button
//                     onClick={() => setEditTarget(v)}
//                     className="p-2 bg-yellow-50 text-yellow-700 rounded hover:bg-yellow-100"
//                   >
//                     <Edit size={16} />
//                   </button>
//                   <button
//                     onClick={() => setDeleteTarget(v)}
//                     className="p-2 bg-red-50 text-red-700 rounded hover:bg-red-100"
//                   >
//                     <Trash2 size={16} />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         {/* PAGINATION */}
//         {totalPages > 1 && (
//           <div className="p-4 border-t flex justify-between">
//             <span>Page {page} of {totalPages}</span>
//             <div className="flex gap-2">
//               <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
//               <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* EDIT MODAL */}
//      {editTarget && (
//   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//     <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden">
      
//       {/* HEADER */}
//       <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-white">
//         <h3 className="text-lg font-semibold">
//           Edit Variant
//         </h3>

//         <button
//           onClick={() => setEditTarget(null)}
//           className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800"
//           aria-label="Close"
//         >
//           ✕
//         </button>
//       </div>

//       {/* SCROLLABLE CONTENT */}
//       <div className="overflow-y-auto p-6 max-h-[calc(90vh-64px)]">
//         <VariantForm
//           variant={editTarget}
//           products={products} 
//         />
//       </div>
//     </div>
//   </div>
// )}

//       {/* DELETE CONFIRMATION */}
//       {deleteTarget && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-xl w-full max-w-md">
//             <h3 className="text-lg font-semibold mb-2">Delete Variant?</h3>
//             <p className="text-sm text-gray-600 mb-6">
//               This will permanently delete <b>{deleteTarget.sku}</b>
//             </p>
//             <div className="flex justify-end gap-3">
//               <button onClick={() => setDeleteTarget(null)}>Cancel</button>
//               <button
//                 onClick={confirmDelete}
//                 className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2"
//               >
//                 {isPending && <Loader2 className="animate-spin w-4 h-4" />}
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }


"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { Edit, Trash2, Search, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { productType, ProductVariantType } from "@/types/product";
import { deleteProductVariantAction } from "@/lib/server/actions/admin/variants/variantsActions";
import { VariantForm } from "./AddVariantForm";

export default function VariantTable({
  variants,
  products,
}: {
  variants: ProductVariantType[];
  products: productType[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editTarget, setEditTarget] = useState<ProductVariantType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductVariantType | null>(null);
  const [isPending, startTransition] = useTransition();

  const ITEMS_PER_PAGE = 6;

  /* 🔍 SEARCH */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return variants;

    return variants.filter(v =>
      `${v.productName} ${v.sku} ${v.specs.cpu} ${v.specs.ram}`
        .toLowerCase()
        .includes(q)
    );
  }, [variants, search]);

  /* 📄 PAGINATION */
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  /* 🗑 DELETE */
  const confirmDelete = () => {
    if (!deleteTarget) return;

    startTransition(async () => {
      const res = await deleteProductVariantAction(deleteTarget.id);
      if (!res.success) {
        toast.error(res.message || "Failed to delete variant");
        return;
      }
      toast.success("Variant deleted successfully");
      setDeleteTarget(null);
      router.refresh();
    });
  };

  return (
    <>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {/* HEADER */}
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Product Variants</h2>
            <p className="text-sm text-gray-500">
              Showing {paginated.length} of {filtered.length} variants
            </p>
          </div>

          <div className="relative">
            <input
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search variant by name..."
              className="border px-12 py-4 rounded-lg text-lg w-80"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Variant</th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase">Price (NPR)</th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase">Discount %</th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase">Offered Price</th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase">Stock</th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase">Created</th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {paginated.map(v => (
                <tr key={v.id} className="hover:bg-gray-50">
                  {/* VARIANT */}
                  <td className="px-6 py-4 flex gap-3">
                    <div className="relative w-14 h-14 border rounded">
                      <Image
                        src={v.images?.[0] ?? ""}
                        alt={v.sku}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{v.productName}</p>
                      <p className="text-sm text-gray-500">
                        {v.specs.cpu} / {v.specs.ram}
                      </p>
                      <p className="text-xs text-gray-400">{v.sku}</p>
                    </div>
                  </td>

                  {/* PRICE */}
                  <td className="px-6 py-4 text-center font-medium">
                    {v.price.toLocaleString()}
                  </td>

                  {/* DISCOUNT */}
                  <td className="px-6 py-4 text-center">
                    {v.isOfferActive ? (
                      <span className="px-2 py-1 rounded bg-green-50 text-green-700 text-sm">
                        {v.discountPercent}%
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded bg-red-50 text-red-600 text-sm">
                        Not Offered
                      </span>
                    )}
                  </td>

                  {/* OFFERED PRICE */}
                  <td className="px-6 py-4 text-center">
                    {v.isOfferActive ? (
                      v.offeredPrice?.toLocaleString()
                    ) : (
                      <span className="px-2 py-1 rounded bg-red-50 text-red-600 text-sm">
                        Not Active
                      </span>
                    )}
                  </td>

                  {/* STOCK */}
                  <td className="px-6 py-4 text-center">
                    {v.stock > 0 ? (
                      <span className="px-2 py-1 rounded bg-green-50 text-green-700 text-sm">
                        In stock ({v.stock})
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded bg-red-50 text-red-600 text-sm">
                        Out of stock
                      </span>
                    )}
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-4 text-center">
                    {v.isActive ? (
                      <span className="px-2 py-1 rounded bg-green-50 text-green-700 text-sm">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded bg-red-50 text-red-600 text-sm">
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* CREATED */}
                  <td className="px-6 py-4 text-right text-sm">
                    <div>{new Date(v.createdAt).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(v.createdAt).toLocaleTimeString()}
                    </div>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-6 py-4 text-center flex justify-center gap-2">
                    <button
                      onClick={() => setEditTarget(v)}
                      className="p-2 rounded bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(v)}
                      className="p-2 rounded bg-red-50 text-red-700 hover:bg-red-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="p-4 border-t flex justify-between items-center">
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
     

      {editTarget && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden">
      
      {/* HEADER */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-white">
        <h3 className="text-lg font-semibold">
          Edit Variant
        </h3>

        <button
          onClick={() => setEditTarget(null)}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="overflow-y-auto p-6 max-h-[calc(90vh-64px)]">
        <VariantForm
          variant={editTarget}
          products={products} 
        />
      </div>
    </div>
  </div>
)}

      {/* DELETE MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Delete Variant?</h3>
            <p className="text-sm text-gray-600 mb-6">
              This will permanently delete <b>{deleteTarget.sku}</b>
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                {isPending && <Loader2 className="animate-spin w-4 h-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
