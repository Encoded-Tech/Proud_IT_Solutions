"use client";

import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "@/components/ui/optimized-image";

export type SearchResultType = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  categoryName: string;
  brandName: string;
  stock: number;
  available: boolean;
};

type SearchBarProps = {
  mobile?: boolean;
  onNavigate?: () => void;
};

export default function SearchBar({ mobile = false, onNavigate }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultType[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const trimmedQuery = query.trim();

  useEffect(() => {
    if (trimmedQuery.length < 2) {
      setResults([]);
      setLoading(false);
      setHasSearched(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setHasSearched(true);

      try {
        const res = await fetch(`/api/search/products?q=${encodeURIComponent(trimmedQuery)}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          setResults([]);
          return;
        }

        const data = (await res.json()) as { results?: SearchResultType[] };
        setResults(data.results || []);
        setOpen(true);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error("Product search failed:", error);
        setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [trimmedQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToSearchPage = () => {
    if (!trimmedQuery) return;

    setOpen(false);
    onNavigate?.();
    router.push(`/shop?search=${encodeURIComponent(trimmedQuery)}`);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    goToSearchPage();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const showDropdown = open && trimmedQuery.length >= 2;

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form
        onSubmit={handleSubmit}
        className={`relative flex w-full items-center border border-zinc-200 bg-white text-black ${
          mobile ? "rounded-full p-1" : "rounded-full"
        }`}
      >
        <input
          type="search"
          className={`min-w-0 flex-1 bg-transparent outline-none ${
            mobile ? "h-10 pl-4 pr-2 text-sm" : "h-12 px-5 pr-12"
          }`}
          placeholder="Search laptops, printers, accessories..."
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (trimmedQuery.length >= 2) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          aria-label="Search products"
        />
        <button
          type="submit"
          className={`flex shrink-0 items-center justify-center rounded-full bg-primary text-white ${
            mobile ? "h-9 w-9" : "absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2"
          }`}
          aria-label="Search"
        >
          {loading ? (
            <Icon icon="mdi:loading" className="animate-spin" width={20} height={20} />
          ) : (
            <Icon icon="ri:search-line" width={20} height={20} />
          )}
        </button>
      </form>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-[100] mt-2 max-h-[70vh] overflow-y-auto rounded-lg border border-gray-200 bg-white text-black shadow-xl">
          {loading && results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">Searching...</div>
          ) : results.length > 0 ? (
            <div className="py-1">
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="flex min-h-16 items-center gap-3 px-3 py-2 hover:bg-gray-50"
                  onClick={() => {
                    setQuery("");
                    setOpen(false);
                    onNavigate?.();
                  }}
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-gray-100">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <Icon icon="mdi:package-variant" className="m-3 text-gray-400" width={24} height={24} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900">{product.name}</p>
                    <p className="truncate text-xs text-zinc-500">
                      {[product.categoryName, product.brandName].filter(Boolean).join(" / ")}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-primary">Rs. {product.price}</p>
                    <p className={`text-xs ${product.available ? "text-green-600" : "text-red-500"}`}>
                      {product.available ? "In stock" : "Out of stock"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : hasSearched ? (
            <div className="px-4 py-3 text-sm text-gray-500">No products found</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
