import React from "react";
import { Metadata } from "next";
import { APP_NAME, SERVER_PRODUCTION_URL } from "@/config/env";
import ShopCategories from "./shop-category";
import ShopGrid from "./shop-grid";
import { fetchPublicCategories } from "@/lib/server/fetchers/fetchCategory";
import { fetchPublicAllProducts } from "@/lib/server/fetchers/fetchPublicProducts";
import { fetchPublicBrands } from "@/lib/server/fetchers/fetchBrands";
import { fetchFilteredProducts } from "@/lib/server/fetchers/fetchProducts";

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
    description: `Browse and buy laptops, custom PCs, printers, monitors, and accessories from a trusted electronics store in Kathmandu, Nepal.`,
    url: `${SERVER_PRODUCTION_URL}/shop`,
    images: [],
  },
  twitter: {
    card: "summary_large_image",
    title: `Shop Gadgets in Nepal | ${APP_NAME}`,
    description: `Buy laptops, custom PCs, printers, monitors, and accessories online in Kathmandu & Nepal.`,
    images: []
  },
 
};


const page = async ({
  searchParams,
}: {
  searchParams?: Promise<{
    category?: string;
    categoryId?: string;
    categoryName?: string;
    brand?: string;
    search?: string;
  }>;
}) => {
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

  const categories = categoriesRes.data || [];
  const products = productsRes.data || [];
  const brands = brandsRes.data || [];

  return (
    <main className="max-w-7xl xl:mx-auto mx-4 my-10 md:space-y-12 space-y-8">
      {/* Seo section */}
<div className="sr-only">
  {/* H1 for SEO */}
  <h1>Shop Laptops, PCs, and Accessories Online in Nepal</h1>

  {/* Keyword-rich intro paragraph */}
  <p>
    Welcome to Proud Nepal, the most trusted electronics store in Nepal! 
    Shop high-quality laptops, custom PCs, monitors, printers, and computer 
    accessories—all at unbeatable prices. Whether you are in Kathmandu, Putalisadak, 
    or anywhere in Nepal, discover the latest gadgets, hot deals, and top-rated 
    electronics to upgrade your home, office, or gaming setup. Build your perfect PC, 
    find powerful laptops, and get authentic accessories with fast delivery and 
    reliable support—all in one place at <a href="https://proudnepal.com.np/">Proud Nepal</a>.
  </p>
</div>
    {/* Seo section */}

      <h2 className="font-medium text-lighttext">
        Home / <span className="text-black "> Shop</span>
      </h2>
      <ShopCategories categories={categories} />
      <ShopGrid
        products={products}
        categories={categories}
        brands={brands}
        pagination={productsRes.pagination}
      />
    </main>
  );
};

export default page;
