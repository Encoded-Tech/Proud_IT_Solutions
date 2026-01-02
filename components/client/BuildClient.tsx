'use client';

import React, { useState, useEffect, useMemo, JSX } from "react";
import {
  Cpu,
  HardDrive,
  Zap,
  Box,
  Monitor,
  Fan,
  Keyboard,
  Mouse,
  Headphones,
  Usb,
  Snowflake,
  Layers,
  Video,
} from "lucide-react";
import { BuildSteps, BuildSummaryBar, CategoryHeader, FiltersSection,  PartsGrid, Filters} from "./buildMyPc";
import { fetchPartOptions } from "@/lib/server/actions/admin/BuildMyPc/partsAction";


// ---------------- TYPES ----------------

export interface Part {
  _id: string;
  name: string;
  brand?: string;
  model?: string;
  capacityGB?: number;
  ramType?: string;
  price?: number;
  specs?: string[];
  type: string; // backend field
  imageUrl?: string;
}

interface Category {
  id: string;
  name: string;
  icon: JSX.Element;
  required: boolean;
  description: string;
  helpText: string;
}

export type PartType =
  | "cpu"
  | "gpu"
  | "motherboard"
  | "ram"
  | "storage"
  | "psu"
  | "case"
  | "cooler"
  | "monitor"
  | "keyboard"
  | "mouse"
  | "ups"
  | "fan"
  | "headset"
  | "thermalPaste"
  | "captureCard"
  | "rgbAccessory"
  | "usbPort";




const CATEGORY_META: Record<PartType, Omit<Category, "id">> = {
  cpu: {
    name: "Processor",
    icon: <Cpu className="w-5 h-5" />,
    required: true,
    description: "Main processor",
    helpText: "Controls overall system performance",
  },

  motherboard: {
    name: "Motherboard",
    icon: <Layers className="w-5 h-5" />,
    required: true,
    description: "Main circuit board",
    helpText: "All components connect here",
  },

  ram: {
    name: "Memory",
    icon: <Box className="w-5 h-5" />,
    required: true,
    description: "System memory",
    helpText: "More RAM improves multitasking",
  },

  storage: {
    name: "Storage",
    icon: <HardDrive className="w-5 h-5" />,
    required: true,
    description: "SSD or HDD",
    helpText: "Controls speed & capacity",
  },

  gpu: {
    name: "Graphics Card",
    icon: <Monitor className="w-5 h-5" />,
    required: false,
    description: "Graphics processor",
    helpText: "Needed for gaming & rendering",
  },

  psu: {
    name: "Power Supply",
    icon: <Zap className="w-5 h-5" />,
    required: true,
    description: "System power",
    helpText: "Ensure enough wattage",
  },

  case: {
    name: "PC Case",
    icon: <Box className="w-5 h-5" />,
    required: true,
    description: "Computer enclosure",
    helpText: "Holds all components",
  },

  cooler: {
    name: "CPU Cooler",
    icon: <Snowflake className="w-5 h-5" />,
    required: false,
    description: "Cooling solution",
    helpText: "Keeps CPU temperature low",
  },

  fan: {
    name: "Cooling Fan",
    icon: <Fan className="w-5 h-5" />,
    required: false,
    description: "Airflow component",
    helpText: "Improves case ventilation",
  },

  monitor: {
    name: "Monitor",
    icon: <Monitor className="w-5 h-5" />,
    required: false,
    description: "Display screen",
    helpText: "Visual output device",
  },

  keyboard: {
    name: "Keyboard",
    icon: <Keyboard className="w-5 h-5" />,
    required: false,
    description: "Input device",
    helpText: "For typing & control",
  },

  mouse: {
    name: "Mouse",
    icon: <Mouse className="w-5 h-5" />,
    required: false,
    description: "Pointing device",
    helpText: "Controls cursor movement",
  },

  ups: {
    name: "UPS",
    icon: <Zap className="w-5 h-5" />,
    required: false,
    description: "Backup power",
    helpText: "Protects against power loss",
  },

  headset: {
    name: "Headset",
    icon: <Headphones className="w-5 h-5" />,
    required: false,
    description: "Audio device",
    helpText: "For sound and communication",
  },

  thermalPaste: {
    name: "Thermal Paste",
    icon: <Snowflake className="w-5 h-5" />,
    required: false,
    description: "Thermal compound",
    helpText: "Improves heat transfer",
  },

  captureCard: {
    name: "Capture Card",
    icon: <Video className="w-5 h-5" />,
    required: false,
    description: "Video capture device",
    helpText: "Used for streaming/recording",
  },

  rgbAccessory: {
    name: "RGB Accessory",
    icon: <Box className="w-5 h-5" />,
    required: false,
    description: "Lighting accessories",
    helpText: "Enhances PC aesthetics",
  },

  usbPort: {
    name: "USB Expansion",
    icon: <Usb className="w-5 h-5" />,
    required: false,
    description: "USB hub / card",
    helpText: "Adds extra USB ports",
  },
};


// Props for BuildClient
interface BuildClientProps {
  parts: Part[];
}

// ================================

export default function BuildClient({ parts: initialParts }: BuildClientProps) {
  const [parts, setParts] = useState<Part[]>(initialParts);
  const [selected, setSelected] = useState<Record<string, Part>>({});
  const [activeCategory, setActiveCategory] = useState<string>("cpu");
  
  // Filter state - reset when category changes
  const [filters, setFilters] = useState<Filters>({
    searchTerm: "",
    priceSort: "low-high",
    selectedBrands: []
  });

  // Reset filters when category changes
  useEffect(() => {
    setFilters({
      searchTerm: "",
      priceSort: "low-high",
      selectedBrands: []
    });
  }, [activeCategory]);

  // Fetch backend parts
  useEffect(() => {
    const loadParts = async () => {
      const res = await fetchPartOptions(true);
      if (res.success) {
        setParts(res.data as Part[]);
        console.log("Parts loaded successfully:", res.data);
      }
    };
    loadParts();
  }, []);

  // Group parts by type (backend field) for PartsGrid
  const grouped = useMemo(() => {
    const map: Record<string, Part[]> = {};
    for (const part of parts) {
      if (!map[part.type]) map[part.type] = [];
      map[part.type].push(part);
    }
    return map;
  }, [parts]);

  const isPartType = (value: string): value is PartType => {
  return value in CATEGORY_META;
};


  // Build categories array for ContextInfo + BuildSteps
const categories = Object.keys(grouped)
  .filter(isPartType)
  .map((type) => ({
    id: type,
    ...CATEGORY_META[type],
  }));

//   const total = Object.values(selected).reduce((sum, p) => sum + (p?.price || 0), 0);
//   const isComplete = categories.every((c) => !c.required || selected[c.id]);

  // Get current category parts
  const currentParts = grouped[activeCategory] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Build Progress Bar */}
      <BuildSummaryBar selectedParts={selected} categories={categories} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT SIDEBAR: Build Steps (hidden on mobile, shown on lg+) */}
          <div className="hidden lg:block lg:col-span-3">
            <BuildSteps
              categories={categories}
              selectedParts={selected}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
            />
          </div>

          {/* MAIN CONTENT: Parts Display */}
          <div className="col-span-12 lg:col-span-9">
            {/* Category Header */}
            <CategoryHeader
              category={categories.find((c) => c.id === activeCategory) || null}
            />

            {/* Filters */}
            <FiltersSection 
              parts={currentParts}
              filters={filters}
              onFilterChange={setFilters}
            />

            {/* Parts Grid */}
            <PartsGrid
              parts={currentParts}
              selectedPart={selected[activeCategory]}
              onSelectPart={(p) =>
                setSelected((prev) => ({ ...prev, [activeCategory]: p }))
              }
              filters={filters}

            />

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  const currentIndex = categories.findIndex(c => c.id === activeCategory);
                  if (currentIndex > 0) {
                    setActiveCategory(categories[currentIndex - 1].id);
                  }
                }}
                disabled={categories.findIndex(c => c.id === activeCategory) === 0}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                ← Back
              </button>

              <div className="text-sm text-gray-600">
                {categories.findIndex(c => c.id === activeCategory) + 1} / {categories.length}
              </div>

              <button
                onClick={() => {
                  const currentIndex = categories.findIndex(c => c.id === activeCategory);
                  if (currentIndex < categories.length - 1) {
                    setActiveCategory(categories[currentIndex + 1].id);
                  }
                }}
                disabled={categories.findIndex(c => c.id === activeCategory) === categories.length - 1}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* ORDER SUMMARY SECTION
        <div className="mt-8">
          <OrderSummary
            selectedParts={selected}
            categories={categories}
            totalPrice={total}
            isComplete={isComplete}
          />
        </div> */}
      </div>
    </div>
  );
}