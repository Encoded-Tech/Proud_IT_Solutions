"use server";

import { FilterQuery } from "mongoose";
import { connectDB } from "@/db";
import { IProduct, Product } from "@/models/productModel";
import { Category, ProductVariant } from "@/models";
import { productType } from "@/types/product";
import { mapProductToFrontend } from "../mappers/MapProductData";
import { getCategoryAndDescendantIds } from "@/lib/server/helpers/categoryDescendants";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedProductResponse<T> {
  success: boolean;
  message: string;
  data: T[] | null;
  pagination?: PaginationMeta;
  error?: string | null;
}

export interface ApiSingleProductResponse {
  success: boolean;
  message: string;
  data: productType | null;
  status: number;
  error?: string | null;
}

interface ProductQueryOptions {
  includeInactive?: boolean;
  search?: string;
  status?: "active" | "inactive" | "all";
  categoryId?: string;
  brandName?: string;
  sort?: "newest" | "oldest" | "price_asc" | "price_desc";
}

interface FilteredParams {
  page: number;
  limit: number;
  brand?: string | null;
  category?: string | null;
  search?: string | null;
  minPrice?: number;
  maxPrice?: number;
  rating?: number | null;
}

const PRODUCT_CARD_SELECT =
  "name slug highlights price stock reservedStock category images variants avgRating totalReviews totalSales offeredPrice brandName isOfferedPriceActive discountPercent offerStartDate offerEndDate isActive createdAt updatedAt";

const PRODUCT_DETAIL_SELECT =
  "name slug description highlights price stock reservedStock category images variants reviews avgRating totalReviews totalSales offeredPrice tags brandName isOfferedPriceActive discountPercent offerStartDate offerEndDate isActive createdAt updatedAt";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type SearchRankingData = {
  searchOr: FilterQuery<IProduct>[];
  exactRegex: RegExp;
  startsWithRegex: RegExp;
  containsRegex: RegExp;
  variantProductIdSet: Set<string>;
};

type ProductWithSearchCategory = IProduct & {
  category?:
    | IProduct["category"]
    | {
        categoryName?: string;
      };
};

function getCategoryName(product: ProductWithSearchCategory) {
  const category = product.category;
  if (typeof category === "object" && category !== null && "categoryName" in category) {
    return category.categoryName || "";
  }
  return "";
}

function scoreSearchProduct(product: ProductWithSearchCategory, ranking: SearchRankingData) {
  let score = 0;
  const name = product.name || "";
  const brandName = product.brandName || "";
  const categoryName = getCategoryName(product);

  if (ranking.exactRegex.test(name)) score += 100;
  else if (ranking.startsWithRegex.test(name)) score += 80;
  else if (ranking.containsRegex.test(name)) score += 60;

  if (ranking.containsRegex.test(categoryName)) score += 50;
  if (ranking.variantProductIdSet.has(product._id.toString())) score += 40;
  if (ranking.containsRegex.test(brandName)) score += 25;

  return score;
}

function sortProductsBySearchRelevance<T extends ProductWithSearchCategory>(
  products: T[],
  ranking: SearchRankingData
) {
  return products
    .map((product) => ({
      product,
      score: scoreSearchProduct(product, ranking),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if ((b.product.stock > 0 ? 1 : 0) !== (a.product.stock > 0 ? 1 : 0)) {
        return (b.product.stock > 0 ? 1 : 0) - (a.product.stock > 0 ? 1 : 0);
      }
      return (
        new Date(b.product.createdAt || 0).getTime() -
        new Date(a.product.createdAt || 0).getTime()
      );
    })
    .map(({ product }) => product);
}

async function buildSearchRankingData(search: string): Promise<SearchRankingData> {
  const trimmedSearch = search.trim();
  const safeSearch = escapeRegex(trimmedSearch);
  const containsRegex = new RegExp(safeSearch, "i");
  const exactRegex = new RegExp(`^${safeSearch}$`, "i");
  const startsWithRegex = new RegExp(`^${safeSearch}`, "i");

  const [matchingCategories, matchingVariants] = await Promise.all([
    Category.find({ isActive: true, categoryName: containsRegex })
      .select("_id")
      .limit(25)
      .lean<{ _id: unknown }[]>(),
    ProductVariant.find({ isActive: true, sku: containsRegex })
      .select("product")
      .limit(100)
      .lean<{ product: unknown }[]>(),
  ]);

  const variantProductIds = matchingVariants.map((variant) => variant.product);

  return {
    exactRegex,
    startsWithRegex,
    containsRegex,
    variantProductIdSet: new Set(variantProductIds.map((id) => String(id))),
    searchOr: [
      { name: containsRegex },
      { brandName: containsRegex },
      ...(matchingCategories.length > 0
        ? [{ category: { $in: matchingCategories.map((category) => category._id) } }]
        : []),
      ...(variantProductIds.length > 0 ? [{ _id: { $in: variantProductIds } }] : []),
    ],
  };
}

async function queryProducts(
  page: number,
  limit: number,
  options?: ProductQueryOptions
): Promise<PaginatedProductResponse<productType>> {
  await connectDB();

  const skip = (page - 1) * limit;
  const filter: FilterQuery<IProduct> = {};
  let searchRanking: SearchRankingData | null = null;

  if (options?.search) {
    searchRanking = await buildSearchRankingData(options.search);
    filter.$or = searchRanking.searchOr;
  }

  if (options?.categoryId) {
    const categoryIds = await getCategoryAndDescendantIds(options.categoryId);
    filter.category = categoryIds.length > 0 ? { $in: categoryIds } : options.categoryId;
  }

  if (options?.brandName) {
    filter.brandName = { $regex: `^${options.brandName}$`, $options: "i" };
  }

  if (options?.status === "active") {
    filter.isActive = true;
  } else if (options?.status === "inactive") {
    filter.isActive = false;
  } else if (!options?.includeInactive) {
    filter.isActive = true;
  }

  let sortQuery: Record<string, 1 | -1> = { createdAt: -1 };
  switch (options?.sort) {
    case "oldest":
      sortQuery = { createdAt: 1 };
      break;
    case "price_asc":
      sortQuery = { price: 1 };
      break;
    case "price_desc":
      sortQuery = { price: -1 };
      break;
    case "newest":
    default:
      sortQuery = { createdAt: -1 };
  }

  const total = await Product.countDocuments(filter);
  const productsQuery = Product.find(filter)
    .sort(searchRanking ? { createdAt: -1 } : sortQuery)
    .select(PRODUCT_CARD_SELECT)
    .populate({
      path: "category",
      select: "categoryName slug categoryImage isActive",
    })
    .populate({
      path: "variants",
      match: { isActive: true },
      select: "price stock specs images isActive",
    })
    .lean<IProduct[]>();

  const products = searchRanking
    ? sortProductsBySearchRelevance(
        await productsQuery.limit(Math.max(page * limit, 120)),
        searchRanking
      ).slice(skip, skip + limit)
    : await productsQuery.skip(skip).limit(limit);

  return {
    success: true,
    message: "Products fetched successfully",
    data: products.map(mapProductToFrontend),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function queryRankedProducts(
  kind: "best" | "new" | "hot",
  page = 1,
  limit = 10,
  category?: string
): Promise<PaginatedProductResponse<productType>> {
  await connectDB();

  const skip = (page - 1) * limit;
  const filter: FilterQuery<IProduct> = { isActive: true };

  if (kind === "best") {
    filter.totalSales = { $gt: 0 };
  }

  if (kind === "hot") {
    filter.$or = [
      { discountPercent: { $gt: 0 } },
      { offeredPrice: { $gt: 0 }, isOfferedPriceActive: true },
    ];
  }

  if (category) {
    const categoryIds = await getCategoryAndDescendantIds(category);
    filter.category = categoryIds.length > 0 ? { $in: categoryIds } : category;
  }

  const total = await Product.countDocuments(filter);
  let sortQuery: Record<string, 1 | -1> = { createdAt: -1 };
  if (kind === "best") {
    sortQuery = { totalSales: -1 };
  } else if (kind === "hot") {
    sortQuery = { discountPercent: -1 };
  }

  const products = await Product.find(filter)
    .sort(sortQuery)
    .skip(skip)
    .limit(limit)
    .select(PRODUCT_CARD_SELECT)
    .populate("category", "categoryName slug categoryImage isActive")
    .populate({
      path: "variants",
      match: { isActive: true },
      select: "price stock specs images isActive",
    })
    .lean<IProduct[]>();

  return {
    success: true,
    message: "Products fetched successfully",
    data: products.map(mapProductToFrontend),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function queryProductBySlug(slug: string): Promise<ApiSingleProductResponse> {
  await connectDB();

  const product = await Product.findOne({ slug, isActive: true })
    .select(PRODUCT_DETAIL_SELECT)
    .populate({
      path: "category",
      select: "categoryName slug categoryImage isActive createdAt",
    })
    .populate({
      path: "variants",
      match: { isActive: true },
      select: "price stock specs images isActive",
    })
    .lean<IProduct>();

  if (!product) {
    return {
      success: false,
      message: "Product not found",
      data: null,
      status: 404,
    };
  }

  return {
    success: true,
    message: "Single product fetched successfully",
    data: mapProductToFrontend(product),
    status: 200,
  };
}

export async function fetchFilteredProducts({
  page,
  limit,
  brand,
  category,
  minPrice,
  maxPrice,
  rating,
  search,
}: FilteredParams) {
  await connectDB();

  const query: FilterQuery<IProduct> = { isActive: true };
  let searchRanking: SearchRankingData | null = null;

  if (brand) query.brandName = brand;
  if (search?.trim()) {
    searchRanking = await buildSearchRankingData(search);
    query.$or = searchRanking.searchOr;
  }
  if (category) {
    const categoryIds = await getCategoryAndDescendantIds(category);
    if (categoryIds.length > 0) query.category = { $in: categoryIds };
  }

  if (rating !== null && rating !== undefined) {
    query.avgRating = { $gte: rating };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = minPrice;
    if (maxPrice !== undefined) query.price.$lte = maxPrice;
  }

  const total = await Product.countDocuments(query);
  const productsQuery = Product.find(query)
    .sort({ createdAt: -1 })
    .select(PRODUCT_CARD_SELECT)
    .populate("category", "categoryName slug categoryImage isActive")
    .populate({
      path: "variants",
      match: { isActive: true },
      select: "price stock specs images isActive",
    })
    .lean<IProduct[]>();

  const skip = (page - 1) * limit;
  const products = searchRanking
    ? sortProductsBySearchRelevance(
        await productsQuery.limit(Math.max(page * limit, 120)),
        searchRanking
      ).slice(skip, skip + limit)
    : await productsQuery.skip(skip).limit(limit);

  return {
    success: true,
    message: "Products fetched successfully",
    data: products.map(mapProductToFrontend),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    hasMore: page * limit < total,
  };
}

export async function fetchAllProducts(
  page = 1,
  limit = 12,
  options?: ProductQueryOptions
): Promise<PaginatedProductResponse<productType>> {
  try {
    return await queryProducts(page, limit, options);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("fetchAllProducts error:", msg);

    return {
      success: false,
      message: "Failed to fetch products",
      data: null,
      error: msg,
    };
  }
}

export async function fetchBestSellers(
  page = 1,
  limit = 10,
  category?: string
): Promise<PaginatedProductResponse<productType>> {
  try {
    return await queryRankedProducts("best", page, limit, category);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unexpected server error";
    console.error("Best Sellers Fetch Error:", errorMessage);

    return {
      success: false,
      message: "Failed to fetch best sellers",
      data: null,
      error: errorMessage,
    };
  }
}

export async function fetchNewArrivals(
  page = 1,
  limit = 10,
  category?: string
): Promise<PaginatedProductResponse<productType>> {
  try {
    return await queryRankedProducts("new", page, limit, category);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unexpected server error";
    console.error("New Arrivals Fetch Error:", errorMessage);

    return {
      success: false,
      message: "Failed to fetch new arrivals",
      data: null,
      error: errorMessage || "Unexpected error",
    };
  }
}

export async function fetchHotDeals(
  page = 1,
  limit = 10,
  category?: string
): Promise<PaginatedProductResponse<productType>> {
  try {
    return await queryRankedProducts("hot", page, limit, category);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unexpected server error";
    console.error("Hot Deals Fetch Error:", errorMessage);

    return {
      success: false,
      message: "Failed to fetch hot deals",
      data: null,
      error: errorMessage || "Unexpected error",
    };
  }
}

export async function fetchProductBySlug(slug: string): Promise<ApiSingleProductResponse> {
  try {
    return await queryProductBySlug(slug);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unexpected server error";
    console.error("Fetch Product By Slug Error:", errorMessage);

    return {
      success: false,
      message: "Failed to fetch product",
      data: null,
      status: 500,
      error: errorMessage,
    };
  }
}
