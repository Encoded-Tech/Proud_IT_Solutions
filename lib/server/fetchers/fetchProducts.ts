"use server";
import { IProduct, Product } from "@/models/productModel";
import { FilterQuery } from "mongoose";
import { connectDB } from "@/db";
import { mapProductToFrontend } from "../mappers/MapProductData";
import { productType } from "@/types/product";
import { Category } from "@/models";


export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number; // required
  
}


export interface PaginatedProductResponse<T> {
  success: boolean;
  message: string;
  data: T[] | null;
  pagination?: PaginationMeta;
  error?: string | null;
}

// fetchFilteredProducts.ts






interface Params {
  page: number;
  limit: number;
  brand?: string | null;
  category?: string | null;
  minPrice?: number;
  maxPrice?: number;
  rating?: number | null;
}

export async function fetchFilteredProducts({
  page,
  limit,
  brand,
  category,
  minPrice,
  maxPrice,
  rating,
}: Params) {
  const query: FilterQuery<IProduct> = {};

  if (brand) query.brandName = brand;
if (category) {
    const cat = await Category.findOne({ slug: category }).select("_id");
    if (cat) query.category = cat._id;
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

  const products = await Product.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

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


// export async function fetchAllProducts(
//   page = 1,
//   limit = 6,
//   filters?: FilterQuery<IProduct>
// ): Promise<PaginatedProductResponse<productType>> {
//   try {
//     await connectDB();

//     const skip = (page - 1) * limit;

//     const filter: FilterQuery<IProduct> = { isActive: true, ...filters };

//     const total = await Product.countDocuments(filter);

//     const products = await Product.find(filter)
//       .sort({ createdAt: -1 }) // newest first
//       .skip(skip)
//       .limit(limit)
//       .populate({
//     path: "category",
//     select: "categoryName slug categoryImage isActive createdAt"
//   })
//       .populate({
//         path: "variants",
//         match: { isActive: true },
//         select: "price stock specs images isActive",
//       })
//       .lean<IProduct[]>();

//     return {
//       success: true,
//       message: "Products fetched successfully",
//       data: products.map(mapProductToFrontend),
//     pagination: {
//   page,
//   limit,
//   total: total ?? 0,  
//   totalPages: Math.ceil((total ?? 0) / limit),
// }
//     };
//   } catch (error) {
//     const errorMessage = error instanceof Error ? error.message : "Unexpected server error";
//     console.error("Fetch All Products Error:", errorMessage);

//     return {
//       success: false,
//       message: "Failed to fetch products",
//       data: null,
//       error: errorMessage,
//     };
//   }
// }

// export async function fetchAllProducts(
//   page = 1,
//   limit = 6,
//   options?: {
//     includeInactive?: boolean; // admin use
//     filters?: FilterQuery<IProduct>;
//   }
// ): Promise<PaginatedProductResponse<productType>> {
//   try {
//     await connectDB();

//     const skip = (page - 1) * limit;

//     const filter: FilterQuery<IProduct> = {
//       ...(options?.filters ?? {}),
//     };

//     // 👇 SAFE DEFAULT: frontend
//     if (!options?.includeInactive) {
//       filter.isActive = true;
//     }

//     const total = await Product.countDocuments(filter);

//     const products = await Product.find(filter)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .populate({
//         path: "category",
//         select: "categoryName slug categoryImage isActive createdAt",
//       })
//       .populate({
//         path: "variants",
//         match: { isActive: true }, // variants stay frontend-safe
//         select: "price stock specs images isActive",
//       })
//       .lean<IProduct[]>();

//     return {
//       success: true,
//       message: "Products fetched successfully",
//       data: products.map(mapProductToFrontend),
//       pagination: {
//         page,
//         limit,
//         total: total ?? 0,
//         totalPages: Math.ceil((total ?? 0) / limit),
//       },
//     };
//   } catch (error) {
//     const errorMessage =
//       error instanceof Error ? error.message : "Unexpected server error";
//     console.error("Fetch All Products Error:", errorMessage);

//     return {
//       success: false,
//       message: "Failed to fetch products",
//       data: null,
//       error: errorMessage,
//     };
//   }
// }


export async function fetchAllProducts(
  page = 1,
  limit = 12,
  options?: {
    includeInactive?: boolean;              // admin only
    search?: string;                        // global search
    status?: "active" | "inactive" | "all"; // admin filter
    categoryId?: string;                    // category filter
    brandName?: string;                     // brand filter
    sort?: "newest" | "oldest" | "price_asc" | "price_desc";
  }
): Promise<PaginatedProductResponse<productType>> {
  try {
    await connectDB();

    const skip = (page - 1) * limit;
    const filter: FilterQuery<IProduct> = {};

    /* -------------------------------- SEARCH -------------------------------- */
    if (options?.search) {
      filter.$or = [
        { name: { $regex: options.search, $options: "i" } },
        { brandName: { $regex: options.search, $options: "i" } },
      ];
    }

    /* ------------------------------ CATEGORY -------------------------------- */
    if (options?.categoryId) {
      filter.category = options.categoryId;
    }

    /* ------------------------------- BRAND ---------------------------------- */
    if (options?.brandName) {
      filter.brandName = { $regex: `^${options.brandName}$`, $options: "i" };
    }

    /* ------------------------------- STATUS --------------------------------- */
    if (options?.status === "active") {
      filter.isActive = true;
    } else if (options?.status === "inactive") {
      filter.isActive = false;
    } else if (!options?.includeInactive) {
      // 👈 frontend safe default
      filter.isActive = true;
    }

    /* -------------------------------- SORT ---------------------------------- */
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

    /* ------------------------------- QUERY ---------------------------------- */
    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .populate({
        path: "category",
        select: "categoryName slug categoryImage isActive",
      })
      .populate({
        path: "variants",
        match: { isActive: true }, // frontend-safe
        select: "price stock specs images",
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
    await connectDB();

    const skip = (page - 1) * limit;

    // Base filter
    const filter: FilterQuery<IProduct> = {
      isActive: true,
      totalSales: { $gt: 0 },
    };

    if (category) filter.category = category;

    // Count total
    const total = await Product.countDocuments(filter);

    // Query
    const products = await Product.find(filter)
      .sort({ totalSales: -1 })
      .skip(skip)
      .limit(limit)
      .populate("category", "categoryName")
      .populate({
        path: "variants",
        match: { isActive: true },
        select: "price stock specs images isActive",
      })
      .lean<IProduct[]>();

    return {
      success: true,
      message: "Best Sellers fetched successfully",
      data: products.map(mapProductToFrontend),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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
    await connectDB();

    const skip = (page - 1) * limit;

    const filter: FilterQuery<IProduct> = {
      isActive: true,
    };

    if (category) filter.category = category;

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .sort({ createdAt: -1 }) // ← newest first
      .skip(skip)
      .limit(limit)
      .populate("category", "categoryName")
      .populate({
        path: "variants",
        match: { isActive: true },
        select: "price stock specs images isActive",
      })
      .lean<IProduct[]>();

    return {
      success: true,
      message: "New Arrivals fetched successfully",
      data: products.map(mapProductToFrontend),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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
    await connectDB();

    const skip = (page - 1) * limit;

    // Detect hot deals
    const filter: FilterQuery<IProduct> = {
      isActive: true,
      $or: [
        { discountPercent: { $gt: 0 } },
        { offeredPrice: { $gt: 0 }, isOfferedPriceActive: true },
      ],
    };
    if (category) filter.category = category;

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .sort({ discountPercent: -1 }) // highest discount first
      .skip(skip)
      .limit(limit)
      .populate("category", "categoryName")
      .populate({
        path: "variants",
        match: { isActive: true },
        select: "price salePrice stock specs images isActive",
      })
      .lean<IProduct[]>();

    return {
      success: true,
      message: "Hot Deals fetched successfully",
      data: products.map(mapProductToFrontend),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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


export interface ApiSingleProductResponse {
  success: boolean;
  message: string;
  data: productType | null;
  status: number;
  error?: string | null;
}

export async function fetchProductBySlug(slug: string): Promise<ApiSingleProductResponse> {
  try {
    await connectDB();

    const product = await Product.findOne({ slug, isActive: true })
      .populate({
    path: "category",
    select: "categoryName slug categoryImage isActive createdAt"
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unexpected server error";
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
