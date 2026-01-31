// import ProductTable from "@/components/admin/AdminProductTable";
// import { fetchCategories } from "@/lib/server/fetchers/fetchCategory";
// import { fetchAllProducts } from "@/lib/server/fetchers/fetchProducts";

// export default async function ProductPage({
//   searchParams,
// }: {
//   searchParams?: Promise<{ page?: string }>;
// }) {
//   const resolvedSearchParams = await searchParams;
//   const page = Number(resolvedSearchParams?.page ?? 1);
//   const limit = 6;

//   const res = await fetchAllProducts(page, limit, {
//   includeInactive: true,
// });


//   if (!res.success || !res.data || !res.pagination) {
//     return <div className="p-6 text-red-600">Failed to load products</div>;
//   }

//   const resCategories = await fetchCategories();
//   const categories = resCategories.data || [];

//   return (
//     <div className="p-6">
//       <ProductTable
//         products={res.data}
//         categories={categories}
//         pagination={res.pagination}
//       />
//     </div>
//   );
// }


// import ProductTable from "@/components/admin/AdminProductTable";
// import { fetchCategories } from "@/lib/server/fetchers/fetchCategory";
// import { fetchAllProducts } from "@/lib/server/fetchers/fetchProducts";

// export default async function ProductPage({
//   searchParams,
// }: {
//   searchParams?: Promise<{
//     page?: string;
//     search?: string;
//     status?: "active" | "inactive" | "all";
//   }>;
// }) {
//   const params = await searchParams;

//   const page = Number(params?.page ?? 1);
//   const limit = 6;

  // const search = params?.search?.trim();
  // const status = params?.status ?? "all";

//   const res = await fetchAllProducts(page, limit, {
//     search,
//     status,
//     includeInactive: status === "all",
//   });

//   if (!res.success || !res.data || !res.pagination) {
//     return (
//       <div className="p-6 text-red-600">
//         Failed to load products
//       </div>
//     );
//   }

//   const resCategories = await fetchCategories();
//   const categories = resCategories.data || [];

//   return (
//     <div className="p-6 space-y-4">
//       <ProductTable
//         products={res.data}
//         categories={categories}
//         pagination={res.pagination}
      
//       />
//     </div>
//   );
// }


// import ProductTable from "@/components/admin/AdminProductTable";
// import { fetchCategories } from "@/lib/server/fetchers/fetchCategory";
// import { fetchAllProducts } from "@/lib/server/fetchers/fetchProducts";

// export default async function ProductPage({
//   searchParams,
// }: {
//   searchParams?: Promise<{ page?: string }>;
// }) {
//   const resolvedSearchParams = await searchParams;
//   const page = Number(resolvedSearchParams?.page ?? 1);
//   const limit = 6;

//   const res = await fetchAllProducts(page, limit, {
//   includeInactive: true,
// });


//   if (!res.success || !res.data || !res.pagination) {
//     return <div className="p-6 text-red-600">Failed to load products</div>;
//   }

//   const resCategories = await fetchCategories();
//   const categories = resCategories.data || [];

//   return (
//     <div className="p-6">
//       <ProductTable
//         products={res.data}
//         categories={categories}
//         pagination={res.pagination}
//       />
//     </div>
//   );
// }


// import ProductTable from "@/components/admin/AdminProductTable";
// import { fetchCategories } from "@/lib/server/fetchers/fetchCategory";
// import { fetchAllProducts } from "@/lib/server/fetchers/fetchProducts";

// export default async function ProductPage({
//   searchParams,
// }: {
//   searchParams?: Promise<{
//     page?: string;
//     search?: string;
//     status?: "active" | "inactive" | "all";
//   }>;
// }) {
//   const params = await searchParams;

//   const page = Number(params?.page ?? 1);
//   const limit = 6;

  // const search = params?.search?.trim();
  // const status = params?.status ?? "all";

//   const res = await fetchAllProducts(page, limit, {
//     search,
//     status,
//     includeInactive: status === "all",
//   });

//   if (!res.success || !res.data || !res.pagination) {
//     return (
//       <div className="p-6 text-red-600">
//         Failed to load products
//       </div>
//     );
//   }

//   const resCategories = await fetchCategories();
//   const categories = resCategories.data || [];

//   return (
//     <div className="p-6 space-y-4">
//       <ProductTable
//         products={res.data}
//         categories={categories}
//         pagination={res.pagination}
      
//       />
//     </div>
//   );
// }

import ProductTable from "@/components/admin/AdminProductTable";
import { fetchCategories } from "@/lib/server/fetchers/fetchCategory";
import { fetchAllProducts } from "@/lib/server/fetchers/fetchProducts";

export default async function ProductPage({
  searchParams,
}: {
  searchParams?: Promise<{
    page?: string;
    search?: string;
    status?: "active" | "inactive" | "all";
    sort?: "newest" | "oldest" | "price_asc" | "price_desc";
    categoryId?: string;
    brandName?: string;
  }>;
}) {
  // Await the searchParams promise
  const params = await searchParams;
  
  const page = Number(params?.page ?? 1);
  const limit = 6;

  const search = params?.search?.trim();
  const status = params?.status ?? "all";

  const res = await fetchAllProducts(page, limit, {
    includeInactive: true,
    search,
    status,
    sort: params?.sort,
    categoryId: params?.categoryId,
    brandName: params?.brandName,
  });

  if (!res.success || !res.data || !res.pagination) {
    return <div className="p-6 text-red-600">Failed to load products</div>;
  }

  const resCategories = await fetchCategories();
  const categories = resCategories.data || [];

  return (
    <div className="p-6">
      <ProductTable
        products={res.data}
        categories={categories}
        pagination={res.pagination}
      />
    </div>
  );
}