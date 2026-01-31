// "use client";

// import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
// import { Icon } from "@iconify/react";

// import ProductCard from "@/components/card/product-card";
// import { productType, CategoryType } from "@/types/product";
// import { fetchAllProducts } from "@/lib/server/fetchers/fetchProducts";
// import { fetchBrands } from "@/lib/server/actions/admin/brand/brandAction";

// /* ---------------------------------- PROPS --------------------------------- */
// interface ShopGridProps {
//   products: productType[];
//   categories: CategoryType[];
// }

// /* -------------------------------- COMPONENT -------------------------------- */
// const ShopGrid = ({ products: initialProducts, categories }: ShopGridProps) => {
//   /* ------------------------------ STATE ----------------------------- */
//   const [allProducts, setAllProducts] = useState<productType[]>(initialProducts);
//   const [page, setPage] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [hasMore, setHasMore] = useState(true);
//   const observerTarget = useRef<HTMLDivElement>(null);
//   const [brands, setBrands] = useState<string[]>([]);



//   /* ------------------------------ FILTER STATE ----------------------------- */
//   const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

//   const [minPrice, setMinPrice] = useState<number | undefined>();
//   const [maxPrice, setMaxPrice] = useState<number | undefined>();
//   const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
//   const [selectedRating, setSelectedRating] = useState<number | null>(null);

//   /* ----------------------------- FETCH STATIC BRANDS ------------------------ */

//   useEffect(() => {
//     const getBrands = async () => {
//       try {
//         const res = await fetchBrands();
//         if (res.success && res.data) {
//           setBrands(res.data); // static brand list
//         }
//       } catch (err) {
//         console.error("Failed to fetch brands:", err);
//       }
//     };
//     getBrands();
//   }, []);

//   /* ----------------------------- LOAD MORE PRODUCTS ---------------------------- */
//   const loadMoreProducts = useCallback(async () => {
//     if (loading || !hasMore) return;

//     setLoading(true);
//     try {
//       const nextPage = page + 1;
//       const res = await fetchAllProducts(nextPage, 6);
//       const newProducts = res.data || [];

//       if (newProducts.length > 0) {
//         setAllProducts((prev) => {
//           const existingIds = new Set(prev.map((p) => p.id));
//           const uniqueNewProducts = newProducts.filter(
//             (p) => !existingIds.has(p.id)
//           );
//           return [...prev, ...uniqueNewProducts];
//         });

//         setPage(nextPage);

//         if (newProducts.length < 6) {
//           setHasMore(false);
//         }
//       } else {
//         setHasMore(false);
//       }
//     } catch (error) {
//       console.error("Error loading products:", error);
//       setHasMore(false);
//     } finally {
//       setLoading(false);
//     }
//   }, [page, loading, hasMore]);


//   /* ----------------------------- INTERSECTION OBSERVER ---------------------------- */
//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         if (entries[0].isIntersecting && hasMore && !loading) {
//           loadMoreProducts();
//         }
//       },
//       { threshold: 0.1 }
//     );

//     const currentTarget = observerTarget.current;
//     if (currentTarget) {
//       observer.observe(currentTarget);
//     }

//     return () => {
//       if (currentTarget) {
//         observer.unobserve(currentTarget);
//       }
//     };
//   }, [hasMore, loading, loadMoreProducts]); // Removed 'page' dependency to prevent infinite loop

//   /* ----------------------------- FILTER LOGIC ------------------------------ */
//   // const filteredProducts = useMemo(() => {
//   //   return allProducts.filter((product) => {
//   //     if (minPrice !== undefined && product.price < minPrice) return false;
//   //     if (maxPrice !== undefined && product.price > maxPrice) return false;

//   //     if (selectedCategorySlug && product.category.slug !== selectedCategorySlug)
//   //       return false;

//   //     if (selectedRating && product.avgRating < selectedRating) return false;

//   //     return true;
//   //   });
//   // }, [allProducts, minPrice, maxPrice, selectedCategorySlug, selectedRating]);

//   const filteredProducts = useMemo(() => {
//     return allProducts.filter((product) => {
//       if (minPrice !== undefined && product.price < minPrice) return false;
//       if (maxPrice !== undefined && product.price > maxPrice) return false;

//       if (selectedCategorySlug && product.category.slug !== selectedCategorySlug)
//         return false;

//       if (selectedRating && product.avgRating < selectedRating) return false;

//       // ✅ BRAND FILTER
//       if (selectedBrand && product.brandName !== selectedBrand)
//         return false;

//       return true;
//     });
//   }, [
//     allProducts,
//     minPrice,
//     maxPrice,
//     selectedCategorySlug,
//     selectedRating,
//     selectedBrand,
//   ]);

//   /* ----------------------------- RESET FILTERS ------------------------------ */
//   const resetFilters = () => {
//     setMinPrice(undefined);
//     setMaxPrice(undefined);
//     setSelectedCategorySlug(null);
//     setSelectedRating(null);
//     setSelectedBrand(null); // ✅ ADD THIS
//     setAllProducts(initialProducts);
//     setPage(1);
//     setHasMore(true);
//   };




//   /* -------------------------------- RENDER --------------------------------- */
//   return (
//     <main className="grid md:grid-cols-7 gap-x-6">
//       {/* ------------------------------- FILTERS ------------------------------ */}
//       <aside className="hidden md:block col-span-2 h-fit sticky top-4">
//  <div className="p-4 bg-zinc-50 rounded-md shadow-sm space-y-8 max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-none">

//           {/* Header */}
//           <div className="flex justify-between pb-4 border-b">
//             <h2 className="font-medium text-xl">Filter</h2>
//             <Icon icon="mi:filter" width={24} height={24} />
//           </div>

//           {/* Price */}
//           <div className="space-y-4">
//             <h3 className="font-medium text-lighttext">Price</h3>
//             <div className="flex items-start gap-2">
//               <input
//                 type="number"
//                 placeholder="Min"
//                 value={minPrice ?? ""}
//                 onChange={(e) =>
//                   setMinPrice(e.target.value ? Number(e.target.value) : undefined)
//                 }
//                 className="w-full h-9 border border-gray-300 rounded px-2 text-sm"
//               />
//               <input
//                 type="number"
//                 placeholder="Max"
//                 value={maxPrice ?? ""}
//                 onChange={(e) =>
//                   setMaxPrice(e.target.value ? Number(e.target.value) : undefined)
//                 }
//                 className="w-full h-9 border border-gray-300 rounded px-2 text-sm"
//               />
//             </div>
//           </div>

//           {/* Category */}
//           <div className="space-y-4">
//             <h3 className="font-medium text-lighttext">Category</h3>
//             <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
//               {categories.map((cat) => (
//                 <label
//                   key={cat.id}
//                   className="flex justify-between cursor-pointer text-sm font-medium text-lighttext hover:text-primary transition-colors"
//                 >
//                   <div className="flex items-center gap-2">
//                     <input
//                       type="radio"
//                       name="category"
//                       checked={selectedCategorySlug === cat.slug}
//                       onChange={() => setSelectedCategorySlug(cat.slug)}
//                       className="accent-primarymain cursor-pointer"
//                     />
//                     <span>{cat.categoryName}</span>
//                   </div>
//                   {cat.productCount && <span className="text-gray-400">({cat.productCount})</span>}
//                 </label>
//               ))}
//             </div>
//           </div>


//           {/* Brand */}
//           <div className="space-y-4">
//             <h3 className="font-medium text-lighttext">Brand</h3>
//             <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-none">
//               {brands.map((brand) => {
//                 // Count products for this brand
//                 const count = allProducts.filter((p) => p.brandName === brand).length;

//                 return (
//                   <label
//                     key={brand}
//                     className="flex justify-between items-center cursor-pointer text-sm font-medium text-lighttext hover:text-primary transition-colors"
//                   >
//                     <div className="flex items-center gap-2">
//                       <input
//                         type="radio"
//                         name="brand"
//                         checked={selectedBrand === brand}
//                         onChange={() =>
//                           setSelectedBrand(selectedBrand === brand ? null : brand)
//                         }
//                         className="accent-primarymain cursor-pointer"
//                       />
//                       <span>{brand}</span>
//                     </div>
//                     <span className="text-gray-400">({count})</span>
//                   </label>
//                 );
//               })}
//             </div>
//           </div>


//           {/* Rating */}
//           <div className="space-y-4">
//             <h3 className="font-medium text-lighttext">Rating</h3>
//             <div className="space-y-2">
//               {[5, 4, 3, 2, 1].map((r) => (
//                 <div
//                   key={r}
//                   className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors"
//                   onClick={() => setSelectedRating(selectedRating === r ? null : r)}
//                 >
//                   <input
//                     type="radio"
//                     checked={selectedRating === r}
//                     onChange={() => setSelectedRating(r)}
//                     className="accent-primarymain cursor-pointer"
//                   />
//                   <div className="flex items-center">
//                     {Array.from({ length: 5 }).map((_, i) => (
//                       <Icon
//                         key={i}
//                         icon="ic:round-star"
//                         className={
//                           i < r
//                             ? "text-yellow-500 text-lg"
//                             : "text-gray-300 text-lg"
//                         }
//                       />
//                     ))}

//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Clear Filters */}
//           <button
//             onClick={resetFilters}
//             className="w-full py-2 text-sm text-white bg-primary hover:bg-primary/90 rounded-md transition-colors font-medium"
//           >
//             Clear All Filters
//           </button>
//         </div>
//       </aside>

//       {/* ------------------------------ PRODUCT GRID --------------------------- */}
//       <section className="col-span-5">
//         {/* Results Count */}
//         <div className="mb-4 text-sm text-gray-600">
//           Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
//         </div>

//         {/* Products Grid */}
//         <div className="grid lg:grid-cols-3 grid-cols-2 gap-4">
//           {filteredProducts.length > 0 ? (
//             filteredProducts.map((prod) => (
//               <ProductCard label="All Products" key={prod.id} product={prod} />
//             ))
//           ) : (
//             <div className="col-span-full text-center py-12">
//               <Icon icon="mdi:package-variant-closed-remove" className="text-gray-300 text-6xl mx-auto mb-4" />
//               <p className="text-gray-500 text-lg font-medium">No products match your filters</p>
//               <button
//                 onClick={resetFilters}
//                 className="mt-4 text-primary underline hover:no-underline"
//               >
//                 Clear filters
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Infinite Scroll Trigger */}
//         {hasMore && filteredProducts.length > 0 && (
//           <div ref={observerTarget} className="flex justify-center py-8">
//             {loading && (
//               <div className="flex items-center gap-2 text-gray-500">
//                 <Icon icon="svg-spinners:ring-resize" className="text-2xl" />
//                 <span className="text-sm font-medium">Loading more products...</span>
//               </div>
//             )}
//           </div>
//         )}

//         {/* End of Products */}
//         {!hasMore && filteredProducts.length > 6 && (
//           <div className="text-center py-8 text-gray-400 text-sm">
//             You&apos;ve reached the end of the products
//           </div>
//         )}
//       </section>
//     </main>
//   );
// };

// export default ShopGrid;

// "use client";

// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { Icon } from "@iconify/react";

// import ProductCard from "@/components/card/product-card";
// import { productType, CategoryType } from "@/types/product";
// import {  fetchFilteredProducts } from "@/lib/server/fetchers/fetchProducts";
// import { fetchBrands } from "@/lib/server/actions/admin/brand/brandAction";

// /* ---------------------------------- PROPS --------------------------------- */
// interface ShopGridProps {
//   products: productType[];
//   categories: CategoryType[];
  
// }

// interface BrandCount {
//   name: string;
//   count?: number;
// }


// /* -------------------------------- COMPONENT -------------------------------- */
// const ShopGrid = ({ products: initialProducts, categories }: ShopGridProps) => {
//   /* ------------------------------ STATE ----------------------------- */
//   const [allProducts, setAllProducts] = useState<productType[]>(initialProducts);
//   const [page, setPage] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [hasMore, setHasMore] = useState(true);
//   const observerTarget = useRef<HTMLDivElement>(null);
//   const [brands, setBrands] = useState<BrandCount[]>([]);
//   const [pendingProducts, setPendingProducts] = useState<productType[]>([]);

//   /* ------------------------------ FILTER STATE ----------------------------- */
//   const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
//   const [minPrice, setMinPrice] = useState<number | undefined>();
//   const [maxPrice, setMaxPrice] = useState<number | undefined>();
//   const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
//   const [selectedRating, setSelectedRating] = useState<number | null>(null);
//    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

//   /* ----------------------------- FETCH STATIC BRANDS ------------------------ */
//   useEffect(() => {
//     const getBrands = async () => {
//       try {
//         const res = await fetchBrands();
//         if (res.success && res.data) {
//           setBrands(res.data);
//         }
//       } catch (err) {
//         console.error("Failed to fetch brands:", err);
//       }
//     };
//     getBrands();
//   }, []);


//   useEffect(() => {
//   const applyFilters = async () => {
//     setLoading(true);
//     setPage(1);
//     setHasMore(true);

//     const res = await fetchFilteredProducts({
//       page: 1,
//       limit: 6,
//       brand: selectedBrand,
//       category: selectedCategorySlug,
//       minPrice,
//       maxPrice,
//       rating: selectedRating,
//     });

//     if (res.success) {
//       setAllProducts(res.data);
//       setHasMore(res.hasMore);
//     }

//     setLoading(false);
//   };

//   applyFilters();
// }, [
//   selectedBrand,
//   selectedCategorySlug,
//   minPrice,
//   maxPrice,
//   selectedRating,
// ]);

//   /* ----------------------------- LOAD MORE PRODUCTS ---------------------------- */
// const loadMoreProducts = useCallback(async () => {
//   if (loading || !hasMore) return;

//   setLoading(true);

//   const nextPage = page + 1;

//   const res = await fetchFilteredProducts({
//     page: nextPage,
//     limit: 6,
//     brand: selectedBrand,
//     category: selectedCategorySlug,
//     minPrice,
//     maxPrice,
//     rating: selectedRating,
//   });

//   if (res.success && res.data.length > 0) {
//     setAllProducts((prev) => [...prev, ...res.data]);
//     setPage(nextPage);
//     setHasMore(res.hasMore);
//   } else {
//     setHasMore(false);
//   }

//   setLoading(false);
// }, [
//   page,
//   hasMore,
//   loading,
//   selectedBrand,
//   selectedCategorySlug,
//   minPrice,
//   maxPrice,
//   selectedRating,
// ]);


//   /* ----------------------------- INTERSECTION OBSERVER ---------------------------- */
//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         if (entries[0].isIntersecting && hasMore && !loading) {
//           loadMoreProducts();
//         }
//       },
//       { 
//         threshold: 0.1,
//         rootMargin: '800px' // Start loading before user reaches the bottom
//       }
//     );

//     const currentTarget = observerTarget.current;
//     if (currentTarget) {
//       observer.observe(currentTarget);
//     }

//     return () => {
//       if (currentTarget) {
//         observer.unobserve(currentTarget);
//       }
//     };
//   }, [hasMore, loading, loadMoreProducts]);

//   /* ----------------------------- FILTER LOGIC ------------------------------ */


//   /* ----------------------------- RESET FILTERS ------------------------------ */
//  const resetFilters = async () => {
//   setSelectedBrand(null);
//   setSelectedCategorySlug(null);
//   setMinPrice(undefined);
//   setMaxPrice(undefined);
//   setSelectedRating(null);
// setPendingProducts([]);
//   setPage(1);
//   setHasMore(true);

//   const res = await fetchFilteredProducts({
//     page: 1,
//     limit: 6,
//   });

//   if (res.success) {
//     setAllProducts(res.data);
//     setHasMore(res.hasMore);
//   }
// };

//   /* -------------------------------- RENDER --------------------------------- */
//   return (
//     <>
//       <style jsx>{`
//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//             transform: translateY(10px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
//         }
        
//         @keyframes pulse {
//           0%, 100% {
//             opacity: 1;
//           }
//           50% {
//             opacity: 0.5;
//           }
//         }
//         .animate-pulse {
//           animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
//         }
//       `}</style>

//        {/* Mobile Filter Button */}
//       <div className="block md:hidden mb-4 ">
//         <button
//           onClick={() => setMobileFilterOpen(true)}
//           className="bg-primary text-white px-4 py-2 rounded font-medium shadow"
//         >
//          Apply Filters
//         </button>
//       </div>

//       {/* Mobile Filter Drawer */}
//       {mobileFilterOpen && (
//         <div className="fixed inset-0 z-50 flex">
//           <div
//             className="fixed inset-0 bg-black/40"
//             onClick={() => setMobileFilterOpen(false)}
//           />
//           <div className="relative w-3/4 max-w-xs bg-white p-4 overflow-y-auto">
//             <button
//               onClick={() => setMobileFilterOpen(false)}
//               className="bg-primary text-white px-4 py-2 rounded font-medium shadow mb-4"
//             >
//               Close Filters
//             </button>

//             {/* Render filters inside drawer */}
//             <div className="space-y-6">
//               {/* Price */}
//               <div className="space-y-2">
//                 <h3 className="font-medium text-lighttext">Price</h3>
//                 <div className="flex items-start gap-2">
//                   <input
//                     type="number"
//                     placeholder="Min"
//                     value={minPrice ?? ""}
//                     onChange={(e) =>
//                       setMinPrice(e.target.value ? Number(e.target.value) : undefined)
//                     }
//                     className="w-full h-9 border border-gray-300 rounded px-2 text-sm"
//                   />
//                   <input
//                     type="number"
//                     placeholder="Max"
//                     value={maxPrice ?? ""}
//                     onChange={(e) =>
//                       setMaxPrice(e.target.value ? Number(e.target.value) : undefined)
//                     }
//                     className="w-full h-9 border border-gray-300 rounded px-2 text-sm"
//                   />
//                 </div>
//               </div>

//               {/* Category */}
//               <div className="space-y-2">
//                 <h3 className="font-medium text-lighttext">Category</h3>
//                 <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
//                   {categories.map((cat) => (
//                     <label
//                       key={cat.id}
//                       className="flex justify-between cursor-pointer text-sm font-medium text-lighttext hover:text-primary transition-colors"
//                     >
//                       <div className="flex items-center gap-2">
//                         <input
//                           type="radio"
//                           name="category-mobile"
//                           checked={selectedCategorySlug === cat.slug}
//                           onChange={() =>
//                             setSelectedCategorySlug(
//                               selectedCategorySlug === cat.slug ? null : cat.slug
//                             )
//                           }
//                           className="accent-primarymain cursor-pointer"
//                         />
//                         <span>{cat.categoryName}</span>
//                       </div>
//                       {cat.productCount && (
//                         <span className="text-gray-400">({cat.productCount})</span>
//                       )}
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               {/* Brand */}
//               <div className="space-y-2">
//                 <h3 className="font-medium text-lighttext">Brand</h3>
//                 <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
//                   {brands.map((brand) => (
//                     <label
//                       key={brand.name}
//                       className="flex justify-between items-center cursor-pointer text-sm font-medium text-lighttext hover:text-primary transition-colors"
//                     >
//                       <div className="flex items-center gap-2">
//                         <input
//                           type="radio"
//                           name="brand-mobile"
//                           checked={selectedBrand === brand.name}
//                           onChange={() =>
//                             setSelectedBrand(selectedBrand === brand.name ? null : brand.name)
//                           }
//                           className="accent-primarymain cursor-pointer"
//                         />
//                         <span>{brand.name}</span>
//                       </div>
//                       <span className="text-gray-400">({brand.count})</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               {/* Rating */}
//               <div className="space-y-2">
//                 <h3 className="font-medium text-lighttext">Rating</h3>
//                 {[5, 4, 3, 2, 1].map((r) => (
//                   <div
//                     key={r}
//                     className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors"
//                     onClick={() => setSelectedRating(selectedRating === r ? null : r)}
//                   >
//                     <input
//                       type="radio"
//                       checked={selectedRating === r}
//                       onChange={() => setSelectedRating(r)}
//                       className="accent-primarymain cursor-pointer"
//                     />
//                     <div className="flex items-center">
//                       {Array.from({ length: 5 }).map((_, i) => (
//                         <Icon
//                           key={i}
//                           icon="ic:round-star"
//                           className={i < r ? "text-yellow-500 text-lg" : "text-gray-300 text-lg"}
//                         />
//                       ))}
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               <button
//                 onClick={resetFilters}
//                 className="w-full py-2 text-sm text-white bg-primary hover:bg-primary/90 rounded-md transition-colors font-medium"
//               >
//                 Clear All Filters
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//       <main className="grid md:grid-cols-7 gap-x-6">
//       {/* ------------------------------- FILTERS ------------------------------ */}
//       <aside className="hidden md:block col-span-2 h-fit sticky top-4">
//         <div className="p-4 bg-zinc-50 rounded-md shadow-sm space-y-6">
//           {/* Header */}
//           <div className="flex justify-between pb-4 border-b">
//             <h2 className="font-medium text-xl">Filter</h2>
//             <Icon icon="mi:filter" width={24} height={24} />
//           </div>

//           {/* Price */}
//           <div className="space-y-3">
//             <h3 className="font-medium text-lighttext">Price</h3>
//             <div className="flex items-start gap-2">
//               <input
//                 type="number"
//                 placeholder="Min"
//                 value={minPrice ?? ""}
//                 onChange={(e) =>
//                   setMinPrice(e.target.value ? Number(e.target.value) : undefined)
//                 }
//                 className="w-full h-9 border border-gray-300 rounded px-2 text-sm"
//               />
//               <input
//                 type="number"
//                 placeholder="Max"
//                 value={maxPrice ?? ""}
//                 onChange={(e) =>
//                   setMaxPrice(e.target.value ? Number(e.target.value) : undefined)
//                 }
//                 className="w-full h-9 border border-gray-300 rounded px-2 text-sm"
//               />
//             </div>
//           </div>

//           {/* Category */}
//           <div className="space-y-3">
//             <h3 className="font-medium text-lighttext">Category</h3>
//             <div className="space-y-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
//               {categories.map((cat) => (
//                 <label
//                   key={cat.id}
//                   className="flex justify-between cursor-pointer text-sm font-medium text-lighttext hover:text-primary transition-colors"
//                 >
//                   <div className="flex items-center gap-2">
//                    <input
//   type="radio"
//   name="category"
//   checked={selectedCategorySlug === cat.slug}
//   onChange={() => setSelectedCategorySlug(cat.slug)}
//   onClick={() => {
//     if (selectedCategorySlug === cat.slug) {
//       setSelectedCategorySlug(null);
//     }
//   }}
//   className="accent-primarymain cursor-pointer"
// />

//                     <span>{cat.categoryName}</span>
//                   </div>
//                   {cat.productCount && <span className="text-gray-400">({cat.productCount})</span>}
//                 </label>
//               ))}
//             </div>
//           </div>

//           {/* Brand */}
//           <div className="space-y-3">
//             <h3 className="font-medium text-lighttext">Brand</h3>
//             <div className="space-y-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
//           {brands.map((brand) => (
//   <label
//     key={brand.name}
//     className="flex justify-between items-center cursor-pointer text-sm font-medium text-lighttext hover:text-primary transition-colors"
//   >
//     <div className="flex items-center gap-2">
//     <input
//   type="radio"
//   name="brand"
//   checked={selectedBrand === brand.name}
//   onChange={() => setSelectedBrand(brand.name)}
//   onClick={() => {
//     if (selectedBrand === brand.name) {
//       setSelectedBrand(null);
//     }
//   }}
//   className="accent-primarymain cursor-pointer"
// />

//       <span>{brand.name}</span>
//     </div>
//     <span className="text-gray-400">({brand.count})</span>
//   </label>
// ))}

//             </div>
//           </div>

//           {/* Rating */}
//           <div className="space-y-3">
//             <h3 className="font-medium text-lighttext">Rating</h3>
//             <div className="space-y-2">
//               {[5, 4, 3, 2, 1].map((r) => (
//                 <div
//                   key={r}
//                   className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors"
//                   onClick={() => setSelectedRating(selectedRating === r ? null : r)}
//                 >
//                   <input
//                     type="radio"
//                     checked={selectedRating === r}
//                     onChange={() => setSelectedRating(r)}
//                     className="accent-primarymain cursor-pointer"
//                   />
//                   <div className="flex items-center">
//                     {Array.from({ length: 5 }).map((_, i) => (
//                       <Icon
//                         key={i}
//                         icon="ic:round-star"
//                         className={
//                           i < r
//                             ? "text-yellow-500 text-lg"
//                             : "text-gray-300 text-lg"
//                         }
//                       />
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Clear Filters */}
//           <button
//             onClick={resetFilters}
//             className="w-full py-2 text-sm text-white bg-primary hover:bg-primary/90 rounded-md transition-colors font-medium"
//           >
//             Clear All Filters
//           </button>
//         </div>
//       </aside>

//       {/* ------------------------------ PRODUCT GRID --------------------------- */}
//       <section className="col-span-5">
//         {/* Results Count */}
//         <div className="mb-4 text-sm text-gray-600">
//           Showing {allProducts.length} product{allProducts.length !== 1 ? 's' : ''}
//         </div>

//         {/* Products Grid */}
//         <div className="grid lg:grid-cols-3 grid-cols-2 gap-4 transition-all duration-300">
//           {allProducts.length > 0 ? (
//             allProducts.map((prod, index) => (
//               <div
//                 key={prod.id}
//                 className="animate-fadeIn"
//                 style={{ 
//                   animationDelay: `${(index % 6) * 40}ms`,
//                   minHeight: '300px' // Prevents layout shift
//                 }}
//               >
//                 <ProductCard label="All Products" product={prod} />
//               </div>
//             ))
//           ) : (
//             <div className="col-span-full text-center py-12">
//               <Icon icon="mdi:package-variant-closed-remove" className="text-gray-300 text-6xl mx-auto mb-4" />
//               <p className="text-gray-500 text-lg font-medium">No products match your filters</p>
//               <button
//                 onClick={resetFilters}
//                 className="mt-4 text-primary underline hover:no-underline"
//               >
//                 Clear filters
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Infinite Scroll Trigger */}
//         {hasMore && allProducts.length > 0 && (
//           <div ref={observerTarget} className="flex justify-center py-8 min-h-[100px]">
//             {loading && (
//               <div className="flex items-center gap-2 text-gray-500 animate-fadeIn">
//                 <Icon icon="svg-spinners:ring-resize" className="text-2xl" />
//                 <span className="text-sm font-medium">Loading more products...</span>
//               </div>
//             )}
//             {/* Skeleton placeholders while loading */}
//             {pendingProducts.length > 0 && (
//               <div className="grid lg:grid-cols-3 grid-cols-2 gap-4 w-full">
//                 {pendingProducts.map((_, idx) => (
//                   <div
//                     key={`skeleton-${idx}`}
//                     className="h-[300px] bg-gray-100 rounded-lg animate-pulse"
//                   />
//                 ))}
//               </div>
//             )}
//           </div>
//         )}
//         {/* End of Products */}
//         {!hasMore && allProducts.length > 6 && (
//           <div className="text-center py-8 text-gray-400 text-sm">
//             You&apos;ve reached the end of the products
//           </div>
//         )}
//       </section>
//     </main>
//     </>
//   );
// };

// export default ShopGrid;

"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

import ProductCard from "@/components/card/product-card";
import { productType, CategoryType } from "@/types/product";
import { fetchFilteredProducts, PaginationMeta } from "@/lib/server/fetchers/fetchProducts";
import { fetchBrands } from "@/lib/server/actions/admin/brand/brandAction";

/* ---------------------------------- PROPS --------------------------------- */
interface ShopGridProps {
  products: productType[];
  categories: CategoryType[];
  pagination: PaginationMeta | undefined;
}

interface BrandCount {
  name: string;
  count?: number;
}

/* -------------------------------- COMPONENT -------------------------------- */
const ShopGrid = ({ products: initialProducts, categories, pagination }: ShopGridProps) => {
  /* ------------------------------ STATE ----------------------------- */
  const [allProducts, setAllProducts] = useState<productType[]>(initialProducts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [brands, setBrands] = useState<BrandCount[]>([]);

  /* ------------------------------ FILTER STATE ----------------------------- */
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const totalPages = pagination?.totalPages || 1;

  /* ----------------------------- FETCH STATIC BRANDS ------------------------ */
  useEffect(() => {
    const getBrands = async () => {
      try {
        const res = await fetchBrands();
        if (res.success && res.data) {
          setBrands(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch brands:", err);
      }
    };
    getBrands();
  }, []);

  /* ----------------------------- APPLY FILTERS ---------------------------- */
  useEffect(() => {
    const applyFilters = async () => {
      setLoading(true);
      setPage(1);

      const res = await fetchFilteredProducts({
        page: 1,
        limit: 6,
        brand: selectedBrand,
        category: selectedCategorySlug,
        minPrice,
        maxPrice,
        rating: selectedRating,
      });

      if (res.success) {
        setAllProducts(res.data);
        setHasMore(res.hasMore);
      }

      setLoading(false);
    };

    applyFilters();
  }, [selectedBrand, selectedCategorySlug, minPrice, maxPrice, selectedRating]);

  /* ----------------------------- PAGINATION HANDLERS ---------------------------- */
  const goToPage = async (pageNum: number) => {
    setLoading(true);

    const res = await fetchFilteredProducts({
      page: pageNum,
      limit: 6,
      brand: selectedBrand,
      category: selectedCategorySlug,
      minPrice,
      maxPrice,
      rating: selectedRating,
    });

    if (res.success) {
      setAllProducts(res.data);
      setPage(pageNum);
      setHasMore(res.hasMore);
    }

    setLoading(false);
  };

  const nextPage = () => {
    if (hasMore && !loading) goToPage(page + 1);
  };

  const prevPage = () => {
    if (page > 1 && !loading) goToPage(page - 1);
  };

  /* ----------------------------- RESET FILTERS ------------------------------ */
  const resetFilters = async () => {
    setSelectedBrand(null);
    setSelectedCategorySlug(null);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setSelectedRating(null);
    setPage(1);
    setHasMore(true);

    const res = await fetchFilteredProducts({ page: 1, limit: 6 });
    if (res.success) {
      setAllProducts(res.data);
      setHasMore(res.hasMore);
    }
  };

  /* -------------------------------- RENDER --------------------------------- */
  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>

      {/* Mobile Filter Button */}
      <div className="block md:hidden mb-4">
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded font-medium shadow"
        >
          Apply Filters
        </button>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative w-3/4 max-w-xs bg-white p-4 overflow-y-auto">
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="bg-primary text-white px-4 py-2 rounded font-medium shadow mb-4"
            >
              Close Filters
            </button>

            <div className="space-y-6">
              {/* Price */}
              <div className="space-y-2">
                <h3 className="font-medium text-lighttext">Price</h3>
                <div className="flex items-start gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice ?? ""}
                    onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full h-9 border border-gray-300 rounded px-2 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice ?? ""}
                    onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full h-9 border border-gray-300 rounded px-2 text-sm"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <h3 className="font-medium text-lighttext">Category</h3>
                <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex justify-between cursor-pointer text-sm font-medium text-lighttext hover:text-primary transition-colors">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="category-mobile"
                          checked={selectedCategorySlug === cat.slug}
                          onChange={() =>
                            setSelectedCategorySlug(selectedCategorySlug === cat.slug ? null : cat.slug)
                          }
                          className="accent-primarymain cursor-pointer"
                        />
                        <span>{cat.categoryName}</span>
                      </div>
                      {cat.productCount && <span className="text-gray-400">({cat.productCount})</span>}
                    </label>
                  ))}
                </div>
              </div>

              {/* Brand */}
              <div className="space-y-2">
                <h3 className="font-medium text-lighttext">Brand</h3>
                <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                  {brands.map((brand) => (
                    <label key={brand.name} className="flex justify-between items-center cursor-pointer text-sm font-medium text-lighttext hover:text-primary transition-colors">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="brand-mobile"
                          checked={selectedBrand === brand.name}
                          onChange={() => setSelectedBrand(selectedBrand === brand.name ? null : brand.name)}
                          className="accent-primarymain cursor-pointer"
                        />
                        <span>{brand.name}</span>
                      </div>
                      <span className="text-gray-400">({brand.count})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <h3 className="font-medium text-lighttext">Rating</h3>
                {[5, 4, 3, 2, 1].map((r) => (
                  <div
                    key={r}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors"
                    onClick={() => setSelectedRating(selectedRating === r ? null : r)}
                  >
                    <input
                      type="radio"
                      checked={selectedRating === r}
                      onChange={() => setSelectedRating(r)}
                      className="accent-primarymain cursor-pointer"
                    />
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Icon
                          key={i}
                          icon="ic:round-star"
                          className={i < r ? "text-yellow-500 text-lg" : "text-gray-300 text-lg"}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={resetFilters}
                className="w-full py-2 text-sm text-white bg-primary hover:bg-primary/90 rounded-md transition-colors font-medium"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      )}

     <main className="grid md:grid-cols-7  gap-x-6">
      {/* ------------------------------- FILTERS ------------------------------ */}
      <aside className="hidden md:block col-span-2 h-fit sticky top-4">
        <div className="p-4 bg-zinc-50 rounded-md shadow-sm space-y-6">
          {/* Header */}
          <div className="flex justify-between pb-4 border-b">
            <h2 className="font-medium text-xl">Filter</h2>
            <Icon icon="mi:filter" width={24} height={24} />
          </div>

          {/* Price */}
          <div className="space-y-3">
            <h3 className="font-medium text-lighttext">Price</h3>
            <div className="flex items-start gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice ?? ""}
                onChange={(e) =>
                  setMinPrice(e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full h-9 border border-gray-300 rounded px-2 text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice ?? ""}
                onChange={(e) =>
                  setMaxPrice(e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full h-9 border border-gray-300 rounded px-2 text-sm"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-3">
            <h3 className="font-medium text-lighttext">Category</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex justify-between cursor-pointer text-sm font-medium text-lighttext hover:text-primary transition-colors"
                >
                  <div className="flex items-center gap-2">
                   <input
  type="radio"
  name="category"
  checked={selectedCategorySlug === cat.slug}
  onChange={() => setSelectedCategorySlug(cat.slug)}
  onClick={() => {
    if (selectedCategorySlug === cat.slug) {
      setSelectedCategorySlug(null);
    }
  }}
  className="accent-primarymain cursor-pointer"
/>

                    <span>{cat.categoryName}</span>
                  </div>
                  {cat.productCount && <span className="text-gray-400">({cat.productCount})</span>}
                </label>
              ))}
            </div>
          </div>

          {/* Brand */}
          <div className="space-y-3">
            <h3 className="font-medium text-lighttext">Brand</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {brands.map((brand) => (
  <label
    key={brand.name}
    className="flex justify-between items-center cursor-pointer text-sm font-medium text-lighttext hover:text-primary transition-colors"
  >
    <div className="flex items-center gap-2">
    <input
  type="radio"
  name="brand"
  checked={selectedBrand === brand.name}
  onChange={() => setSelectedBrand(brand.name)}
  onClick={() => {
    if (selectedBrand === brand.name) {
      setSelectedBrand(null);
    }
  }}
  className="accent-primarymain cursor-pointer"
/>

      <span>{brand.name}</span>
    </div>
    <span className="text-gray-400">({brand.count})</span>
  </label>
))}

            </div>
          </div>

          {/* Rating */}
          <div className="space-y-3">
            <h3 className="font-medium text-lighttext">Rating</h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((r) => (
                <div
                  key={r}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors"
                  onClick={() => setSelectedRating(selectedRating === r ? null : r)}
                >
                  <input
                    type="radio"
                    checked={selectedRating === r}
                    onChange={() => setSelectedRating(r)}
                    className="accent-primarymain cursor-pointer"
                  />
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Icon
                        key={i}
                        icon="ic:round-star"
                        className={
                          i < r
                            ? "text-yellow-500 text-lg"
                            : "text-gray-300 text-lg"
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          <button
            onClick={resetFilters}
            className="w-full py-2 text-sm text-white bg-primary hover:bg-primary/90 rounded-md transition-colors font-medium"
          >
            Clear All Filters
          </button>
        </div>
      </aside>


        {/* Products Grid */}
        <section className="col-span-5">
          <div className=" grid  sm:grid-cols-2  sm:justify-between sm:items-center mb-4">
            <div className="hidden sm:block text-sm text-gray-600">
            Showing {allProducts.length} product{allProducts.length !== 1 ? 's' : ''}  and have {pagination?.total} more
          </div>
          {/* ----------------- PAGINATION ----------------- */}
     <div>
       {allProducts.length > 0 && (
  <div className="flex justify-center items-center gap-1 sm:gap-2 flex-wrap">
    {/* Previous Button */}
    <button
      onClick={prevPage}
      disabled={page === 1 || loading}
      className="px-3 sm:px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-all font-medium text-xs sm:text-sm"
    >
      <span className="hidden sm:inline">Previous</span>
      <span className="sm:hidden">Prev</span>
    </button>

    {/* First Page + Ellipsis */}
    {page > 3 && (
      <>
        <button
          onClick={() => goToPage(1)}
          className="hidden sm:flex px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-all text-sm font-medium"
        >
          1
        </button>
        {page > 4 && (
          <span className="hidden sm:inline px-1 text-gray-400">...</span>
        )}
      </>
    )}

    {/* Visible Page Numbers */}
    {Array.from({ length: totalPages }, (_, i) => i + 1)
      .filter(pageNum => {
        // Mobile: show current page and 1 on each side
        // Desktop: show current page and 2 on each side
        const range = window.innerWidth < 640 ? 1 : 2;
        return pageNum >= page - range && pageNum <= page + range;
      })
      .map(pageNum => (
        <button
          key={pageNum}
          onClick={() => goToPage(pageNum)}
          disabled={loading}
          className={`px-3 py-2 rounded-md transition-all text-xs sm:text-sm font-medium min-w-[36px] ${
            pageNum === page
              ? 'bg-primary text-white border border-primary'
              : 'bg-white border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {pageNum}
        </button>
      ))}

    {/* Last Page + Ellipsis */}
    {page < totalPages - 2 && (
      <>
        {page < totalPages - 3 && (
          <span className="hidden sm:inline px-1 text-gray-400">...</span>
        )}
        <button
          onClick={() => goToPage(totalPages)}
          className="hidden sm:flex px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-all text-sm font-medium"
        >
          {totalPages}
        </button>
      </>
    )}

    {/* Next Button */}
    <button
      onClick={nextPage}
      disabled={!hasMore || loading}
      className="px-3 sm:px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-all font-medium text-xs sm:text-sm"
    >
      <span className="hidden sm:inline">Next</span>
      <span className="sm:hidden">Next</span>
    </button>
  </div>

)}

     </div>
          </div>

          <div className="grid lg:grid-cols-3 grid-cols-2 gap-4 transition-all duration-300">
            {allProducts.length > 0 ? (
              allProducts.map((prod, index) => (
                <div
                  key={prod.id}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${(index % 6) * 40}ms`, minHeight: '300px' }}
                >
                  <ProductCard label="All Products" product={prod} />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Icon icon="mdi:package-variant-closed-remove" className="text-gray-300 text-6xl mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">No products match your filters</p>
                <button onClick={resetFilters} className="mt-4 text-primary underline hover:no-underline">
                  Clear filters
                </button>
              </div>
            )}
          </div>

          
        </section>
      </main>
    </>
  );
};

export default ShopGrid;
