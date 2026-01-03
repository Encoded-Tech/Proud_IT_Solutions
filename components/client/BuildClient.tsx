'use client';

import React, { useState, useEffect, useMemo, JSX } from "react";
import {
  Cpu, HardDrive, Zap, Box, Monitor, Fan, Keyboard, Mouse, Headphones, Usb, Snowflake, Layers, Video
} from "lucide-react";
import { BuildSteps, BuildSummaryBar, CategoryHeader, FiltersSection, PartsGrid, Filters } from "./buildMyPc";
import { fetchPartOptions } from "@/lib/server/actions/admin/BuildMyPc/partsAction";

import toast from "react-hot-toast";
import { BuildPartInput, submitBuildRequest } from "@/lib/server/actions/public/build-my-pc/buildMyPcactions";
import { useRouter } from "next/navigation";

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
  | "cpu" | "gpu" | "motherboard" | "ram" | "storage"
  | "psu" | "case" | "cooler" | "monitor" | "keyboard"
  | "mouse" | "ups" | "fan" | "headset" | "thermalPaste"
  | "captureCard" | "rgbAccessory" | "usbPort";

const CATEGORY_META: Record<PartType, Omit<Category, "id">> = {
  cpu: { name: "Processor", icon: <Cpu className="w-5 h-5" />, required: true, description: "Main processor", helpText: "Controls overall system performance" },
  motherboard: { name: "Motherboard", icon: <Layers className="w-5 h-5" />, required: true, description: "Main circuit board", helpText: "All components connect here" },
  ram: { name: "Memory", icon: <Box className="w-5 h-5" />, required: true, description: "System memory", helpText: "More RAM improves multitasking" },
  storage: { name: "Storage", icon: <HardDrive className="w-5 h-5" />, required: true, description: "SSD or HDD", helpText: "Controls speed & capacity" },
  gpu: { name: "Graphics Card", icon: <Monitor className="w-5 h-5" />, required: false, description: "Graphics processor", helpText: "Needed for gaming & rendering" },
  psu: { name: "Power Supply", icon: <Zap className="w-5 h-5" />, required: true, description: "System power", helpText: "Ensure enough wattage" },
  case: { name: "PC Case", icon: <Box className="w-5 h-5" />, required: true, description: "Computer enclosure", helpText: "Holds all components" },
  cooler: { name: "CPU Cooler", icon: <Snowflake className="w-5 h-5" />, required: false, description: "Cooling solution", helpText: "Keeps CPU temperature low" },
  fan: { name: "Cooling Fan", icon: <Fan className="w-5 h-5" />, required: false, description: "Airflow component", helpText: "Improves case ventilation" },
  monitor: { name: "Monitor", icon: <Monitor className="w-5 h-5" />, required: false, description: "Display screen", helpText: "Visual output device" },
  keyboard: { name: "Keyboard", icon: <Keyboard className="w-5 h-5" />, required: false, description: "Input device", helpText: "For typing & control" },
  mouse: { name: "Mouse", icon: <Mouse className="w-5 h-5" />, required: false, description: "Pointing device", helpText: "Controls cursor movement" },
  ups: { name: "UPS", icon: <Zap className="w-5 h-5" />, required: false, description: "Backup power", helpText: "Protects against power loss" },
  headset: { name: "Headset", icon: <Headphones className="w-5 h-5" />, required: false, description: "Audio device", helpText: "For sound and communication" },
  thermalPaste: { name: "Thermal Paste", icon: <Snowflake className="w-5 h-5" />, required: false, description: "Thermal compound", helpText: "Improves heat transfer" },
  captureCard: { name: "Capture Card", icon: <Video className="w-5 h-5" />, required: false, description: "Video capture device", helpText: "Used for streaming/recording" },
  rgbAccessory: { name: "RGB Accessory", icon: <Box className="w-5 h-5" />, required: false, description: "Lighting accessories", helpText: "Enhances PC aesthetics" },
  usbPort: { name: "USB Expansion", icon: <Usb className="w-5 h-5" />, required: false, description: "USB hub / card", helpText: "Adds extra USB ports" },
};

// ---------------- BUILD CLIENT ----------------

interface BuildClientProps {
  parts: Part[];
}

export default function BuildClient({ parts: initialParts }: BuildClientProps) {
  const [parts, setParts] = useState<Part[]>(initialParts);
  const [selected, setSelected] = useState<Record<string, Part>>({});
  const [activeCategory, setActiveCategory] = useState<string>("cpu");
  const [filters, setFilters] = useState<Filters>({ searchTerm: "", priceSort: "low-high", selectedBrands: [] });
  const [loadingSubmit, setLoadingSubmit] = useState(false);

    const router = useRouter();

  // Reset filters when category changes
  useEffect(() => {
    setFilters({ searchTerm: "", priceSort: "low-high", selectedBrands: [] });
  }, [activeCategory]);

  // Fetch backend parts
  useEffect(() => {
    const loadParts = async () => {
      const res = await fetchPartOptions(true);
      if (res.success) setParts(res.data as Part[]);
    };
    loadParts();
  }, []);

  // Group parts by type
  const grouped = useMemo(() => {
    const map: Record<string, Part[]> = {};
    for (const part of parts) { if (!map[part.type]) map[part.type] = []; map[part.type].push(part); }
    return map;
  }, [parts]);

  const isPartType = (value: string): value is PartType => value in CATEGORY_META;

  const categories = Object.keys(grouped).filter(isPartType).map((type) => ({ id: type, ...CATEGORY_META[type] }));

  const totalPrice = Object.values(selected).reduce((sum, p) => sum + (p.price || 0), 0);
  const isComplete = categories.filter(c => c.required).every(c => selected[c.id]);

  const currentParts = grouped[activeCategory] || [];

  const handleSubmit = async () => {
    if (!isComplete) return toast.error("Please select all required components");
    setLoadingSubmit(true);

    const partsInput: BuildPartInput[] = Object.values(selected).map(p => ({
      partId: p._id,
      type: p.type,
      name: p.name,
      imageUrl: p.imageUrl,
      price: p.price || 0,
      quantity: 1
    }));

        try {
      const res = await submitBuildRequest({
        parts: partsInput, 
        subtotal: totalPrice, 
        grandTotal: totalPrice
      });

      if (res.success) {
        toast.success(res.message || "Build submitted successfully");
        // Redirect after successful submission
        router.push("/account/build-requests");
      } else {
        toast.error(res.message || "Failed to submit build");
      }
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error during submission");
    } finally {
      setLoadingSubmit(false);
    }
    
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Summary Bar */}
      <BuildSummaryBar selectedParts={selected} categories={categories} totalPrice={totalPrice} isComplete={isComplete} onSubmit={handleSubmit} loading={loadingSubmit} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <BuildSteps categories={categories} selectedParts={selected} activeCategory={activeCategory} onSelectCategory={setActiveCategory} />
          </div>

          {/* Main */}
          <div className="col-span-12 lg:col-span-9">
            <CategoryHeader category={categories.find(c => c.id === activeCategory) || null} />
            <FiltersSection parts={currentParts} filters={filters} onFilterChange={setFilters} />
            <PartsGrid parts={currentParts} selectedPart={selected[activeCategory]} onSelectPart={p => setSelected(prev => ({ ...prev, [activeCategory]: p }))} filters={filters} />
          </div>
        </div>
      </div>
    </div>
  );
}
