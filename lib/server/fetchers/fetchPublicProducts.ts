import { cacheLife, cacheTag } from "next/cache";
import {
  ApiSingleProductResponse,
  fetchAllProducts,
  fetchBestSellers,
  fetchHotDeals,
  fetchNewArrivals,
  fetchProductBySlug,
  PaginatedProductResponse,
} from "./fetchProducts";
import { productType } from "@/types/product";
import { connectDB } from "@/db";
import { Product } from "@/models/productModel";

export async function fetchPublicAllProducts(
  page = 1,
  limit = 12
): Promise<PaginatedProductResponse<productType>> {
  "use cache";

  cacheLife("minutes");
  cacheTag("products");
  cacheTag("categories");

  return fetchAllProducts(page, limit);
}

export async function fetchPublicBestSellers(
  page = 1,
  limit = 10,
  category?: string
): Promise<PaginatedProductResponse<productType>> {
  "use cache";

  cacheLife("minutes");
  cacheTag("products");
  cacheTag("homepage");

  return fetchBestSellers(page, limit, category);
}

export async function fetchPublicNewArrivals(
  page = 1,
  limit = 10,
  category?: string
): Promise<PaginatedProductResponse<productType>> {
  "use cache";

  cacheLife("minutes");
  cacheTag("products");
  cacheTag("homepage");

  return fetchNewArrivals(page, limit, category);
}

export async function fetchPublicHotDeals(
  page = 1,
  limit = 10,
  category?: string
): Promise<PaginatedProductResponse<productType>> {
  "use cache";

  cacheLife("minutes");
  cacheTag("products");
  cacheTag("homepage");
  cacheTag("promotions");

  return fetchHotDeals(page, limit, category);
}

export async function fetchPublicProductBySlug(
  slug: string
): Promise<ApiSingleProductResponse> {
  "use cache";

  cacheLife("minutes");
  cacheTag("products");
  cacheTag(`product:${slug}`);

  return fetchProductBySlug(slug);
}

export async function fetchPublicProductSlugs(): Promise<string[]> {
  "use cache";

  cacheLife("minutes");
  cacheTag("products");

  await connectDB();

  const products = await Product.find({ isActive: true }).select("slug").lean<{ slug: string }[]>();
  return products.map((product) => product.slug).filter(Boolean);
}
