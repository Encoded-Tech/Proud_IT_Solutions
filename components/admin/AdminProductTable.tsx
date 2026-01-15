"use client";

import Image from "next/image";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { productType } from "@/types/product";

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ProductTable({
  products,
  pagination,
}: {
  products: productType[];
  pagination: PaginationMeta;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = pagination.page;
  const totalPages = pagination.totalPages;

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b flex justify-between">
        <div>
          <h2 className="text-2xl font-bold">Products</h2>
          <p className="text-sm text-gray-500">
            Showing {products.length} of {pagination.total} products
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Product</th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase">Category</th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase">Price</th>
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
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-gray-500">
                      {product.variants?.length ?? 0} variants
                    </p>
                  </div>
                </td>

                <td className="px-6 py-4 text-center">
                  {product.category?.categoryName ?? "—"}
                </td>

                <td className="px-6 py-4 text-center font-medium">
                  NPR {product.price?.toLocaleString()}
                </td>

                <td className="px-6 py-4 text-right text-sm">
                  {new Date(product.createdAt).toLocaleDateString()}
                </td>

                <td className="px-6 py-4 text-center">
                  <button className="text-sm text-blue-600">Edit</button>
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
    </div>
  );
}
