"use client";

import Image from "next/image";
import React, { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CategoryType, productType } from "@/types/product";
import { Search, Edit, Trash2 } from "lucide-react";
import { deleteProductAction } from "@/lib/server/actions/admin/product/productActions";
import toast from "react-hot-toast";
import { AddProductForm, Product } from "@/app/admin/product/add-product/addproductForm";

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

  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<productType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<productType | null>(null);
  const [isPending, setIsPending] = useState(false);

  const page = pagination.page;
  const totalPages = pagination.totalPages;

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`?${params.toString()}`);
  };

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;

    return products.filter((product) => {
      const name = product.name?.toLowerCase() ?? "";
      const category = product.category?.categoryName?.toLowerCase() ?? "";
      const brand = product.brandName?.toLowerCase() ?? "";

      return name.includes(q) || category.includes(q) || brand.includes(q);
    });
  }, [products, search]);

  // Actual deletion function
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

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Products</h2>
          <p className="text-sm text-gray-500">
            Showing {filteredProducts.length} of {pagination.total} products
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product by name, category"
            className="border px-12 py-4 rounded-lg text-lg w-80 focus:outline-none"
          />
          <Search className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
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
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                {/* Product */}
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

                {/* Brand */}
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

                {/* Category */}
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

                {/* Price */}
                <td className="px-6 py-4 text-center font-medium">
                  {product.price?.toLocaleString()}
                </td>

                {/* Discount */}
          {/* Discount */}
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

                {/* Offered Price */}
                <td className="px-6 py-4 text-center">
                  {product.isOfferedPriceActive ? (
                    product.offeredPrice?.toLocaleString()
                  ) : (
                    <span className="px-2 py-1 rounded bg-red-50 text-red-600 text-sm">
                      Not Active
                    </span>
                  )}
                </td>

                {/* Stock */}
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

                {/* Status */}
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

                {/* Created */}
                <td className="px-6 py-4 text-right text-sm">
                  <div>{new Date(product.createdAt).toLocaleDateString()}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(product.createdAt).toLocaleTimeString()}
                  </div>
                </td>

                {/* Actions */}
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

      {/* Edit Form Modal */}
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


// Mapper
export function mapProductTypeToFormProduct(p: productType): Product {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    stock: p.stock,
    description: p.description,
    category: {
      id: p.category?.id || "",
      categoryName: p.category.categoryName
    },
    images: p.images || [],
    variants: p.variants || [],
    tags: p.tags.map(t => ({ id: t.id, name: t.name })),
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
