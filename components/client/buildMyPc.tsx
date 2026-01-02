'use client';

import React, { useEffect, useMemo, useRef, useState }  from "react";
import Image from "next/image";
import { Check, Info, Box, ShoppingCart } from "lucide-react";
import { Part } from "./BuildClient";

/* =========================================================
   TYPES
========================================================= */

export interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  required: boolean;
  description: string;
  helpText: string;
}

export type SelectedParts = Record<string, Part>;

export interface Filters {
  searchTerm: string;
  priceSort: "low-high" | "high-low";
  selectedBrands: string[];
}

/* =========================================================
   BUILD SUMMARY BAR
========================================================= */



/* =========================================================
   PARTS GRID WITH FILTERS & PAGINATION
========================================================= */


interface PartsGridProps {
  parts: Part[];
  selectedPart: Part | null;
  onSelectPart: (part: Part) => void;
  filters: Filters;
  itemsPerPage?: number; // optional, default = 8
}

export const PartsGrid: React.FC<PartsGridProps> = ({
  parts,
  selectedPart,
  onSelectPart,
  filters,
  itemsPerPage = 8,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleParts, setVisibleParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(false);

  // Apply filters and sort (keep your logic)
  const filteredParts = useMemo(() => {
    let result = [...parts];

    if (filters.searchTerm) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    if (filters.selectedBrands.length > 0) {
      result = result.filter((p) => p.brand && filters.selectedBrands.includes(p.brand));
    }

    result.sort((a, b) =>
      filters.priceSort === "low-high"
        ? (a.price || 0) - (b.price || 0)
        : (b.price || 0) - (a.price || 0)
    );

    return result;
  }, [parts, filters]);

  // Reset visible parts when filters change
  useEffect(() => {
    setVisibleParts(filteredParts.slice(0, itemsPerPage));
  }, [filteredParts, itemsPerPage]);

  // Load more parts on scroll
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container || loading) return;

    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 50) {
      loadMore();
    }
  };

  const loadMore = () => {
    if (visibleParts.length >= filteredParts.length) return;

    setLoading(true);
    setTimeout(() => { // simulate loading
      const nextParts = filteredParts.slice(
        visibleParts.length,
        visibleParts.length + itemsPerPage
      );
      setVisibleParts((prev) => [...prev, ...nextParts]);
      setLoading(false);
    }, 300);
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="space-y-6 overflow-auto max-h-[70vh] pr-2 scrollbar-hide"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {visibleParts.map((part) => (
          <PartCard
            key={part._id}
            part={part}
            isSelected={selectedPart?._id === part._id}
            onSelect={() => onSelectPart(part)}
          />
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          LOADING...
        </div>
      )}
    </div>
  );
};



export const BuildSummaryBar: React.FC<{
  selectedParts: SelectedParts;
  categories: Category[];

}> = ({ selectedParts, categories }) => {
    
  // Compute total price
  const totalPrice = categories.reduce((acc, cat) => {
    const part = selectedParts[cat.id];
    return acc + (part?.price || 0);
  }, 0);

  // Check if all required components are selected
  const isComplete = categories
    .filter(c => c.required)
    .every(c => selectedParts[c.id]);

  return (
    <div className="mb-6 bg-white border-b border-gray-200 shadow-sm ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 sm:mb-4">
          Build Progress & Summary
        </h2>

        {/* Parts Progress */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-9 gap-2 sm:gap-3 mb-4">
          {categories.map((cat) => {
            const part = selectedParts[cat.id];
            const isSelected = !!part;

            return (
              <div
                key={cat.id}
                className={`relative rounded-lg border-2 transition-all duration-300 ${
                  isSelected
                    ? 'border-red-500 bg-red-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="p-2 sm:p-3">
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <div
                      className={`p-1 sm:p-1.5 rounded transition-colors ${
                        isSelected ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {cat.icon}
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-red-500 flex items-center justify-center shadow-sm">
                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 mb-0.5 truncate">{cat.name}</p>
                    {isSelected ? (
                      <p className="text-xs text-gray-600 truncate">{part!.brand}</p>
                    ) : (
                      <p className="text-xs text-gray-400">Not selected</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total Price & Submit Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="text-lg font-bold text-gray-900 mb-2 sm:mb-0">
            Total: Rs. {totalPrice.toLocaleString()}
          </div>
          <button
            
            disabled={!isComplete}
            className={`px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
              isComplete
                ? 'bg-red-500 hover:bg-red-600 shadow-md'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Submit Build Request
          </button>
        </div>

        {!isComplete && (
          <div className="mt-2 text-xs text-red-600">
            Please select all required components to enable submission
          </div>
        )}
      </div>
    </div>
  );
};


/* =========================================================
   BUILD STEPS
========================================================= */

export const BuildSteps: React.FC<{
  categories: Category[];
  selectedParts: SelectedParts;
  activeCategory: string;
  onSelectCategory: (id: string) => void;
}> = ({ categories, selectedParts, activeCategory, onSelectCategory }) => {
  return (
    <div className="sticky top-5 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Build Steps</h3>
      </div>
      <div className="p-3 space-y-1">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          const isSelected = !!selectedParts[cat.id];

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 text-left ${
                isActive 
                  ? 'bg-red-500 text-white shadow-md transform scale-[1.02]' 
                  : 'hover:bg-gray-50 text-gray-700 hover:shadow-sm'
              }`}
            >
              <div className={`flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-gray-500'}`}>
                {cat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="font-semibold text-sm">{cat.name}</p>
                  {cat.required && !isActive && (
                    <span className="text-xs text-red-500 font-bold">*</span>
                  )}
                </div>
                {selectedParts[cat.id] && (
                  <p className={`text-xs truncate mt-0.5 ${isActive ? 'text-red-100' : 'text-gray-600'}`}>
                    {selectedParts[cat.id]!.brand} {selectedParts[cat.id]!.name}
                  </p>
                )}
              </div>
              {isSelected && (
                <Check className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-red-500'}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* =========================================================
   CATEGORY HEADER WITH CONTEXT
========================================================= */

export const CategoryHeader: React.FC<{ category: Category | null }> = ({ category }) => {
  if (!category) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white mb-6">
      {/* subtle accent strip */}
      <div className="absolute inset-x-0 top-0 h-1 bg-primary" />


<div className="sticky top-10 bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-start space-x-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          {category.icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{category.name}</h3>
          <p className="text-xs text-gray-500">{category.description}</p>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-900">{category.helpText}</p>
        </div>
      </div>
    </div>


        </div>
    
  );
};



/* =========================================================
   FILTERS SECTION
========================================================= */

export const FiltersSection: React.FC<{
  parts: Part[];
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}> = ({ parts, filters, onFilterChange }) => {
  const [showBrandFilter, setShowBrandFilter] = React.useState(false);

  // Get unique brands from parts
  const brands = React.useMemo(() => {
    const brandSet = new Set(parts.map(p => p.brand).filter(Boolean));
    return Array.from(brandSet).sort();
  }, [parts]);

  const toggleBrand = (brand: string) => {
    const newSelectedBrands = filters.selectedBrands.includes(brand)
      ? filters.selectedBrands.filter(b => b !== brand)
      : [...filters.selectedBrands, brand];
    
    onFilterChange({
      ...filters,
      selectedBrands: newSelectedBrands
    });
  };

  const clearAllFilters = () => {
    onFilterChange({
      searchTerm: "",
      priceSort: "low-high",
      selectedBrands: []
    });
  };

  const hasActiveFilters = filters.searchTerm || filters.selectedBrands.length > 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search parts..."
            value={filters.searchTerm}
            onChange={(e) => onFilterChange({ ...filters, searchTerm: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Price Sort */}
        <div className="relative">
          <select
            value={filters.priceSort}
            onChange={(e) => onFilterChange({ ...filters, priceSort: e.target.value as "low-high" | "high-low" })}
            className="px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent pr-8"
          >
            <option value="low-high">Price: Low-Hi</option>
            <option value="high-low">Price: High-Low</option>
          </select>
        </div>

        {/* Brand Filter Button */}
        {brands.length > 0 && (
          <button
            onClick={() => setShowBrandFilter(!showBrandFilter)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <span className="text-sm font-medium">
              Filter by Brand {filters.selectedBrands.length > 0 && `(${filters.selectedBrands.length})`}
            </span>
            <span className="text-xs">{showBrandFilter ? '▲' : '▼'}</span>
          </button>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Brand Filter Dropdown */}
      {showBrandFilter && brands.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => toggleBrand(brand as string)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                  filters.selectedBrands.includes(brand as string)
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   PART CARD & GRID
========================================================= */

export const PartCard: React.FC<{
  part: Part;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ part, isSelected, onSelect }) => {
  return (
    <div className={`bg-white rounded-lg border transition-all duration-300 hover:shadow-lg group ${
      isSelected ? 'border-red-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
    }`}>
      {/* Image Section */}
      <div className="relative p-4 bg-gray-50">
        <div className="aspect-square rounded-lg overflow-hidden bg-white">
          {part.imageUrl ? (
            <Image
              width={300}
              height={300}
              src={part.imageUrl}
              alt={part.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Box className="w-12 h-12 text-gray-300" />
            </div>
          )}
        </div>
        {isSelected && (
          <div className="absolute top-6 right-6 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
            Selected
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Brand */}
        <div className="text-xs text-gray-500 uppercase font-semibold mb-1">
          {part.brand}
        </div>

        {/* Product Name */}
        <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 min-h-[2.5rem]">
          {part.name}
        </h4>

        {/* Socket/Spec Badge */}
        {part?.specs && part.specs.length > 0 && (
          <div className="text-xs text-gray-600 mb-3">
            {part.specs[0]}
          </div>
        )}

        {/* Price Section */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <div className="text-lg font-bold text-gray-900">
              Rs. {part?.price?.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">(including tax)</div>
          </div>
          <button
            onClick={onSelect}
            className={`p-2 rounded-lg border transition-all duration-200 ${
              isSelected 
                ? 'border-red-500 bg-red-50 text-red-600' 
                : 'border-gray-300 hover:border-gray-400 text-gray-600'
            }`}
          >
            {isSelected ? <Check className="w-5 h-5" /> : <span className="text-xl">+</span>}
          </button>
        </div>
      </div>
    </div>
  );
};



/* =========================================================
   ORDER SUMMARY
========================================================= */

export const OrderSummary: React.FC<{
  selectedParts: SelectedParts;
  categories: Category[];
  totalPrice: number;
  isComplete: boolean;
}> = ({ selectedParts, categories, totalPrice, isComplete }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
      <div className="bg-red-600 p-6 text-white">
        <h2 className="text-2xl font-bold mb-1">Build Summary</h2>
        <p className="text-red-100 text-sm">Review your selected components</p>
      </div>

      <div className="p-5 sm:p-6">
        <div className="space-y-3 mb-6">
          {categories.map((cat) => {
            const part = selectedParts[cat.id];
            return (
              <div key={cat.id} className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                part ? 'border-red-100 bg-red-50/50' : 'border-gray-100 bg-gray-50'
              }`}>
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg ${part ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-400'}`}>
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
                    {part ? (
                      <p className="text-xs text-gray-600 truncate">{part.brand} {part.name}</p>
                    ) : (
                      <p className="text-xs text-gray-400">Not selected</p>
                    )}
                  </div>
                </div>
                {part && <p className="text-base sm:text-lg font-bold text-gray-900 ml-4">₹{part?.price?.toLocaleString()}</p>}
              </div>
            );
          })}
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 mb-6 border border-gray-200">
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-gray-600 font-medium">Subtotal</span>
            <span className="font-semibold text-gray-900">₹{totalPrice.toLocaleString()}</span>
          </div>
          <div className="h-px bg-gray-300 mb-3" />
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-gray-900">Total</span>
            <span className="text-3xl font-bold text-red-600">₹{totalPrice.toLocaleString()}</span>
          </div>
        </div>

        <button
          disabled={!isComplete}
          className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-200 flex items-center justify-center space-x-3 ${
            isComplete
              ? 'bg-red-500 text-white hover:bg-red-600 hover:shadow-xl shadow-lg hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Submit Build Request</span>
        </button>

        {!isComplete && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2">
            <Info className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-800">
              Please select all required components to continue
            </p>
          </div>
        )}
      </div>
    </div>
  );
};