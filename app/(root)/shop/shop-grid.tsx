"use client";

import React, { useMemo, useState } from "react";
import { Icon } from "@iconify/react";

import ProductCard from "@/components/card/product-card";
import { productType, CategoryType } from "@/types/product";

/* ---------------------------------- PROPS --------------------------------- */
interface ShopGridProps {
  products: productType[];
  categories: CategoryType[];
}

/* -------------------------------- COMPONENT -------------------------------- */
const ShopGrid = ({ products, categories }: ShopGridProps) => {
  /* ------------------------------ FILTER STATE ----------------------------- */
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(
    null
  );
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  /* ----------------------------- FILTER LOGIC ------------------------------ */
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (minPrice !== undefined && product.price < minPrice) return false;
      if (maxPrice !== undefined && product.price > maxPrice) return false;

      if (selectedCategorySlug && product.category.slug !== selectedCategorySlug)
        return false;

      if (selectedRating && product.avgRating < selectedRating) return false;

      return true;
    });
  }, [products, minPrice, maxPrice, selectedCategorySlug, selectedRating]);

  /* -------------------------------- RENDER --------------------------------- */
  return (
    <main className="grid md:grid-cols-7 gap-x-6">
      {/* ------------------------------- FILTERS ------------------------------ */}
      <aside className="hidden md:block col-span-2 p-4 bg-zinc-50 rounded-md shadow-sm space-y-8">
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
              className="w-full h-9 border border-gray-300 rounded px-2"
            />
            <input
              type="number"
              placeholder="Max"
              value={maxPrice ?? ""}
              onChange={(e) =>
                setMaxPrice(e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-full h-9 border border-gray-300 rounded px-2"
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-4">
          <h3 className="font-medium text-lighttext">Category</h3>
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex justify-between cursor-pointer text-sm font-medium text-lighttext hover:text-primary"
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategorySlug === cat.slug}
                  onChange={() => setSelectedCategorySlug(cat.slug)}
                  className="accent-primarymain"
                />
                <span>{cat.categoryName}</span>
              </div>
              {cat.productCount && <span>({cat.productCount})</span>}
            </label>
          ))}
        </div>

        {/* Rating */}
        <div className="space-y-4">
          <h3 className="font-medium text-lighttext">Rating</h3>
          {[5, 4, 3, 2, 1].map((r) => (
            <div
              key={r}
              className="flex items-center cursor-pointer"
              onClick={() => setSelectedRating(r)}
            >
              {Array.from({ length: r }).map((_, i) => (
                <Icon
                  key={i}
                  icon="ic:round-star"
                  className={
                    selectedRating && r <= selectedRating
                      ? "text-yellow-500 text-xl"
                      : "text-gray-300 text-xl"
                  }
                />
              ))}
            </div>
          ))}
        </div>

        {/* Clear Filters */}
        <button
          onClick={() => {
            setMinPrice(undefined);
            setMaxPrice(undefined);
            setSelectedCategorySlug(null);
            setSelectedRating(null);
          }}
          className="text-sm text-primary underline"
        >
          Clear filters
        </button>
      </aside>

      {/* ------------------------------ PRODUCT GRID --------------------------- */}
      <section className="col-span-5">
        <div className="grid lg:grid-cols-3 grid-cols-2 gap-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))
          ) : (
            <p className="text-gray-500 col-span-full">
              No products match your filters.
            </p>
          )}
        </div>
      </section>
    </main>
  );
};

export default ShopGrid;
