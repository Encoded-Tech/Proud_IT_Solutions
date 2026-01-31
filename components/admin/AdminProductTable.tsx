


"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CategoryType, productType } from "@/types/product";
import { Search, Edit, Trash2, ArrowUpDown } from "lucide-react";
import { deleteProductAction } from "@/lib/server/actions/admin/product/productActions";
import toast from "react-hot-toast";
import { AddProductForm, Product } from "@/app/admin/product/add-product/addproductForm";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ProductTable({
  products,
  pagination,
  categories,
}: {
  products: productType[];
  categories: CategoryType[];
  pagination: PaginationMeta;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  /* ---------------- URL STATE ---------------- */
  const page = pagination.page;
  const totalPages = pagination.totalPages;

  const currentSearch = searchParams.get("search") ?? "";
  const currentStatus = searchParams.get("status") ?? "all";
  const currentSort = searchParams.get("sort") ?? "newest";

  const [search, setSearch] = useState(currentSearch);
  const [status, setStatus] = useState(currentStatus);
  const [sort, setSort] = useState(currentSort);

  const [editingProduct, setEditingProduct] = useState<productType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<productType | null>(null);
  const [isPending, setIsPending] = useState(false);

  /* ---------------- LIVE SEARCH (DEBOUNCED) ---------------- */
  useEffect(() => {
    if (search === currentSearch) return; // 👈 prevent reset

    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (search.trim()) params.set("search", search.trim());
      else params.delete("search");

      params.set("page", "1");
      router.push(`?${params.toString()}`);
    }, 400);

    return () => clearTimeout(timeout);
  }, [search, router, currentSearch, searchParams]);


  /* ---------------- SYNC UI WITH URL ---------------- */
  useEffect(() => {
    setSearch(currentSearch);
    setStatus(currentStatus);
    setSort(currentSort);
  }, [currentSearch, currentStatus, currentSort]);

  /* ---------------- PARAM UPDATER ---------------- */
  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "all") params.delete(key);
      else params.set(key, value);
    });

    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`?${params.toString()}`);
  };

  /* ---------------- DELETE ---------------- */
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setIsPending(true);
    const res = await deleteProductAction({ productId: deleteTarget.id });
    setIsPending(false);

    if (res.success) {
      toast.success(res.message);
      router.refresh();
      setDeleteTarget(null);
    } else {
      toast.error(res.message);
    }
  };

  const hasActiveFilters =
    !!currentSearch ||
    currentStatus !== "all" ||
    currentSort !== "newest";


  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Products</h2>
          <p className="text-sm text-gray-500">
            Showing {products.length} of {pagination.total} products
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 items-center">
          {/* Status */}
          <Select
            value={status}
            onValueChange={(value) => updateParams({ status: value })}
          >
            <SelectTrigger className="w-[260px] py-8 rounded-lg  text-lg ">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">🟢 Active</SelectItem>
              <SelectItem value="inactive">🔴 Inactive</SelectItem>
            </SelectContent>
          </Select>


          {/* Sort */}
          <div className="relative">
            <ArrowUpDown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <Select
              value={sort}
              onValueChange={(value) => updateParams({ sort: value })}
            >
              <SelectTrigger className="w-[260px]  py-8 rounded-lg  text-lg ">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-gray-500" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="price_asc">Price ↑</SelectItem>
                <SelectItem value="price_desc">Price ↓</SelectItem>
              </SelectContent>
            </Select>

          </div>

          {/* Search */}
          <div className="relative">
            <Search className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product or brand"
              className="border px-12 py-4 rounded-lg text-lg w-80 focus:outline-none"
            />
          </div>
          {hasActiveFilters && (
            <button
              onClick={() => router.push("?")}
              className="px-5 py-4 rounded-lg text-lg border border-red-300 
           text-red-600 hover:bg-red-50 
           hover:border-red-400 transition"
            >
              ❌ Clear All
            </button>
          )}
        </div>

      </div>



      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Product</th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase">Brand</th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase">Category</th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase">Price (NPR)</th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase">Discount %</th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase">Offered Price (NPR)</th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase">Stock</th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase">Status</th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase">Created</th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 flex gap-3">
                  <div className="relative w-14 h-14 border rounded">
                    <Image
                      src={product.images?.[0] ?? ""}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex items-center">
                    <p className="font-medium">{product.name}</p>
                  </div>
                </td>

                <td className="px-6 py-4 text-center">
                  {product.brandName ? (
                    <span className="px-3 py-1 rounded bg-blue-50 text-blue-800 text-sm">
                      {product.brandName}
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded bg-red-100 text-red-700 text-sm">
                      Not Provided
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 text-center">
                  {product.category?.categoryName ? (
                    <span className="px-3 py-1 rounded bg-green-50 text-green-800 text-sm">
                      {product.category.categoryName}
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded bg-red-100 text-red-700 text-sm">
                      Not Provided
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 text-center font-medium">
                  {product.price?.toLocaleString()}
                </td>

                <td className="px-6 py-4 text-center">
                  {product.isOfferedPriceActive ? (
                    <span className="px-2 py-1 rounded bg-green-50 text-green-700 text-sm">
                      {product.discountPercent}%
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded bg-red-50 text-red-600 text-sm">
                      Not Offered
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 text-center">
                  {product.isOfferedPriceActive ? (
                    product.offeredPrice?.toLocaleString()
                  ) : (
                    <span className="px-2 py-1 rounded bg-red-50 text-red-600 text-sm">
                      Not Active
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 text-center">
                  {product.stock > 0 ? (
                    <span className="px-2 py-1 rounded bg-green-50 text-green-700 text-sm">
                      In stock ({product.stock})
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded bg-red-50 text-red-600 text-sm">
                      Out of stock
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 text-center">
                  {product.isActive ? (
                    <span className="px-2 py-1 rounded bg-green-50 text-green-700 text-sm">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded bg-red-50 text-red-600 text-sm">
                      Inactive
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 text-right text-sm">
                  <div>{new Date(product.createdAt).toLocaleDateString()}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(product.createdAt).toLocaleTimeString()}
                  </div>
                </td>

                <td className="px-6 py-8 text-center flex justify-center gap-2">
                  <button
                    className="p-2 rounded bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                    onClick={() => setEditingProduct(product)}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 rounded bg-red-50 text-red-700 hover:bg-red-100"
                    onClick={() => setDeleteTarget(product)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t flex justify-between items-center">
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>

          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => goToPage(page - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>

            <button
              disabled={page === totalPages}
              onClick={() => goToPage(page + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-start pt-16 z-50 overflow-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-6xl relative">
            <button
              className="absolute top-4 right-4 bg-white text-red-700 text-lg rounded-full px-3 py-1 shadow-md hover:bg-gray-100 hover:text-red-600 transition-all duration-200 flex items-center justify-center"
              onClick={() => setEditingProduct(null)}
              aria-label="Close"
            >
              <span className="text-lg font-bold">✕</span>
            </button>

            <AddProductForm
              categories={categories}
              editProduct={mapProductTypeToFormProduct(editingProduct)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-2">Delete product?</h3>
            <p className="text-sm text-gray-600 mb-6">
              This will permanently delete <span className="font-medium">{deleteTarget.name}</span>.
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg border text-sm"
                disabled={isPending}
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                disabled={isPending}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm flex items-center gap-2 disabled:opacity-60"
              >
                {isPending && <span className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full"></span>}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* ---------------- Mapper (UNCHANGED) ---------------- */
export function mapProductTypeToFormProduct(p: productType): Product {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    stock: p.stock,
    description: p.description,
    category: {
      id: p.category?.id || "",
      categoryName: p.category.categoryName,
    },
    images: p.images || [],
    variants: p.variants || [],
    tags: p.tags.map((t) => ({ id: t.id, name: t.name })),
    brandName: p.brandName,
    discountPercent: p.discountPercent,
    offeredPrice: p.offeredPrice,
    isOfferedPriceActive: p.isOfferedPriceActive,
    offerStartDate: p.offerStartDate?.toISOString() || "",
    offerEndDate: p.offerEndDate?.toISOString() || "",
    isActive: p.isActive,
    createdAt: p.createdAt,
    totalSales: p.totalSales || 0,
    avgRating: p.avgRating,
  };
}

