"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Icon } from "@iconify/react";
import { useSearchParams, useRouter } from "next/navigation"; // ✅ ADDED

import ProductCard from "@/components/card/product-card";
import { productType, CategoryType } from "@/types/product";
import { fetchFilteredProducts, PaginationMeta } from "@/lib/server/fetchers/fetchProducts";
import { BrandCount } from "@/lib/server/fetchers/fetchBrands";
import { createCategorySlug, formatCategoryDisplayName } from "@/lib/helpers/category";
import { buildGlobalCategoryOptions } from "@/lib/helpers/categorySelection";

/* ---------------------------------- PROPS --------------------------------- */
interface ShopGridProps {
  products: productType[];
  categories: CategoryType[];
  brands?: BrandCount[];
  pagination: PaginationMeta | undefined;
}

type CategoryNode = CategoryType & {
  children: CategoryNode[];
  pathLabel: string;
  hasDuplicateName: boolean;
};

type IndependentCategoryFilter = {
  label: string;
  value: string;
  count: number;
};

function buildCategoryTree(categories: CategoryType[]) {
  const nodes = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];
  const nameCounts = categories.reduce((counts, category) => {
    counts.set(category.slug, (counts.get(category.slug) || 0) + 1);
    return counts;
  }, new Map<string, number>());

  for (const category of categories) {
    nodes.set(category.id, {
      ...category,
      children: [],
      pathLabel: "",
      hasDuplicateName: (nameCounts.get(category.slug) || 0) > 1,
    });
  }

  for (const node of nodes.values()) {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)?.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const buildCategoryPath = (category: CategoryNode) => {
    const names: string[] = [];
    let current: CategoryNode | undefined = category;

    while (current) {
      names.unshift(formatCategoryDisplayName(current.categoryName));
      current = current.parentId ? nodes.get(current.parentId) : undefined;
    }

    return names.join(" / ");
  };

  const sortNodes = (items: CategoryNode[]) => {
    items.sort((a, b) =>
      a.categoryName.localeCompare(b.categoryName, undefined, { sensitivity: "base" })
    );
    items.forEach((item) => {
      item.pathLabel = buildCategoryPath(item);
      sortNodes(item.children);
    });
  };

  sortNodes(roots);
  return roots;
}

function buildIndependentCategoryFilters(categories: CategoryType[]) {
  return buildGlobalCategoryOptions(categories, { requireProductCount: true }).map((option) => ({
    label: option.label,
    value: option.value,
    count: option.count,
  }));
}

function CategoryFilterList({
  nodes,
  hiddenRootSlugs,
  selectedCategoryId,
  onSelect,
}: {
  nodes: CategoryNode[];
  hiddenRootSlugs?: Set<string>;
  selectedCategoryId: string | null;
  onSelect: (value: string) => void;
}) {
  const [collapsedIds, setCollapsedIds] = useState<string[]>([]);

  const toggleCollapsed = (id: string) => {
    setCollapsedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const renderNode = (node: CategoryNode, depth = 0) => {
    const isCollapsed = collapsedIds.includes(node.id);
    const hasChildren = node.children.length > 0;
    const count = node.hasDuplicateName
      ? node.directProductCount ?? node.productCount ?? 0
      : node.productCount || 0;

    return (
      <div key={node.id}>
        <div
          className="flex items-center justify-between gap-2 py-1 text-sm font-medium text-lighttext hover:text-primary"
          style={{ paddingLeft: `${depth * 14}px` }}
          title={node.pathLabel}
        >
          <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="category"
              checked={selectedCategoryId === node.id}
              onChange={() => onSelect(node.id)}
              onClick={() => {
                if (selectedCategoryId === node.id) onSelect("");
              }}
              className="accent-primarymain cursor-pointer"
            />
            <span className="min-w-0">
              <span className="block truncate">
                {node.hasDuplicateName ? node.pathLabel : node.categoryName}
              </span>
              {node.hasDuplicateName && node.parentId && (
                <span className="block truncate text-[11px] font-normal text-gray-400">
                  Exact category
                </span>
              )}
            </span>
          </label>
          <span className="shrink-0 text-xs text-gray-400">({count})</span>
          {hasChildren && (
            <button
              type="button"
              onClick={() => toggleCollapsed(node.id)}
              className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-primary"
              aria-label={isCollapsed ? "Expand category" : "Collapse category"}
            >
              <Icon icon={isCollapsed ? "mdi:chevron-right" : "mdi:chevron-down"} />
            </button>
          )}
        </div>
        {hasChildren && !isCollapsed && (
          <div>{node.children.map((child) => renderNode(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  const visibleNodes = hiddenRootSlugs
    ? nodes.filter((node) => !hiddenRootSlugs.has(node.slug))
    : nodes;

  return <div className="space-y-1">{visibleNodes.map((node) => renderNode(node))}</div>;
}

function IndependentCategoryChips({
  filters,
  selectedCategoryName,
  onSelect,
}: {
  filters: IndependentCategoryFilter[];
  selectedCategoryName: string | null;
  onSelect: (value: string) => void;
}) {
  if (filters.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Quick filters
      </h4>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const active = selectedCategoryName === filter.value;
          return (
            <button
              key={filter.value}
              type="button"
              title={`Show all ${filter.label} products across every parent category`}
              onClick={() => onSelect(active ? "" : filter.value)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                active
                  ? "border-primary bg-primary text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-primary hover:text-primary"
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------- COMPONENT -------------------------------- */
const ShopGrid = ({
  products: initialProducts,
  categories,
  brands = [],
  pagination,
}: ShopGridProps) => {

  /* ------------------------------ ROUTER (NEW) ------------------------------ */
  const searchParams = useSearchParams(); // ✅
  const router = useRouter(); // ✅

  /* ------------------------------ STATE ----------------------------- */
  const [allProducts, setAllProducts] = useState<productType[]>(initialProducts);
  const [currentPagination, setCurrentPagination] = useState<PaginationMeta | undefined>(
    pagination
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  /* ------------------------------ FILTER STATE ----------------------------- */
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const skippedInitialUnfilteredFetch = useRef(false);
  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);
  const independentCategoryFilters = useMemo(
    () => buildIndependentCategoryFilters(categories),
    [categories]
  );
  const globalCategoryFilterSlugs = useMemo(
    () => new Set(independentCategoryFilters.map((filter) => filter.value)),
    [independentCategoryFilters]
  );

  const totalPages = currentPagination?.totalPages || 1;

  /* -------------------- INIT CATEGORY FROM URL (NEW) -------------------- */
  useEffect(() => {
    const categoryIdFromUrl = searchParams.get("categoryId");
    const categoryNameFromUrl = searchParams.get("categoryName");
    const legacyCategoryFromUrl = searchParams.get("category");
    const brandFromUrl = searchParams.get("brand");
    const searchFromUrl = searchParams.get("search");

    const legacyPathCategory = legacyCategoryFromUrl?.includes("/")
      ? categories.find((category) => category.path === legacyCategoryFromUrl)
      : null;
    const legacyExactCategory =
      legacyCategoryFromUrl && !legacyCategoryFromUrl.startsWith("name:")
        ? categories.find(
            (category) =>
              category.path === legacyCategoryFromUrl ||
              category.slug === legacyCategoryFromUrl ||
              category.id === legacyCategoryFromUrl
          )
        : null;
    const legacyGlobalCategoryName = legacyCategoryFromUrl?.startsWith("name:")
      ? legacyCategoryFromUrl.replace(/^name:/, "")
      : null;

    setSelectedCategoryId(
      categoryIdFromUrl || legacyPathCategory?.id || legacyExactCategory?.id || null
    );
    setSelectedCategoryName(
      categoryIdFromUrl || legacyPathCategory || legacyExactCategory
        ? null
        : createCategorySlug(categoryNameFromUrl || legacyGlobalCategoryName || "")
          || null
    );

    if (brandFromUrl) {
      setSelectedBrand(brandFromUrl);
    }
    setSearchQuery(searchFromUrl?.trim() || null);
  }, [categories, searchParams]);

  /* -------------------- UPDATE URL WHEN CATEGORY CHANGES (NEW) -------------------- */
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedCategoryId) {
      params.set("categoryId", selectedCategoryId);
    } else {
      params.delete("categoryId");
    }

    if (selectedCategoryName) {
      params.set("categoryName", selectedCategoryName);
    } else {
      params.delete("categoryName");
    }
    params.delete("category");

    if (selectedBrand) {
      params.set("brand", selectedBrand);
    } else {
      params.delete("brand");
    }

    if (searchQuery) {
      params.set("search", searchQuery);
    } else {
      params.delete("search");
    }

    const queryString = params.toString();
    router.replace(queryString ? `/shop?${queryString}` : "/shop", { scroll: false });
  }, [selectedCategoryId, selectedCategoryName, selectedBrand, searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ----------------------------- APPLY FILTERS ---------------------------- */
  useEffect(() => {
    const applyFilters = async () => {
      const hasActiveFilters = Boolean(
        selectedBrand ||
        selectedCategoryId ||
        selectedCategoryName ||
        searchQuery ||
        minPrice !== undefined ||
        maxPrice !== undefined ||
        selectedRating !== null
      );

      if (!hasActiveFilters && !skippedInitialUnfilteredFetch.current) {
        skippedInitialUnfilteredFetch.current = true;
        return;
      }

      setLoading(true);
      setPage(1);

      const res = await fetchFilteredProducts({
        page: 1,
        limit: 6,
        brand: selectedBrand,
        categoryId: selectedCategoryId,
        categoryName: selectedCategoryName,
        search: searchQuery,
        minPrice,
        maxPrice,
        rating: selectedRating,
      });

      if (res.success) {
        setAllProducts(res.data);
        setCurrentPagination(res.pagination);
        setHasMore(res.hasMore);
      }

      setLoading(false);
    };

    applyFilters();
  }, [selectedBrand, selectedCategoryId, selectedCategoryName, searchQuery, minPrice, maxPrice, selectedRating]);

  /* ----------------------------- PAGINATION HANDLERS ---------------------------- */
  const goToPage = async (pageNum: number) => {
    setLoading(true);

    const res = await fetchFilteredProducts({
      page: pageNum,
      limit: 6,
      brand: selectedBrand,
      categoryId: selectedCategoryId,
      categoryName: selectedCategoryName,
      search: searchQuery,
      minPrice,
      maxPrice,
      rating: selectedRating,
    });

    if (res.success) {
      setAllProducts(res.data);
      setCurrentPagination(res.pagination);
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
    setSelectedCategoryId(null);
    setSelectedCategoryName(null);
    setSearchQuery(null);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setSelectedRating(null);
    setPage(1);
    setHasMore(true);

    router.replace("/shop", { scroll: false }); // ✅ clear URL

    const res = await fetchFilteredProducts({ page: 1, limit: 6 });
    if (res.success) {
      setAllProducts(res.data);
      setCurrentPagination(res.pagination);
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
        <div className="fixed inset-0 z-[60] flex">
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
                <IndependentCategoryChips
                  filters={independentCategoryFilters}
                  selectedCategoryName={selectedCategoryName}
                  onSelect={(value) => {
                    setSelectedCategoryName(value || null);
                    setSelectedCategoryId(null);
                  }}
                />
                <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                  <CategoryFilterList
                    nodes={categoryTree}
                    hiddenRootSlugs={globalCategoryFilterSlugs}
                    selectedCategoryId={selectedCategoryId}
                    onSelect={(value) => {
                      setSelectedCategoryId(value || null);
                      setSelectedCategoryName(null);
                    }}
                  />
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
            <IndependentCategoryChips
              filters={independentCategoryFilters}
              selectedCategoryName={selectedCategoryName}
              onSelect={(value) => {
                setSelectedCategoryName(value || null);
                setSelectedCategoryId(null);
              }}
            />
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <CategoryFilterList
                nodes={categoryTree}
                hiddenRootSlugs={globalCategoryFilterSlugs}
                selectedCategoryId={selectedCategoryId}
                onSelect={(value) => {
                  setSelectedCategoryId(value || null);
                  setSelectedCategoryName(null);
                }}
              />
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
  <div className="grid sm:grid-cols-2 sm:justify-between sm:items-center mb-4">
  <div className="hidden sm:block text-sm text-gray-600">
    Showing {allProducts.length} product{allProducts.length !== 1 ? 's' : ''}
    {searchQuery ? ` for "${searchQuery}"` : ""}
  </div>
  
  {/* ----------------- PAGINATION ----------------- */}
  <div>
    {allProducts.length > 0 && (
      <div className="flex justify-center sm:justify-end items-center gap-1 sm:gap-2 flex-wrap">
        {/* Previous Button */}
        <button
          onClick={prevPage}
          disabled={page === 1 || loading}
          className="px-3 sm:px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-all font-medium text-xs sm:text-sm"
        >
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
        </button>

        {/* Always show exactly 3 consecutive pages starting from current page */}
        {Array.from({ length: 3 }, (_, i) => page + i)
          .filter(pageNum => pageNum <= totalPages) // Don't show pages beyond total
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

        {/* Show ellipsis and last page if we're not near the end */}
        {page + 2 < totalPages && (
          <>
            <span className="px-1 text-gray-400 text-xs sm:text-sm">...</span>
            <button
              onClick={() => goToPage(totalPages)}
              className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-all text-xs sm:text-sm font-medium min-w-[36px]"
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
                <p className="text-gray-500 text-lg font-medium">No products found</p>
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
