import { SERVER_PRODUCTION_URL } from "@/config/env";
import { fetchAllProductsNoPagination } from "@/lib/server/actions/admin/product/productActions";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  // Static routes
  const staticRoutes = [
    "", // home leave as empty string
    "about",
    "contact",
    "blogs",
    "shop",
    "build-my-pc",
  ];

  const staticSitemap = staticRoutes.map((route) => ({
    url: `${SERVER_PRODUCTION_URL}/${route}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Fetch all products from database
   const res = await fetchAllProductsNoPagination();
  const products = res.data || [] // returns array of products with {slug, updatedAt}

  const productSitemap = products.map((product) => ({
    url: `${SERVER_PRODUCTION_URL}/products/${product.slug}`,
    lastModified: new Date(product.updatedAt).toISOString(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));


  // Combine static + product URLs
  return [...staticSitemap, ...productSitemap];
}
