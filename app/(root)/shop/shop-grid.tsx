"use client";

import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { Icon } from "@iconify/react";

import ProductCard from "@/components/card/product-card";
import { productType, CategoryType } from "@/types/product";
import { fetchAllProducts } from "@/lib/server/fetchers/fetchProducts";
import { fetchBrands } from "@/lib/server/actions/admin/brand/brandAction";

/* ---------------------------------- PROPS --------------------------------- */
interface ShopGridProps {
  products: productType[];
  categories: CategoryType[];
}

/* -------------------------------- COMPONENT -------------------------------- */
const ShopGrid = ({ products: initialProducts, categories }: ShopGridProps) => {
  /* ------------------------------ STATE ----------------------------- */
  const [allProducts, setAllProducts] = useState<productType[]>(initialProducts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  const [brands, setBrands] = useState<string[]>([]);



  /* ------------------------------ FILTER STATE ----------------------------- */
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  /* ----------------------------- FETCH STATIC BRANDS ------------------------ */

  useEffect(() => {
    const getBrands = async () => {
      try {
        const res = await fetchBrands();
        if (res.success && res.data) {
          setBrands(res.data); // static brand list
        }
      } catch (err) {
        console.error("Failed to fetch brands:", err);
      }
    };
    getBrands();
  }, []);

  /* ----------------------------- LOAD MORE PRODUCTS ---------------------------- */
  const loadMoreProducts = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await fetchAllProducts(nextPage, 6);
      const newProducts = res.data || [];

      if (newProducts.length > 0) {
        setAllProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const uniqueNewProducts = newProducts.filter(
            (p) => !existingIds.has(p.id)
          );
          return [...prev, ...uniqueNewProducts];
        });

        setPage(nextPage);

        if (newProducts.length < 6) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);


  /* ----------------------------- INTERSECTION OBSERVER ---------------------------- */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, loadMoreProducts]); // Removed 'page' dependency to prevent infinite loop

  /* ----------------------------- FILTER LOGIC ------------------------------ */
  // const filteredProducts = useMemo(() => {
  //   return allProducts.filter((product) => {
  //     if (minPrice !== undefined && product.price < minPrice) return false;
  //     if (maxPrice !== undefined && product.price > maxPrice) return false;

  //     if (selectedCategorySlug && product.category.slug !== selectedCategorySlug)
  //       return false;

  //     if (selectedRating && product.avgRating < selectedRating) return false;

  //     return true;
  //   });
  // }, [allProducts, minPrice, maxPrice, selectedCategorySlug, selectedRating]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      if (minPrice !== undefined && product.price < minPrice) return false;
      if (maxPrice !== undefined && product.price > maxPrice) return false;

      if (selectedCategorySlug && product.category.slug !== selectedCategorySlug)
        return false;

      if (selectedRating && product.avgRating < selectedRating) return false;

      // ✅ BRAND FILTER
      if (selectedBrand && product.brandName !== selectedBrand)
        return false;

      return true;
    });
  }, [
    allProducts,
    minPrice,
    maxPrice,
    selectedCategorySlug,
    selectedRating,
    selectedBrand,
  ]);

  /* ----------------------------- RESET FILTERS ------------------------------ */
  const resetFilters = () => {
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setSelectedCategorySlug(null);
    setSelectedRating(null);
    setSelectedBrand(null); // ✅ ADD THIS
    setAllProducts(initialProducts);
    setPage(1);
    setHasMore(true);
  };




  /* -------------------------------- RENDER --------------------------------- */
  return (
    <main className="grid md:grid-cols-7 gap-x-6">
      {/* ------------------------------- FILTERS ------------------------------ */}
      <aside className="hidden md:block col-span-2 h-fit sticky top-4">
        <div className="p-4 bg-zinc-50 rounded-md shadow-sm space-y-8 max-h-[calc(100vh-2rem)]">
          {/* Header */}
          <div className="flex justify-between pb-4 border-b">
            <h2 className="font-medium text-xl">Filter</h2>
            <Icon icon="mi:filter" width={24} height={24} />
          </div>

          {/* Price */}
          <div className="space-y-4">
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
          <div className="space-y-4">
            <h3 className="font-medium text-lighttext">Category</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
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
          <div className="space-y-4">
            <h3 className="font-medium text-lighttext">Brand</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-none">
              {brands.map((brand) => {
                // Count products for this brand
                const count = allProducts.filter((p) => p.brandName === brand).length;

                return (
                  <label
                    key={brand}
                    className="flex justify-between items-center cursor-pointer text-sm font-medium text-lighttext hover:text-primary transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="brand"
                        checked={selectedBrand === brand}
                        onChange={() =>
                          setSelectedBrand(selectedBrand === brand ? null : brand)
                        }
                        className="accent-primarymain cursor-pointer"
                      />
                      <span>{brand}</span>
                    </div>
                    <span className="text-gray-400">({count})</span>
                  </label>
                );
              })}
            </div>
          </div>


          {/* Rating */}
          <div className="space-y-4">
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

      {/* ------------------------------ PRODUCT GRID --------------------------- */}
      <section className="col-span-5">
        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
        </div>

        {/* Products Grid */}
        <div className="grid lg:grid-cols-3 grid-cols-2 gap-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((prod) => (
              <ProductCard label="All Products" key={prod.id} product={prod} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Icon icon="mdi:package-variant-closed-remove" className="text-gray-300 text-6xl mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No products match your filters</p>
              <button
                onClick={resetFilters}
                className="mt-4 text-primary underline hover:no-underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Infinite Scroll Trigger */}
        {hasMore && filteredProducts.length > 0 && (
          <div ref={observerTarget} className="flex justify-center py-8">
            {loading && (
              <div className="flex items-center gap-2 text-gray-500">
                <Icon icon="svg-spinners:ring-resize" className="text-2xl" />
                <span className="text-sm font-medium">Loading more products...</span>
              </div>
            )}
          </div>
        )}

        {/* End of Products */}
        {!hasMore && filteredProducts.length > 6 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            You&apos;ve reached the end of the products
          </div>
        )}
      </section>
    </main>
  );
};

export default ShopGrid;