import React, { Suspense } from "react";
import { Metadata } from "next";
import { APP_NAME, SERVER_PRODUCTION_URL } from "@/config/env";
import ShopCategories from "./shop-category";
import ShopGrid from "./shop-grid";
import { fetchPublicCategories } from "@/lib/server/fetchers/fetchCategory";
import { fetchPublicAllProducts } from "@/lib/server/fetchers/fetchPublicProducts";
import { fetchPublicBrands } from "@/lib/server/fetchers/fetchBrands";
import { fetchFilteredProducts } from "@/lib/server/fetchers/fetchProducts";
import { Skeleton } from "@/components/ui/skeleton";

type ShopSearchParams = {
  category?: string;
  categoryId?: string;
  categoryName?: string;
  brand?: string;
  search?: string;
};

export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_NAME}`,
    default: `Shop Gadgets in Nepal | Laptops, PCs & Accessories | ${APP_NAME}`,
  },
  keywords: [
    "shop electronics Nepal",
    "buy electronics online Nepal",
    "online electronics store Nepal",
    "electronics shopping Nepal",
    "electronics price in Nepal",
    "buy gadgets Nepal",
    "electronics marketplace Nepal",
    "best electronics deals Nepal",
    "laptops and accessories Nepal",
    "buy laptops online Nepal",
    "gaming pc shop Nepal",
    "custom pc build Nepal",
    "computer accessories Nepal",
    "mobile phones shop Nepal",
    "buy smartphones Nepal",
    "genuine gadgets Nepal",
    "electronics with warranty Nepal",
    "tech store online Nepal",
    "electronics delivery Nepal",
    "trusted electronics shop Nepal",
  ],
  description: `Shop laptops, custom PCs, printers, monitors, and computer accessories in Nepal. Find the best deals in Kathmandu & Putalisadak with trusted products from ${APP_NAME}.`,
  alternates: {
    canonical: `${SERVER_PRODUCTION_URL}/shop`,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: `Shop Gadgets in Nepal | Laptops, PCs & Accessories | ${APP_NAME}`,
    description:
      "Browse and buy laptops, custom PCs, printers, monitors, and accessories from a trusted electronics store in Kathmandu, Nepal.",
    url: `${SERVER_PRODUCTION_URL}/shop`,
    images: [],
  },
  twitter: {
    card: "summary_large_image",
    title: `Shop Gadgets in Nepal | ${APP_NAME}`,
    description: "Buy laptops, custom PCs, printers, monitors, and accessories online in Kathmandu & Nepal.",
    images: [],
  },
};

async function ShopCategorySection() {
  const categoriesRes = await fetchPublicCategories();
  return <ShopCategories categories={categoriesRes.data || []} />;
}

async function ShopGridSection({
  searchParams,
}: {
  searchParams?: Promise<ShopSearchParams>;
}) {
  const params = await searchParams;
  const legacyGlobalCategoryName = params?.category?.startsWith("name:")
    ? params.category.slice("name:".length)
    : null;
  const effectiveCategoryName = params?.categoryName || legacyGlobalCategoryName;
  const legacyCategory = legacyGlobalCategoryName ? null : params?.category;
  const hasInitialFilters = Boolean(
    params?.categoryId ||
      effectiveCategoryName ||
      legacyCategory ||
      params?.brand ||
      params?.search
  );

  const [categoriesRes, productsRes, brandsRes] = await Promise.all([
    fetchPublicCategories(),
    hasInitialFilters
      ? fetchFilteredProducts({
          page: 1,
          limit: 6,
          brand: params?.brand || null,
          categoryId: params?.categoryId || null,
          categoryName: params?.categoryId ? null : effectiveCategoryName || null,
          category: params?.categoryId || effectiveCategoryName ? null : legacyCategory || null,
          search: params?.search || null,
        })
      : fetchPublicAllProducts(1, 6),
    fetchPublicBrands(),
  ]);

  return (
    <ShopGrid
      products={productsRes.data || []}
      categories={categoriesRes.data || []}
      brands={brandsRes.data || []}
      pagination={productsRes.pagination}
    />
  );
}

function ShopCategorySkeleton() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-4 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] md:px-6">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-6 w-44" />
        </div>
        <Skeleton className="hidden h-9 w-24 rounded-full sm:block" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-slate-200 bg-white p-3">
            <Skeleton className="aspect-[4/3] w-full rounded-lg" />
            <Skeleton className="mt-3 h-4 w-3/4" />
            <Skeleton className="mt-2 h-3 w-1/2" />
          </div>
        ))}
      </div>
    </section>
  );
}

function ShopGridSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-7">
      <aside className="hidden md:col-span-2 md:block">
        <div className="sticky top-4 space-y-6 rounded-md bg-zinc-50 p-4 shadow-sm">
          <div className="flex justify-between border-b pb-4">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-7 w-7 rounded-full" />
          </div>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-5/6" />
            </div>
          ))}
        </div>
      </aside>
      <section className="md:col-span-5">
        <div className="mb-5 flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-xl border bg-white p-3 shadow-sm">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="mt-4 h-5 w-5/6" />
              <Skeleton className="mt-2 h-4 w-1/2" />
              <div className="mt-4 flex items-center justify-between">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-9 w-24 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </section>
    </div>
  );
}

export default function ShopPage({
  searchParams,
}: {
  searchParams?: Promise<ShopSearchParams>;
}) {
  return (
    <main className="mx-4 my-10 max-w-7xl space-y-8 md:space-y-12 xl:mx-auto">
      <div className="sr-only">
        <h1>Shop Laptops, PCs, and Accessories Online in Nepal</h1>
        <p>
          Welcome to Proud Nepal, the most trusted electronics store in Nepal. Shop
          high-quality laptops, custom PCs, monitors, printers, and computer accessories
          at competitive prices.
        </p>
      </div>

      <h2 className="font-medium text-lighttext">
        Home / <span className="text-black"> Shop</span>
      </h2>

      <Suspense fallback={<ShopCategorySkeleton />}>
        <ShopCategorySection />
      </Suspense>

      <Suspense fallback={<ShopGridSkeleton />}>
        <ShopGridSection searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
