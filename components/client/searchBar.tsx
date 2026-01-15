"use client";

import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { searchProducts } from "@/lib/server/actions/public/search/searchAction";

export type SearchResultType = {
 _id: string; name: string; slug: string }

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultType[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        // 🔹 Call server action directly
        const data = await searchProducts(query);
        setResults(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-xl">
      <input
        type="text"
        className="w-full p-3 border border-zinc-200 rounded-full"
        placeholder="Search for products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button className="absolute right-2 top-2 p-2 rounded-full bg-primary text-white">
        <Icon icon="ri:search-line" width={20} height={20} />
      </button>

      {results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-y-auto"
        >
          {results.map((product) => (
            <Link
              key={product._id}
              href={`/products/${product.slug}`}
              className="block px-4 py-2 hover:bg-gray-100"
              onClick={() => setQuery("")}
            >
              {product.name}
            </Link>
          ))}
        </div>
      )}

      {loading && (
        <div className="absolute right-2 top-2 text-white">
          <span className="animate-spin">⏳</span>
        </div>
      )}
    </div>
  );
}
