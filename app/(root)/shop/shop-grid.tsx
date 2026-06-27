"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useRouter, useSearchParams } from "next/navigation";

import ProductCard from "@/components/card/product-card";
import { buildGlobalCategoryOptions } from "@/lib/helpers/categorySelection";
import { createCategorySlug, formatCategoryDisplayName } from "@/lib/helpers/category";
import { buildShopFilterParams, buildShopUrl } from "@/lib/helpers/shopFilters";
import { BrandCount } from "@/lib/server/fetchers/fetchBrands";
import { fetchFilteredProducts, PaginationMeta } from "@/lib/server/fetchers/fetchProducts";
import { CategoryType, productType } from "@/types/product";

interface ShopGridProps {
  products: productType[];
  categories: CategoryType[];
  brands?: BrandCount[];
  pagination: PaginationMeta | undefined;
}

type SortValue = "newest" | "oldest" | "price_asc" | "price_desc";

type FilterState = {
  categoryId: string | null;
  categoryName: string | null;
  brand: string | null;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  rating: number | null;
  sort: SortValue;
  search: string | null;
  page: number;
};

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

const FILTERS_TO_CLEAR = {
  categoryId: null,
  categoryName: null,
  brand: null,
  minPrice: undefined,
  maxPrice: undefined,
  rating: null,
} as const;

function optionalNumber(value: string | null) {
  if (value === null || value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function readFilters(
  params: Pick<URLSearchParams, "get">,
  categories: CategoryType[]
): FilterState {
  const categoryId = params.get("categoryId");
  const categoryName = params.get("categoryName");
  const legacyCategory = params.get("category");
  const legacyExact =
    legacyCategory && !legacyCategory.startsWith("name:")
      ? categories.find(
          (category) =>
            category.id === legacyCategory ||
            category.slug === legacyCategory ||
            category.path === legacyCategory
        )
      : undefined;
  const legacyGlobal = legacyCategory?.startsWith("name:")
    ? legacyCategory.slice("name:".length)
    : null;
  const exactId = categoryId || legacyExact?.id || null;
  const rawSort = params.get("sort");
  const sort: SortValue =
    rawSort === "oldest" || rawSort === "price_asc" || rawSort === "price_desc"
      ? rawSort
      : "newest";

  return {
    categoryId: exactId,
    categoryName: exactId
      ? null
      : createCategorySlug(categoryName || legacyGlobal || "") || null,
    brand: params.get("brand") || null,
    minPrice: optionalNumber(params.get("minPrice")),
    maxPrice: optionalNumber(params.get("maxPrice")),
    rating: optionalNumber(params.get("rating")) ?? null,
    sort,
    search: params.get("search")?.trim() || null,
    page: Math.max(1, Number.parseInt(params.get("page") || "1", 10) || 1),
  };
}

function filterSignature(filters: FilterState) {
  return JSON.stringify(filters);
}

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
    if (node.parentId && nodes.has(node.parentId)) nodes.get(node.parentId)?.children.push(node);
    else roots.push(node);
  }

  const pathFor = (node: CategoryNode) => {
    const labels: string[] = [];
    let current: CategoryNode | undefined = node;
    while (current) {
      labels.unshift(formatCategoryDisplayName(current.categoryName));
      current = current.parentId ? nodes.get(current.parentId) : undefined;
    }
    return labels.join(" / ");
  };
  const sort = (items: CategoryNode[]) => {
    items.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
    items.forEach((item) => {
      item.pathLabel = pathFor(item);
      sort(item.children);
    });
  };
  sort(roots);
  return roots;
}

function CategoryFilterList({
  nodes,
  hiddenRootSlugs,
  selectedCategoryId,
  onSelect,
  inputName,
}: {
  nodes: CategoryNode[];
  hiddenRootSlugs: Set<string>;
  selectedCategoryId: string | null;
  onSelect: (value: string) => void;
  inputName: string;
}) {
  const [collapsedIds, setCollapsedIds] = useState<string[]>([]);
  const renderNode = (node: CategoryNode, depth = 0) => {
    const collapsed = collapsedIds.includes(node.id);
    const count = node.hasDuplicateName
      ? node.directProductCount ?? node.productCount ?? 0
      : node.productCount || 0;
    return (
      <div key={node.id}>
        <div
          className="flex min-h-11 items-center justify-between gap-2 text-sm font-medium text-lighttext hover:text-primary"
          style={{ paddingLeft: `${depth * 14}px` }}
          title={node.pathLabel}
        >
          <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 py-2">
            <input
              type="radio"
              name={inputName}
              checked={selectedCategoryId === node.id}
              onChange={() => onSelect(node.id)}
              onClick={() => selectedCategoryId === node.id && onSelect("")}
              className="h-4 w-4 cursor-pointer accent-primary"
            />
            <span className="min-w-0 flex-1">
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
          {node.children.length > 0 && (
            <button
              type="button"
              onClick={() =>
                setCollapsedIds((current) =>
                  current.includes(node.id)
                    ? current.filter((id) => id !== node.id)
                    : [...current, node.id]
                )
              }
              className="flex h-11 w-9 shrink-0 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-primary"
              aria-label={collapsed ? "Expand category" : "Collapse category"}
            >
              <Icon icon={collapsed ? "mdi:chevron-right" : "mdi:chevron-down"} />
            </button>
          )}
        </div>
        {!collapsed && node.children.length > 0 && (
          <div>{node.children.map((child) => renderNode(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {nodes.filter((node) => !hiddenRootSlugs.has(node.slug)).map((node) => renderNode(node))}
    </div>
  );
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
      <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Quick filters</h4>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const active = selectedCategoryName === filter.value;
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => onSelect(active ? "" : filter.value)}
              className={`min-h-11 rounded-full border px-3 py-2 text-xs font-semibold transition ${
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

function FilterControls({
  filters,
  setFilters,
  categoryTree,
  categoryOptions,
  globalCategorySlugs,
  brands,
  mode,
}: {
  filters: FilterState;
  setFilters: (patch: Partial<FilterState>) => void;
  categoryTree: CategoryNode[];
  categoryOptions: IndependentCategoryFilter[];
  globalCategorySlugs: Set<string>;
  brands: BrandCount[];
  mode: "desktop" | "mobile";
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="font-medium text-lighttext">Price</h3>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-gray-500">
            Minimum
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="Min"
              value={filters.minPrice ?? ""}
              onChange={(event) => setFilters({ minPrice: optionalNumber(event.target.value) })}
              className="mt-1 h-11 w-full min-w-0 rounded border border-gray-300 px-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="text-xs text-gray-500">
            Maximum
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="Max"
              value={filters.maxPrice ?? ""}
              onChange={(event) => setFilters({ maxPrice: optionalNumber(event.target.value) })}
              className="mt-1 h-11 w-full min-w-0 rounded border border-gray-300 px-3 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-medium text-lighttext">Category</h3>
        <IndependentCategoryChips
          filters={categoryOptions}
          selectedCategoryName={filters.categoryName}
          onSelect={(categoryName) => setFilters({ categoryName: categoryName || null, categoryId: null })}
        />
        <div className="max-h-52 overflow-y-auto overscroll-contain pr-1">
          <CategoryFilterList
            nodes={categoryTree}
            hiddenRootSlugs={globalCategorySlugs}
            selectedCategoryId={filters.categoryId}
            onSelect={(categoryId) => setFilters({ categoryId: categoryId || null, categoryName: null })}
            inputName={`category-${mode}`}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-medium text-lighttext">Brand</h3>
        <div className="max-h-52 space-y-1 overflow-y-auto overscroll-contain pr-1">
          {brands.map((brand) => (
            <label
              key={brand.name}
              className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded px-1 text-sm font-medium text-lighttext transition hover:bg-gray-100 hover:text-primary"
            >
              <span className="flex min-w-0 items-center gap-3">
                <input
                  type="radio"
                  name={`brand-${mode}`}
                  checked={filters.brand === brand.name}
                  onChange={() => setFilters({ brand: brand.name })}
                  onClick={() => filters.brand === brand.name && setFilters({ brand: null })}
                  className="h-4 w-4 cursor-pointer accent-primary"
                />
                <span className="truncate">{brand.name}</span>
              </span>
              <span className="shrink-0 text-gray-400">({brand.count})</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium text-lighttext">Rating</h3>
        {[5, 4, 3, 2, 1].map((rating) => (
          <label
            key={rating}
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded px-1 transition hover:bg-gray-100"
          >
            <input
              type="radio"
              name={`rating-${mode}`}
              checked={filters.rating === rating}
              onChange={() => setFilters({ rating })}
              onClick={() => filters.rating === rating && setFilters({ rating: null })}
              className="h-4 w-4 cursor-pointer accent-primary"
            />
            <span className="flex items-center" aria-label={`${rating} stars and above`}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Icon
                  key={index}
                  icon="ic:round-star"
                  className={index < rating ? "text-lg text-yellow-500" : "text-lg text-gray-300"}
                />
              ))}
              <span className="ml-2 text-xs text-gray-500">& above</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

const ShopGrid = ({ products: initialProducts, categories, brands = [], pagination }: ShopGridProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialFilters = useRef(readFilters(searchParams, categories)).current;
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [draftFilters, setDraftFilters] = useState<FilterState>(initialFilters);
  const [allProducts, setAllProducts] = useState(initialProducts);
  const [currentPagination, setCurrentPagination] = useState(pagination);
  const [hasMore, setHasMore] = useState(
    initialFilters.page < (pagination?.totalPages || 1)
  );
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const firstFetch = useRef(true);
  const requestId = useRef(0);

  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);
  const categoryOptions = useMemo(
    () =>
      buildGlobalCategoryOptions(categories, { requireProductCount: true }).map((option) => ({
        label: option.label,
        value: option.value,
        count: option.count,
      })),
    [categories]
  );
  const globalCategorySlugs = useMemo(
    () => new Set(categoryOptions.map((option) => option.value)),
    [categoryOptions]
  );

  useEffect(() => {
    const next = readFilters(searchParams, categories);
    setFilters((current) =>
      filterSignature(current) === filterSignature(next) ? current : next
    );
  }, [categories, searchParams]);

  useEffect(() => {
    if (firstFetch.current) {
      firstFetch.current = false;
      return;
    }
    const currentRequest = ++requestId.current;
    const loadProducts = async () => {
      setLoading(true);
      try {
        const result = await fetchFilteredProducts({
          page: filters.page,
          limit: 6,
          brand: filters.brand,
          categoryId: filters.categoryId,
          categoryName: filters.categoryName,
          search: filters.search,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          rating: filters.rating,
          sort: filters.sort,
        });
        if (currentRequest !== requestId.current) return;
        if (result.success) {
          setAllProducts(result.data);
          setCurrentPagination(result.pagination);
          setHasMore(result.hasMore);
        }
      } finally {
        if (currentRequest === requestId.current) {
          setLoading(false);
          setApplying(false);
        }
      }
    };
    void loadProducts();
  }, [filters]);

  useEffect(() => {
    if (!mobileFilterOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileFilterOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileFilterOpen]);

  const navigate = (next: FilterState, resetPage = true) => {
    const normalized = { ...next, page: resetPage ? 1 : next.page };
    setFilters(normalized);
    const params = buildShopFilterParams(
      searchParams,
      {
        categoryId: normalized.categoryId,
        categoryName: normalized.categoryName,
        brand: normalized.brand,
        minPrice: normalized.minPrice,
        maxPrice: normalized.maxPrice,
        rating: normalized.rating,
        sort: normalized.sort === "newest" ? null : normalized.sort,
        search: normalized.search,
        page: normalized.page,
      },
      { resetPage }
    );
    router.replace(buildShopUrl(params), { scroll: false });
  };

  const updateDesktopFilters = (patch: Partial<FilterState>) => {
    navigate({ ...filters, ...patch }, true);
  };

  const openMobileFilters = () => {
    setDraftFilters(readFilters(searchParams, categories));
    setMobileFilterOpen(true);
  };

  const applyMobileFilters = () => {
    setApplying(true);
    navigate(draftFilters, true);
    setMobileFilterOpen(false);
  };

  const clearAllFilters = () => {
    const cleared = { ...filters, ...FILTERS_TO_CLEAR, page: 1 };
    setDraftFilters(cleared);
    setApplying(true);
    navigate(cleared, true);
    setMobileFilterOpen(false);
  };

  const goToPage = (page: number) => navigate({ ...filters, page }, false);
  const totalPages = currentPagination?.totalPages || 1;
  const activeFilterCount = [
    Boolean(filters.categoryId || filters.categoryName),
    Boolean(filters.brand),
    filters.minPrice !== undefined || filters.maxPrice !== undefined,
    filters.rating !== null,
  ].filter(Boolean).length;

  const selectedCategoryLabel = filters.categoryId
    ? categories.find((category) => category.id === filters.categoryId)?.categoryName || "Category"
    : filters.categoryName
      ? categoryOptions.find((option) => option.value === filters.categoryName)?.label ||
        formatCategoryDisplayName(filters.categoryName)
      : null;

  const chips = [
    selectedCategoryLabel
      ? {
          key: "category",
          label: `Category: ${selectedCategoryLabel}`,
          clear: { categoryId: null, categoryName: null },
        }
      : null,
    filters.brand
      ? { key: "brand", label: `Brand: ${filters.brand}`, clear: { brand: null } }
      : null,
    filters.minPrice !== undefined || filters.maxPrice !== undefined
      ? {
          key: "price",
          label: `Price: ${filters.minPrice !== undefined ? `Rs. ${filters.minPrice.toLocaleString()}` : "Any"} - ${
            filters.maxPrice !== undefined ? `Rs. ${filters.maxPrice.toLocaleString()}` : "Any"
          }`,
          clear: { minPrice: undefined, maxPrice: undefined },
        }
      : null,
    filters.rating !== null
      ? { key: "rating", label: `Rating: ${filters.rating}★ & above`, clear: { rating: null } }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    label: string;
    clear: Partial<FilterState>;
  }>;

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
        <button
          type="button"
          onClick={openMobileFilters}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
          aria-haspopup="dialog"
          aria-expanded={mobileFilterOpen}
        >
          <Icon icon="mi:filter" className="text-xl" />
          Filter
          {activeFilterCount > 0 && (
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1.5 text-xs font-bold text-primary">
              {activeFilterCount}
            </span>
          )}
        </button>
        <span className="text-sm text-gray-600">
          {currentPagination?.total ?? allProducts.length} product
          {(currentPagination?.total ?? allProducts.length) === 1 ? "" : "s"}
        </span>
      </div>

      <div
        className={`fixed inset-0 z-[80] lg:hidden ${mobileFilterOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!mobileFilterOpen}
        inert={!mobileFilterOpen}
      >
        <button
          type="button"
          aria-label="Close filters"
          onClick={() => setMobileFilterOpen(false)}
          className={`fixed inset-0 bg-black/40 transition-opacity duration-300 ${
            mobileFilterOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-filter-title"
          className={`fixed inset-x-0 bottom-0 z-[90] flex max-h-[85dvh] flex-col rounded-t-3xl bg-white shadow-2xl transition-transform duration-300 ease-out ${
            mobileFilterOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <header className="flex shrink-0 items-center justify-between border-b bg-white px-4 py-4">
            <div>
              <h2 id="mobile-filter-title" className="text-lg font-semibold text-gray-950">
                Filter Products
              </h2>
              <p className="text-xs text-gray-500">Choose filters, then apply once</p>
            </div>
            <button
              type="button"
              onClick={() => setMobileFilterOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
              aria-label="Close filter drawer"
            >
              <Icon icon="mdi:close" className="text-2xl" />
            </button>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5">
            <FilterControls
              filters={draftFilters}
              setFilters={(patch) => setDraftFilters((current) => ({ ...current, ...patch }))}
              categoryTree={categoryTree}
              categoryOptions={categoryOptions}
              globalCategorySlugs={globalCategorySlugs}
              brands={brands}
              mode="mobile"
            />
          </div>
          <footer className="grid shrink-0 grid-cols-2 gap-3 border-t bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={clearAllFilters}
              disabled={applying}
              className="min-h-11 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={applyMobileFilters}
              disabled={applying}
              className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60"
            >
              {applying && <Icon icon="mdi:loading" className="animate-spin text-lg" />}
              Apply Filters
            </button>
          </footer>
        </section>
      </div>

      <main className="grid gap-x-6 lg:grid-cols-7">
        <aside className="sticky top-4 col-span-2 hidden h-fit lg:block">
          <div className="space-y-6 rounded-md bg-zinc-50 p-4 shadow-sm">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-xl font-medium">Filter</h2>
              <Icon icon="mi:filter" width={24} height={24} />
            </div>
            <FilterControls
              filters={filters}
              setFilters={updateDesktopFilters}
              categoryTree={categoryTree}
              categoryOptions={categoryOptions}
              globalCategorySlugs={globalCategorySlugs}
              brands={brands}
              mode="desktop"
            />
            <button
              type="button"
              onClick={clearAllFilters}
              className="min-h-11 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
            >
              Clear All Filters
            </button>
          </div>
        </aside>

        <section className="relative min-w-0 lg:col-span-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="hidden text-sm text-gray-600 sm:block">
              Showing {allProducts.length} of {currentPagination?.total ?? allProducts.length} products
              {filters.search ? ` for “${filters.search}”` : ""}
            </div>
            <label className="ml-auto flex min-h-11 items-center gap-2 text-sm text-gray-600">
              <span>Sort</span>
              <select
                value={filters.sort}
                onChange={(event) =>
                  updateDesktopFilters({ sort: event.target.value as SortValue })
                }
                className="h-11 max-w-[190px] rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-primary"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price_asc">Price: Low to high</option>
                <option value="price_desc">Price: High to low</option>
              </select>
            </label>
          </div>

          {chips.length > 0 && (
            <div className="mb-4 flex max-w-full flex-wrap gap-2" aria-label="Active filters">
              {chips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => updateDesktopFilters(chip.clear)}
                  className="inline-flex min-h-10 max-w-full items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-left text-xs font-medium text-primary transition hover:bg-red-100"
                  aria-label={`Remove ${chip.label}`}
                >
                  <span className="truncate">{chip.label}</span>
                  <Icon icon="mdi:close" className="shrink-0 text-base" />
                </button>
              ))}
              <button
                type="button"
                onClick={clearAllFilters}
                className="min-h-10 px-2 text-xs font-semibold text-gray-500 underline-offset-4 hover:text-primary hover:underline"
              >
                Clear all
              </button>
            </div>
          )}

          <div className="relative min-h-72">
            {loading && (
              <div className="absolute inset-0 z-20 flex items-start justify-center bg-white/70 pt-20 backdrop-blur-[1px]" aria-live="polite">
                <span className="flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm">
                  <Icon icon="mdi:loading" className="animate-spin text-xl text-primary" />
                  Updating products…
                </span>
              </div>
            )}
            <div className={`grid grid-cols-2 gap-4 transition-opacity duration-200 lg:grid-cols-3 ${loading ? "opacity-60" : "opacity-100"}`}>
              {allProducts.length > 0 ? (
                allProducts.map((product) => <ProductCard key={product.id} label="All Products" product={product} />)
              ) : (
                <div className="col-span-full py-12 text-center">
                  <Icon icon="mdi:package-variant-closed-remove" className="mx-auto mb-4 text-6xl text-gray-300" />
                  <p className="text-lg font-medium text-gray-500">No products found</p>
                  <button type="button" onClick={clearAllFilters} className="mt-4 min-h-11 text-primary underline hover:no-underline">
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {allProducts.length > 0 && totalPages > 1 && (
            <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Product pagination">
              <button
                type="button"
                onClick={() => goToPage(filters.page - 1)}
                disabled={filters.page === 1 || loading}
                className="min-h-11 rounded-md border border-gray-300 bg-white px-4 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter((page) => page === 1 || page === totalPages || Math.abs(page - filters.page) <= 1)
                .map((page, index, pages) => (
                  <React.Fragment key={page}>
                    {index > 0 && page - pages[index - 1] > 1 && <span className="px-1 text-gray-400">…</span>}
                    <button
                      type="button"
                      onClick={() => goToPage(page)}
                      disabled={loading}
                      className={`h-11 min-w-11 rounded-md border px-3 text-sm font-medium ${
                        page === filters.page
                          ? "border-primary bg-primary text-white"
                          : "border-gray-300 bg-white hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
              <button
                type="button"
                onClick={() => goToPage(filters.page + 1)}
                disabled={!hasMore || loading}
                className="min-h-11 rounded-md border border-gray-300 bg-white px-4 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          )}
        </section>
      </main>
    </>
  );
};

export default ShopGrid;
