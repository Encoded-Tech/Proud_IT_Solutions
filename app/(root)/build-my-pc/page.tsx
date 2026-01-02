
// 'use client';

import BuildClient from "@/components/client/BuildClient";
import { fetchPartOptions } from "@/lib/server/actions/admin/BuildMyPc/partsAction";

// import React, { useState, useMemo } from 'react';
// import { 
//   Cpu, HardDrive, Zap, Box, Fan, MemoryStick, 
//   Monitor, Check, ShoppingCart, Info, 
// } from 'lucide-react';
// import Image from 'next/image';

// // ============================================================================
// // TYPES
// // ============================================================================

// interface Part {
//   id: string;
//   name: string;
//   brand: string;
//   specs: string[];
//   price: number;
//   image?: string;
// }

// interface ComponentCategory {
//   id: string;
//   name: string;
//   icon: React.ReactNode;
//   required: boolean;
//   description: string;
//   helpText: string;
// }

// interface SelectedParts {
//   [key: string]: Part | null;
// }

// // ============================================================================
// // MOCK DATA
// // ============================================================================

// const categories: ComponentCategory[] = [
//   { 
//     id: 'cpu', 
//     name: 'Processor', 
//     icon: <Cpu className="w-5 h-5" />, 
//     required: true,
//     description: 'Central Processing Unit',
//     helpText: 'The brain of your computer. Choose based on your performance needs and budget.'
//   },
//   { 
//     id: 'motherboard', 
//     name: 'Motherboard', 
//     icon: <Monitor className="w-5 h-5" />, 
//     required: true,
//     description: 'Main Circuit Board',
//     helpText: 'Connects all components. Ensure compatibility with your chosen CPU socket type.'
//   },
//   { 
//     id: 'ram', 
//     name: 'Memory', 
//     icon: <MemoryStick className="w-5 h-5" />, 
//     required: true,
//     description: 'System RAM',
//     helpText: 'More RAM allows better multitasking. 16GB is recommended for most users, 32GB for power users.'
//   },
//   { 
//     id: 'storage', 
//     name: 'Storage', 
//     icon: <HardDrive className="w-5 h-5" />, 
//     required: true,
//     description: 'SSD/HDD',
//     helpText: 'NVMe SSDs offer the fastest boot and load times. Consider capacity based on your usage.'
//   },
//   { 
//     id: 'gpu', 
//     name: 'Graphics Card', 
//     icon: <Monitor className="w-5 h-5" />, 
//     required: false,
//     description: 'GPU for Gaming',
//     helpText: 'Essential for gaming and creative work. Optional if your CPU has integrated graphics.'
//   },
//   { 
//     id: 'psu', 
//     name: 'Power Supply', 
//     icon: <Zap className="w-5 h-5" />, 
//     required: true,
//     description: 'Power Unit',
//     helpText: 'Choose wattage based on total system power draw. 80+ Gold or higher recommended.'
//   },
//   { 
//     id: 'case', 
//     name: 'Cabinet', 
//     icon: <Box className="w-5 h-5" />, 
//     required: true,
//     description: 'PC Case',
//     helpText: 'Houses all components. Ensure it supports your motherboard size and has good airflow.'
//   },
//   { 
//     id: 'cooler', 
//     name: 'CPU Cooler', 
//     icon: <Fan className="w-5 h-5" />, 
//     required: false,
//     description: 'Cooling Solution',
//     helpText: 'Stock coolers work for basic use. Aftermarket coolers offer better cooling and lower noise.'
//   },
// ];

// const mockParts: { [key: string]: Part[] } = {
//   cpu: [
//     { id: 'cpu1', name: 'Core i9-14900K', brand: 'Intel', specs: ['24 Cores, 32 Threads', '5.8GHz Max Turbo', 'LGA1700 Socket'], price: 589.99, image: 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400&h=300&fit=crop' },
//     { id: 'cpu2', name: 'Ryzen 9 7950X', brand: 'AMD', specs: ['16 Cores, 32 Threads', '5.7GHz Max Boost', 'AM5 Socket'], price: 549.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=300&fit=crop' },
//     { id: 'cpu3', name: 'Core i7-14700K', brand: 'Intel', specs: ['20 Cores, 28 Threads', '5.6GHz Max Turbo', 'LGA1700 Socket'], price: 409.99, image: 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400&h=300&fit=crop' },
//     { id: 'cpu4', name: 'Ryzen 7 7800X3D', brand: 'AMD', specs: ['8 Cores, 16 Threads', '5.0GHz Boost', '96MB L3 Cache'], price: 449.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=300&fit=crop' },
//   ],
//   motherboard: [
//     { id: 'mb1', name: 'ROG STRIX Z790-E GAMING', brand: 'ASUS', specs: ['ATX Form Factor', 'DDR5 Support', 'WiFi 6E, PCIe 5.0'], price: 389.99, image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&h=300&fit=crop' },
//     { id: 'mb2', name: 'X670E AORUS MASTER', brand: 'Gigabyte', specs: ['ATX Form Factor', 'DDR5 Support', 'PCIe 5.0, USB4'], price: 429.99, image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&h=300&fit=crop' },
//     { id: 'mb3', name: 'MAG B760 TOMAHAWK', brand: 'MSI', specs: ['ATX Form Factor', 'DDR5 Support', 'WiFi 6, 2.5G LAN'], price: 199.99, image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&h=300&fit=crop' },
//   ],
//   ram: [
//     { id: 'ram1', name: 'Vengeance RGB 32GB', brand: 'Corsair', specs: ['DDR5-6000 MHz', 'CL30 Latency', '2x16GB Kit'], price: 149.99, image: 'https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?w=400&h=300&fit=crop' },
//     { id: 'ram2', name: 'Trident Z5 RGB 32GB', brand: 'G.Skill', specs: ['DDR5-6400 MHz', 'CL32 Latency', '2x16GB Kit'], price: 169.99, image: 'https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?w=400&h=300&fit=crop' },
//     { id: 'ram3', name: 'Fury Beast 32GB', brand: 'Kingston', specs: ['DDR5-5600 MHz', 'CL36 Latency', '2x16GB Kit'], price: 119.99, image: 'https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?w=400&h=300&fit=crop' },
//   ],
//   storage: [
//     { id: 'ssd1', name: '990 PRO 2TB', brand: 'Samsung', specs: ['NVMe Gen4 M.2', '7,450 MB/s Read', '6,900 MB/s Write'], price: 189.99, image: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=400&h=300&fit=crop' },
//     { id: 'ssd2', name: 'WD Black SN850X 2TB', brand: 'Western Digital', specs: ['NVMe Gen4 M.2', '7,300 MB/s Read', '6,600 MB/s Write'], price: 179.99, image: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=400&h=300&fit=crop' },
//     { id: 'ssd3', name: 'P5 Plus 1TB', brand: 'Crucial', specs: ['NVMe Gen4 M.2', '6,600 MB/s Read', '5,000 MB/s Write'], price: 89.99, image: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=400&h=300&fit=crop' },
//   ],
//   gpu: [
//     { id: 'gpu1', name: 'GeForce RTX 4090', brand: 'NVIDIA', specs: ['24GB GDDR6X', '16,384 CUDA Cores', '450W TDP'], price: 1599.99, image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=300&fit=crop' },
//     { id: 'gpu2', name: 'RTX 4080 SUPER', brand: 'NVIDIA', specs: ['16GB GDDR6X', '10,240 CUDA Cores', '320W TDP'], price: 999.99, image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=300&fit=crop' },
//     { id: 'gpu3', name: 'RX 7900 XTX', brand: 'AMD', specs: ['24GB GDDR6', '6,144 Stream Processors', '355W TDP'], price: 899.99, image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=300&fit=crop' },
//   ],
//   psu: [
//     { id: 'psu1', name: 'RM1000x', brand: 'Corsair', specs: ['1000W Capacity', '80+ Gold Certified', 'Fully Modular'], price: 189.99, image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=300&fit=crop' },
//     { id: 'psu2', name: 'SuperNOVA 850 G6', brand: 'EVGA', specs: ['850W Capacity', '80+ Gold Certified', 'Fully Modular'], price: 139.99, image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=300&fit=crop' },
//     { id: 'psu3', name: 'FOCUS GX-750', brand: 'Seasonic', specs: ['750W Capacity', '80+ Gold Certified', 'Fully Modular'], price: 119.99, image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=300&fit=crop' },
//   ],
//   case: [
//     { id: 'case1', name: '5000D AIRFLOW', brand: 'Corsair', specs: ['Mid Tower', 'Tempered Glass', 'E-ATX Support'], price: 179.99, image: 'https://images.unsplash.com/photo-1587202372583-49330a15584d?w=400&h=300&fit=crop' },
//     { id: 'case2', name: 'Meshify 2 Compact', brand: 'Fractal Design', specs: ['Mid Tower', 'Mesh Front Panel', 'USB Type-C'], price: 129.99, image: 'https://images.unsplash.com/photo-1587202372583-49330a15584d?w=400&h=300&fit=crop' },
//     { id: 'case3', name: 'H510 Flow', brand: 'NZXT', specs: ['Mid Tower', 'Cable Management', 'Clean Design'], price: 99.99, image: 'https://images.unsplash.com/photo-1587202372583-49330a15584d?w=400&h=300&fit=crop' },
//   ],
//   cooler: [
//     { id: 'cool1', name: 'NH-D15 chromax.black', brand: 'Noctua', specs: ['Dual Tower Design', '140mm Fans', 'Ultra Quiet'], price: 109.99, image: 'https://images.unsplash.com/photo-1580809473936-6d0b0f3e4e50?w=400&h=300&fit=crop' },
//     { id: 'cool2', name: 'Dark Rock Pro 4', brand: 'be quiet!', specs: ['Dual Tower Design', 'Silent Wings', '250W TDP'], price: 89.99, image: 'https://images.unsplash.com/photo-1580809473936-6d0b0f3e4e50?w=400&h=300&fit=crop' },
//     { id: 'cool3', name: 'Kraken X63', brand: 'NZXT', specs: ['280mm AIO', 'RGB Pump Head', 'LCD Display'], price: 149.99, image: 'https://images.unsplash.com/photo-1580809473936-6d0b0f3e4e50?w=400&h=300&fit=crop' },
//   ],
// };

// // ============================================================================
// // COMPONENTS
// // ============================================================================

// const BuildSummaryBar: React.FC<{
//   selectedParts: SelectedParts;
//   categories: ComponentCategory[];
// }> = ({ selectedParts, categories }) => {
//   return (
//     <div className="sticky top-0 z-30 mb-10 bg-white border-b border-gray-200 shadow-sm">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
//         <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 sm:mb-4">Build Progress</h2>
//         <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
//           {categories.map((cat) => {
//             const part = selectedParts[cat.id];
//             const isSelected = !!part;
            
//             return (
//               <div
//                 key={cat.id}
//                 className={`relative rounded-lg border-2 transition-all duration-300 ${
//                   isSelected 
//                     ? 'border-red-500 bg-red-50 shadow-sm' 
//                     : 'border-gray-200 bg-white hover:border-gray-300'
//                 }`}
//               >
//                 <div className="p-2 sm:p-3">
//                   <div className="flex items-center justify-between mb-1 sm:mb-2">
//                     <div className={`p-1 sm:p-1.5 rounded transition-colors ${isSelected ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
//                       {cat.icon}
//                     </div>
//                     {isSelected && (
//                       <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-red-500 flex items-center justify-center shadow-sm">
//                         <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
//                       </div>
//                     )}
//                   </div>
//                   <div>
//                     <p className="text-xs font-semibold text-gray-900 mb-0.5 truncate">{cat.name}</p>
//                     {isSelected ? (
//                       <p className="text-xs text-gray-600 truncate">{part!.brand}</p>
//                     ) : (
//                       <p className="text-xs text-gray-400">Not selected</p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// };

// const BuildSteps: React.FC<{
//   categories: ComponentCategory[];
//   selectedParts: SelectedParts;
//   activeCategory: string;
//   onSelectCategory: (id: string) => void;
// }> = ({ categories, selectedParts, activeCategory, onSelectCategory }) => {
//   return (
//     <div className="sticky top-60 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//       <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
//         <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Build Steps</h3>
//       </div>
//       <div className="p-3 space-y-1">
//         {categories.map((cat) => {
//           const isActive = activeCategory === cat.id;
//           const isSelected = !!selectedParts[cat.id];
          
//           return (
//             <button
//               key={cat.id}
//               onClick={() => onSelectCategory(cat.id)}
//               className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 text-left ${
//                 isActive 
//                   ? 'bg-red-500 text-white shadow-md transform scale-[1.02]' 
//                   : 'hover:bg-gray-50 text-gray-700 hover:shadow-sm'
//               }`}
//             >
//               <div className={`flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-gray-500'}`}>
//                 {cat.icon}
//               </div>
//               <div className="flex-1 min-w-0">
//                 <div className="flex items-center space-x-2">
//                   <p className="font-semibold text-sm">{cat.name}</p>
//                   {cat.required && !isActive && (
//                     <span className="text-xs text-red-500 font-bold">*</span>
//                   )}
//                 </div>
//                 {selectedParts[cat.id] && (
//                   <p className={`text-xs truncate mt-0.5 ${isActive ? 'text-red-100' : 'text-gray-600'}`}>
//                     {selectedParts[cat.id]!.brand} {selectedParts[cat.id]!.name}
//                   </p>
//                 )}
//               </div>
//               {isSelected && (
//                 <Check className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-red-500'}`} />
//               )}
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// const PartCard: React.FC<{
//   part: Part;
//   isSelected: boolean;
//   onSelect: () => void;
// }> = ({ part, isSelected, onSelect }) => {
//   return (
//     <div 
//       className={`bg-white rounded-xl border-2 transition-all duration-300 hover:shadow-xl group ${
//         isSelected 
//           ? 'border-red-500 shadow-lg ring-2 ring-red-100' 
//           : 'border-gray-200 hover:border-gray-300'
//       }`}
//     >
//       <div className="p-5 sm:p-6">
//         <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
//           {/* Image Section */}
//           <div className="flex-shrink-0">
//             <div className={`w-full sm:w-44 h-44 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 ${
//               isSelected ? 'ring-2 ring-red-500 ring-offset-2' : ''
//             }`}>
//               {part.image ? (
//                 <Image
//                 width={500}
//                 height={500}
//                   src={part.image} 
//                   alt={part.name}
//                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                 />
//               ) : (
//                 <div className="w-full h-full flex items-center justify-center">
//                   <Box className="w-16 h-16 text-gray-300" />
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Content Section */}
//           <div className="flex-1 min-w-0">
//             <div className="flex items-start justify-between mb-3">
//               <div className="flex-1">
//                 <div className="flex items-center flex-wrap gap-2 mb-2">
//                   <span className="inline-block px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 text-xs font-bold rounded-full uppercase tracking-wide border border-gray-200">
//                     {part.brand}
//                   </span>
//                   {isSelected && (
//                     <span className="inline-flex items-center space-x-1 px-3 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full border border-red-200">
//                       <Check className="w-3 h-3" />
//                       <span>Selected</span>
//                     </span>
//                   )}
//                 </div>
//                 <h4 className="font-bold text-gray-900 text-lg sm:text-xl mb-1">{part.name}</h4>
//               </div>
//             </div>
            
//             <div className="grid grid-cols-1 gap-2 mb-5">
//               {part.specs.map((spec, idx) => (
//                 <div key={idx} className="flex items-start text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
//                   <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2.5 flex-shrink-0 mt-1.5" />
//                   <span className="flex-1">{spec}</span>
//                 </div>
//               ))}
//             </div>
            
//             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
//               <div>
//                 <p className="text-xs text-gray-500 mb-1 font-medium">Price</p>
//                 <p className="text-2xl sm:text-3xl font-bold text-gray-900">${part.price.toFixed(2)}</p>
//               </div>
//              <button
//   onClick={onSelect}
//   className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl font-semibold 
//   transition-all duration-200 text-base shadow-sm
//   bg-red-600 text-white
//   ${
//     isSelected
//       ? 'opacity-100 shadow-md'
//       : 'opacity-50 hover:opacity-75'
//   }`}
// >
//   {isSelected ? 'Selected' : 'Select'}
// </button>

//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const PartsGrid: React.FC<{
//   parts: Part[];
//   selectedPart: Part | null;
//   onSelectPart: (part: Part) => void;
// }> = ({ parts, selectedPart, onSelectPart }) => {
//   return (
//     <div className="space-y-4 sm:space-y-5">
//       {parts.map((part) => (
//         <PartCard
//           key={part.id}
//           part={part}
//           isSelected={selectedPart?.id === part.id}
//           onSelect={() => onSelectPart(part)}
//         />
//       ))}
//     </div>
//   );
// };

// const ContextInfo: React.FC<{
//   category: ComponentCategory | null;
// }> = ({ category }) => {
//   if (!category) {
//     return (
//       <div className="sticky top-60 bg-white rounded-lg border border-gray-200 p-5">
//         <div className="flex items-start space-x-3">
//           <Info className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
//           <div>
//             <h3 className="font-semibold text-gray-900 mb-2">Getting Started</h3>
//             <p className="text-sm text-gray-600">
//               Select a component category from the left to start building your PC. We&appos;ll guide you through each step.
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="sticky top-60 bg-white rounded-lg border border-gray-200 p-5">
//       <div className="flex items-start space-x-3 mb-4">
//         <div className="p-2 bg-primary/10 rounded-lg text-primary">
//           {category.icon}
//         </div>
//         <div>
//           <h3 className="font-semibold text-gray-900">{category.name}</h3>
//           <p className="text-xs text-gray-500">{category.description}</p>
//         </div>
//       </div>
      
//       <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
//         <div className="flex items-start space-x-2">
//           <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
//           <p className="text-sm text-blue-900">{category.helpText}</p>
//         </div>
//       </div>
//     </div>
//   );
// };


// const OrderSummary: React.FC<{
//   selectedParts: SelectedParts;
//   categories: ComponentCategory[];
//   totalPrice: number;
//   isComplete: boolean;
// }> = ({ selectedParts, categories, totalPrice, isComplete }) => {
//   return (
//     <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
//       <div className="bg-primary p-6 text-white">
//         <h2 className="text-2xl font-bold mb-1">Order Summary</h2>
//         <p className="text-gray-300 text-sm">Review your selected components</p>
//       </div>
      
//       <div className="p-5 sm:p-6">
//         <div className="space-y-3 mb-6">
//           {categories.map((cat) => {
//             const part = selectedParts[cat.id];
//             return (
//               <div key={cat.id} className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
//                 part ? 'border-red-100 bg-red-50/50' : 'border-gray-100 bg-gray-50'
//               }`}>
//                 <div className="flex items-center space-x-3 flex-1 min-w-0">
//                   <div className={`p-2 rounded-lg ${part ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-400'}`}>
//                     {cat.icon}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
//                     {part ? (
//                       <p className="text-xs text-gray-600 truncate">
//                         {part.brand} {part.name}
//                       </p>
//                     ) : (
//                       <p className="text-xs text-gray-400">Not selected</p>
//                     )}
//                   </div>
//                 </div>
//                 {part && (
//                   <p className="text-base sm:text-lg font-bold text-gray-900 ml-4">${part.price.toFixed(2)}</p>
//                 )}
//               </div>
//             );
//           })}
//         </div>

//         <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 mb-6 border border-gray-200">
//           <div className="flex items-center justify-between text-sm mb-3">
//             <span className="text-gray-600 font-medium">Subtotal</span>
//             <span className="font-semibold text-gray-900">${totalPrice.toFixed(2)}</span>
//           </div>
//           <div className="h-px bg-gray-300 mb-3" />
//           <div className="flex items-center justify-between">
//             <span className="text-xl font-bold text-gray-900">Total</span>
//             <span className="text-3xl font-bold text-red-600">${totalPrice.toFixed(2)}</span>
//           </div>
//         </div>

//         <button
//           disabled={!isComplete}
//           className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-200 flex items-center justify-center space-x-3 ${
//             isComplete
//               ? 'bg-red-500 text-white hover:bg-red-600 hover:shadow-xl shadow-lg hover:scale-[1.02] active:scale-[0.98]'
//               : 'bg-gray-200 text-gray-400 cursor-not-allowed'
//           }`}
//         >
//           <ShoppingCart className="w-5 h-5" />
//           <span>Proceed to Checkout</span>
//         </button>

//         {!isComplete && (
//           <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2">
//             <Info className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
//             <p className="text-xs text-red-800">
//               Please select all required components to continue
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

 

// // ============================================================================
// // MAIN PAGE COMPONENT
// // ============================================================================

// export default function BuildMyPC() {
//   const [selectedParts, setSelectedParts] = useState<SelectedParts>({});
//   const [activeCategory, setActiveCategory] = useState<string>(categories[0].id);

//   const totalPrice = useMemo(() => {
//     return Object.values(selectedParts).reduce((sum, part) => {
//       return sum + (part?.price || 0);
//     }, 0);
//   }, [selectedParts]);

//   const isComplete = useMemo(() => {
//     return categories
//       .filter((cat) => cat.required)
//       .every((cat) => selectedParts[cat.id]);
//   }, [selectedParts]);

//   const handleSelectPart = (part: Part) => {
//     setSelectedParts((prev) => ({
//       ...prev,
//       [activeCategory]: part,
//     }));
//   };

//   const activeCategoryData = categories.find((cat) => cat.id === activeCategory);
//   const availableParts = mockParts[activeCategory] || [];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

     
  
//       {/* Build Progress Bar */}
//       <BuildSummaryBar selectedParts={selectedParts} categories={categories} />
      

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
 
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
//           {/* Left Column - Build Steps */}
//           <div className="lg:col-span-3">
//             <BuildSteps
//               categories={categories}
//               selectedParts={selectedParts}
//               activeCategory={activeCategory}
//               onSelectCategory={setActiveCategory}
//             />
//           </div>

//           {/* Center Column - Parts List */}
//           <div className="lg:col-span-6">
          

//             <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
//            <h2 className="text-2xl font-bold text-gray-900 mb-2">
//                Select {activeCategoryData?.name}             </h2>
//               <p className="text-sm text-gray-600">
//                 {activeCategoryData?.description}
//              </p>
//            </div>
            
//             <PartsGrid
//               parts={availableParts}
//               selectedPart={selectedParts[activeCategory] || null}
//               onSelectPart={handleSelectPart}
//             />
//           </div>

//           {/* Right Column - Context Info & Order Summary */}
//           <div className="lg:col-span-3 space-y-6">
//             <ContextInfo category={activeCategoryData || null} />
         
//           </div>
//         </div>
//         {/* Right Column - Context Info & Order Summary */}
// <div className="lg:col-span-3 mt-14 flex flex-col">
//   <div className="mt-auto">
//     <OrderSummary
//       selectedParts={selectedParts}
//       categories={categories}
//       totalPrice={totalPrice}
//       isComplete={isComplete}
//     />
//   </div>
// </div>


//       </div>
//     </div>
//   );
// }


export default async function BuildPage() {
  const result = await fetchPartOptions(true);

  if (!result.success) {
    return <div className="p-10 text-red-500">Failed to load parts</div>;
  }

  const parts = result.data.map((p) => ({
    _id: p._id!,
    name: p.name,
    brand: p.brand ?? "Unknown",
    price: p.price ?? 0,
    type: p.type,           // ✅ FIX: map type → category
    image: p.imageUrl,
    specs: [],
  }));

  return <BuildClient parts={parts} />;
}

