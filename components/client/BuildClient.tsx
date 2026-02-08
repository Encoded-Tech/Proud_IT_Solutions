// 'use client';

// import React, { useState, useEffect, useMemo, JSX } from "react";
// import {
//   Cpu, HardDrive, Zap, Box, Monitor, Fan, Keyboard, Mouse, Headphones,  Snowflake, Layers,
//   MousePointerSquareDashed
// } from "lucide-react";
// import { BuildSteps, BuildSummaryBar, CategoryHeader, FiltersSection, PartsGrid, Filters } from "./buildMyPc";
// import { fetchPartOptions } from "@/lib/server/actions/admin/BuildMyPc/partsAction";

// import toast from "react-hot-toast";
// import { BuildPartInput, submitBuildRequest } from "@/lib/server/actions/public/build-my-pc/buildMyPcactions";
// import { useRouter } from "next/navigation";
// import { useAppSelector } from "@/redux/hooks";
// import { selectIsAuthenticated } from "@/redux/features/auth/userSlice";
// import { PartType } from "@/constants/part";

// // ---------------- TYPES ----------------

// export interface Part {
//   _id: string;
//   name: string;
//   brand?: string;
//   model?: string;
//   capacityGB?: number;
//   ramType?: string;
//   price?: number;
//   specs?: string[];
//   type: string; // backend field
//   imageUrl?: string;
// }

// interface Category {
//   id: string;
//   name: string;
//   icon: JSX.Element;
//   required: boolean;
//   description: string;
//   helpText: string;
// }



// const CATEGORY_META: Record<PartType, Omit<Category, "id">> = {
//   casing: { name: "PC Case", icon: <Box className="w-5 h-5" />, required: true, description: "Computer enclosure", helpText: "Holds all components" },
//   psu: { name: "Power Supply", icon: <Zap className="w-5 h-5" />, required: true, description: "System power", helpText: "Ensure enough wattage" },
//   motherboard: { name: "Motherboard", icon: <Layers className="w-5 h-5" />, required: true, description: "Main circuit board", helpText: "All components connect here" },
//   processor: { name: "Processor", icon: <Cpu className="w-5 h-5" />, required: true, description: "Main processor", helpText: "Controls overall system performance" },
//   ram: { name: "Memory", icon: <Box className="w-5 h-5" />, required: true, description: "System memory", helpText: "More RAM improves multitasking" },
//   storage: { name: "Storage", icon: <HardDrive className="w-5 h-5" />, required: true, description: "SSD or HDD", helpText: "Controls speed & capacity" },
//   cpu_cooler: { name: "CPU Cooler", icon: <Snowflake className="w-5 h-5" />, required: true, description: "Cooling solution", helpText: "Keeps CPU temperature low" },
//   gpu: { name: "Graphics Card", icon: <Monitor className="w-5 h-5" />, required: true, description: "Graphics processor", helpText: "Needed for gaming & rendering" },
//   monitor: { name: "Monitor", icon: <Monitor className="w-5 h-5" />, required: false, description: "Display screen", helpText: "Visual output device" },
//   keyboard: { name: "Keyboard", icon: <Keyboard className="w-5 h-5" />, required: false, description: "Input device", helpText: "For typing & control" },
//   mouse: { name: "Mouse", icon: <Mouse className="w-5 h-5" />, required: false, description: "Pointing device", helpText: "Controls cursor movement" },
//   headset: { name: "Headset", icon: <Headphones className="w-5 h-5" />, required: false, description: "Audio device", helpText: "For sound and communication" },
//   mousepad: { name: "Mousepad", icon: <MousePointerSquareDashed className="w-5 h-5" />, required: false, description: "Smooth pad for mouse", helpText: "Smoothenes mouse experience" },
//   rgb_fan: { name: "Cooling Fan", icon: <Fan className="w-5 h-5" />, required: false, description: "Airflow component", helpText: "Improves case ventilation" },
  
// };

// // ---------------- BUILD CLIENT ----------------

// interface BuildClientProps {
//   parts: Part[];
// }

// export default function BuildClient({ parts: initialParts }: BuildClientProps) {
//   const [parts, setParts] = useState<Part[]>(initialParts);
//   const [selected, setSelected] = useState<Record<string, Part>>({});
//   const [activeCategory, setActiveCategory] = useState<string>("cpu");
//   const [filters, setFilters] = useState<Filters>({ searchTerm: "", priceSort: "low-high", selectedBrands: [] });
//   const [loadingSubmit, setLoadingSubmit] = useState(false);

//     const router = useRouter();

//   // Reset filters when category changes
//   useEffect(() => {
//     setFilters({ searchTerm: "", priceSort: "low-high", selectedBrands: [] });
//   }, [activeCategory]);

//   // Fetch backend parts
//   useEffect(() => {
//     const loadParts = async () => {
//       const res = await fetchPartOptions(true);
//       if (res.success) setParts(res.data as Part[]);
//     };
//     loadParts();
//   }, []);

//   // Group parts by type
//   const grouped = useMemo(() => {
//     const map: Record<string, Part[]> = {};
//     for (const part of parts) { if (!map[part.type]) map[part.type] = []; map[part.type].push(part); }
//     return map;
//   }, [parts]);

//   const isPartType = (value: string): value is PartType => value in CATEGORY_META;

//   const categories = Object.keys(grouped).filter(isPartType).map((type) => ({ id: type, ...CATEGORY_META[type] }));

//   const totalPrice = Object.values(selected).reduce((sum, p) => sum + (p.price || 0), 0);
//   const isComplete = categories.filter(c => c.required).every(c => selected[c.id]);

//   const currentParts = grouped[activeCategory] || [];
//   const isLoggedIn = useAppSelector(selectIsAuthenticated);

//   const handleSubmit = async () => {
//     if (!isLoggedIn) {
//       toast.error("Please login first");
//       router.push("/login?redirect=/build-my-pc");
//       return;
//     }
//     if (!isComplete) return toast.error("Please select all required components");
//     setLoadingSubmit(true);

//     const partsInput: BuildPartInput[] = Object.values(selected).map(p => ({
//       partId: p._id,
//       type: p.type,
//       name: p.name,
//       imageUrl: p.imageUrl,
//       price: p.price || 0,
//       quantity: 1
//     }));

//         try {
//       const res = await submitBuildRequest({
//         parts: partsInput, 
//         subtotal: totalPrice, 
//         grandTotal: totalPrice
//       });

//       if (res.success) {
//         toast.success(res.message || "Build submitted successfully");
//         // Redirect after successful submission
//         router.push("/account/build-requests");
//       } else {
//         toast.error(res.message || "Failed to submit build");
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Unexpected error during submission");
//     } finally {
//       setLoadingSubmit(false);
//     }
    
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Summary Bar */}
//       <BuildSummaryBar selectedParts={selected} categories={categories} totalPrice={totalPrice} isComplete={isComplete} onSubmit={handleSubmit} loading={loadingSubmit} />

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
//         <div className="grid grid-cols-12 gap-6">
//           {/* Sidebar */}
//           <div className="hidden lg:block lg:col-span-3">
//             <BuildSteps categories={categories} selectedParts={selected} activeCategory={activeCategory} onSelectCategory={setActiveCategory} />
//           </div>

//           {/* Main */}
//           <div className="col-span-12 lg:col-span-9">
//             <CategoryHeader category={categories.find(c => c.id === activeCategory) || null} />
//             <FiltersSection parts={currentParts} filters={filters} onFilterChange={setFilters} />
//             <PartsGrid parts={currentParts} selectedPart={selected[activeCategory]} onSelectPart={p => setSelected(prev => ({ ...prev, [activeCategory]: p }))} filters={filters} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


'use client';

import React, { useState, useEffect, useMemo, JSX } from "react";
import {
  Cpu, HardDrive, Zap, Box, Monitor, Fan, Keyboard, Mouse, Headphones, Snowflake, Layers, MousePointerSquareDashed
} from "lucide-react";
import {
  BuildSteps,
  BuildSummaryBar,
  CategoryHeader,
  FiltersSection,
  PartsGrid,
  Filters
} from "./buildMyPc";

import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { selectIsAuthenticated } from "@/redux/features/auth/userSlice";
import { PartType } from "@/constants/part";
import { fetchPartOptions } from "@/lib/server/actions/admin/BuildMyPc/partsAction";
import { BuildPartInput, submitBuildRequest } from "@/lib/server/actions/public/build-my-pc/buildMyPcactions";
import { getCompatiblePartsForMotherboard } from "@/lib/server/fetchers/fetchBuildRequest";


// ---------------- TYPES ----------------

export interface Part {
  _id: string;
  name: string;
  brand?: string;
  model?: string;
  capacityGB?: number;
  ramType?: string;
  socket?: string;
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

interface BuildClientProps {
  parts: Part[];
}

// ---------------- CATEGORY META ----------------

const CATEGORY_META: Record<PartType, Omit<Category, "id">> = {
  casing: { name: "PC Case", icon: <Box className="w-5 h-5" />, required: true, description: "Computer enclosure", helpText: "Holds all components" },
  psu: { name: "Power Supply", icon: <Zap className="w-5 h-5" />, required: true, description: "System power", helpText: "Ensure enough wattage" },
  motherboard: { name: "Motherboard", icon: <Layers className="w-5 h-5" />, required: true, description: "Main circuit board", helpText: "All components connect here" },
  processor: { name: "Processor", icon: <Cpu className="w-5 h-5" />, required: true, description: "Main processor", helpText: "Controls overall system performance" },
  ram: { name: "Memory", icon: <Box className="w-5 h-5" />, required: true, description: "System memory", helpText: "More RAM improves multitasking" },
  storage: { name: "Storage", icon: <HardDrive className="w-5 h-5" />, required: true, description: "SSD or HDD", helpText: "Controls speed & capacity" },
  cpu_cooler: { name: "CPU Cooler", icon: <Snowflake className="w-5 h-5" />, required: true, description: "Cooling solution", helpText: "Keeps CPU temperature low" },
  gpu: { name: "Graphics Card", icon: <Monitor className="w-5 h-5" />, required: true, description: "Graphics processor", helpText: "Needed for gaming & rendering" },
  monitor: { name: "Monitor", icon: <Monitor className="w-5 h-5" />, required: false, description: "Display screen", helpText: "Visual output device" },
  keyboard: { name: "Keyboard", icon: <Keyboard className="w-5 h-5" />, required: false, description: "Input device", helpText: "For typing & control" },
  mouse: { name: "Mouse", icon: <Mouse className="w-5 h-5" />, required: false, description: "Pointing device", helpText: "Controls cursor movement" },
  headset: { name: "Headset", icon: <Headphones className="w-5 h-5" />, required: false, description: "Audio device", helpText: "For sound and communication" },
  mousepad: { name: "Mousepad", icon: <MousePointerSquareDashed className="w-5 h-5" />, required: false, description: "Smooth pad for mouse", helpText: "Smoothenes mouse experience" },
  rgb_fan: { name: "Cooling Fan", icon: <Fan className="w-5 h-5" />, required: false, description: "Airflow component", helpText: "Improves case ventilation" },
};

// ---------------- BUILD CLIENT ----------------

export default function BuildClient({ parts: initialParts }: BuildClientProps) {
  const [parts, setParts] = useState<Part[]>(initialParts);
  const [selected, setSelected] = useState<Record<string, Part>>({});
  const [activeCategory, setActiveCategory] = useState<string>("processor");
  const [filters, setFilters] = useState<Filters>({ searchTerm: "", priceSort: "low-high", selectedBrands: [] });
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const router = useRouter();
  const isLoggedIn = useAppSelector(selectIsAuthenticated);

  // Reset filters when category changes
  useEffect(() => {
    setFilters({ searchTerm: "", priceSort: "low-high", selectedBrands: [] });
  }, [activeCategory]);

  // Fetch backend parts initially
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
    for (const part of parts) {
      if (!map[part.type]) map[part.type] = [];
      map[part.type].push(part);
    }
    return map;
  }, [parts]);

  const isPartType = (value: string): value is PartType => value in CATEGORY_META;
 const BUILD_ORDER: PartType[] = [
  "casing",
  "psu",
  "motherboard",
  "processor",
  "ram",
  "storage",
  "cpu_cooler",
  "gpu",
  "monitor",
  "keyboard",
  "mouse",
  "headset",
  "mousepad",
  "rgb_fan"
];

  const categories = BUILD_ORDER.filter(isPartType).map((type) => ({ id: type, ...CATEGORY_META[type] }));
  const totalPrice = Object.values(selected).reduce((sum, p) => sum + (p.price || 0), 0);
  const isComplete = categories.filter(c => c.required).every(c => selected[c.id]);

  const currentParts = grouped[activeCategory] || [];

  // ---------------- PART SELECTION ----------------
  const handleSelectPart = async (part: Part) => {
    // Update selected part
setSelected(prev => {
  const updated = { ...prev };

  if (part.type === "motherboard") {
    delete updated.processor;
    delete updated.ram;
  }

  updated[activeCategory] = part;
  return updated;
});


    // If motherboard selected, fetch compatible CPUs & RAM
    if (part.type === "motherboard") {
      try {
        const res = await getCompatiblePartsForMotherboard(part._id);
        if (res.success) {
          setParts(prevParts => {
            // Keep all non-processor/ram parts, replace CPU & RAM with filtered
            const nonCpuRam = prevParts.filter(p => !["processor", "ram"].includes(p.type));
            const compatibleProcessors = res.data.processors.map(p => ({
              ...p,
              type: "processor"
            }));
            const compatibleRams = res.data.rams.map(p => ({
              ...p,
              type: "ram"
            }));
            return [...nonCpuRam, ...compatibleProcessors, ...compatibleRams];
          });
        } else {
          toast.error(res.message || "Failed to fetch compatible parts");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error fetching compatible parts");
      }
    }
  };

  // ---------------- SUBMIT BUILD ----------------
  const handleSubmit = async () => {
    if (!isLoggedIn) {
      toast.error("Please login first");
      router.push("/login?redirect=/build-my-pc");
      return;
    }
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
      <BuildSummaryBar
        selectedParts={selected}
        categories={categories}
        totalPrice={totalPrice}
        isComplete={isComplete}
        onSubmit={handleSubmit}
        loading={loadingSubmit}
      />

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
            <PartsGrid
              parts={currentParts}
              selectedPart={selected[activeCategory]}
              onSelectPart={handleSelectPart}
              filters={filters}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
