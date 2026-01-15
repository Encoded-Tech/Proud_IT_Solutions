import { Product } from "@/models/productModel";
import { Category } from "@/models/categoryModel";
import { ProductVariant } from "@/models/productVariantsModel";
import { BuildRequest } from "@/models/buildMyPcModel";
import { connectDB } from "@/db";
import Contact from "@/models/contactModel";
import userModel from "@/models/userModel";
import { Order } from "@/models/orderModel";
import { PartOption } from "@/models/partsOption";

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalVariants: number;
  totalBuildRequests: number;
  totalUsers: number;
  totalOrders: number;
  totalInboxMessages: number;
  totalBuildPartsAvailable: number;

  // Trends: percentage of total added last week
  productTrend: number;
  categoryTrend: number;
  variantTrend: number;
  buildRequestTrend: number;
  userTrend: number;
  orderTrend: number;
  inboxTrend: number;
  buildPartsTrend: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await connectDB();

  const now = new Date();

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(now.getDate() - 7);

  // Helper: calculate trend as % of total (capped 0–100)
  const calculateTrend = (lastWeekCount: number, totalCount: number) =>
    totalCount > 0 ? Math.min((lastWeekCount / totalCount) * 100, 100) : 0;

  // Fetch totals & last week counts in parallel
  const [
    totalProducts,
    totalCategories,
    totalVariants,
    totalBuildRequests,
    totalUsers,
    totalOrders,
    totalInboxMessages,
    totalBuildPartsAvailable,

    thisWeekProducts,
    thisWeekCategories,
    thisWeekVariants,
    thisWeekBuildRequests,
    thisWeekUsers,
    thisWeekOrders,
    thisWeekInbox,
    thisWeekParts,
  ] = await Promise.all([
    Product.countDocuments(),
    Category.countDocuments(),
    ProductVariant.countDocuments(),
    BuildRequest.countDocuments(),
    userModel.countDocuments(),
    Order.countDocuments(),
    Contact.countDocuments(),
    PartOption.countDocuments(),

    Product.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
    Category.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
    ProductVariant.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
    BuildRequest.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
    userModel.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
    Order.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
    Contact.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
    PartOption.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
  ]);

  return {
    totalProducts,
    totalCategories,
    totalVariants,
    totalBuildRequests,
    totalUsers,
    totalOrders,
    totalInboxMessages,
    totalBuildPartsAvailable,

    productTrend: calculateTrend(thisWeekProducts, totalProducts),
    categoryTrend: calculateTrend(thisWeekCategories, totalCategories),
    variantTrend: calculateTrend(thisWeekVariants, totalVariants),
    buildRequestTrend: calculateTrend(thisWeekBuildRequests, totalBuildRequests),
    userTrend: calculateTrend(thisWeekUsers, totalUsers),
    orderTrend: calculateTrend(thisWeekOrders, totalOrders),
    inboxTrend: calculateTrend(thisWeekInbox, totalInboxMessages),
    buildPartsTrend: calculateTrend(thisWeekParts, totalBuildPartsAvailable),
  };
}
