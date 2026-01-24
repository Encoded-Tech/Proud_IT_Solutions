"use client";
import React from 'react';
import { Monitor, Cpu, Keyboard, Zap, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePromoLinks() {

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Animated Background - Light Mode */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-400 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-green-400 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Premium Header with SEO Content */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 via-blue-500 to-green-500 px-6 py-2 rounded-full mb-6 shadow-lg">
            <Zap className="w-4 h-4 text-white animate-pulse" />
            <span className="text-white text-sm font-semibold">Nepal&apos;s Most Trusted Electronics Store</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 mb-6 leading-tight">
            Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-red-700">Laptops</span>,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700">Custom PCs</span> &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-green-600 to-green-700">Accessories</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto mb-4">
            Buy the latest gaming laptops, workstation computers, custom-built PCs, and premium computer accessories in Nepal. Authorized dealer with warranty, fast delivery all over Nepal.
          </p>
        </div>

        {/* Premium Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Laptops Card */}
          <div
            className="group relative bg-white rounded-3xl overflow-hidden border-2 border-slate-200 hover:border-red-400 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative p-8">
              <div className="mb-6 inline-block">
                <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-red-500/30">
                  <Monitor className="w-10 h-10 text-white" strokeWidth={2.5} />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-slate-900 mb-3">
                Buy Laptops in Nepal
              </h2>
              
              <p className="text-slate-600 mb-6 leading-relaxed">
                Gaming laptops, business laptops, ultrabooks from Dell, HP, Lenovo, Asus, Acer, MSI. Best laptop price in Nepal with genuine warranty applied.
              </p>
              
              <ul className="space-y-2 mb-8 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-red-500" />
                  Gaming & Business Laptops
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-red-500" />
                  Dell, HP, Lenovo, Asus, MSI
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-red-500" />
                  Official Warranty & Support
                </li>
              </ul>
              
              <Link href="/shop/laptops">
                <button className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-4 px-6 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 flex items-center justify-center gap-2 group">
                  <span>Shop Laptops Now</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>

          {/* Custom PCs Card */}
          <div
            className="group relative bg-white rounded-3xl overflow-hidden border-2 border-slate-200 hover:border-blue-400 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative p-8">
              <div className="mb-6 inline-block">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-blue-500/30">
                  <Cpu className="w-10 h-10 text-white" strokeWidth={2.5} />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-slate-900 mb-3">
                Custom PC Build
              </h2>
              
              <p className="text-slate-600 mb-6 leading-relaxed">
                Build custom gaming PC, workstation, desktop computer in Nepal. Expert PC assembly, RGB builds, Intel & AMD processors, RTX graphics cards.
              </p>
              
              <ul className="space-y-2 mb-8 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-500" />
                  Gaming & Workstation Builds
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-500" />
                  Intel, AMD, NVIDIA RTX
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-500" />
                  Professional PC Assembly
                </li>
              </ul>
              
              <Link href="/build-my-pc">
                <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 flex items-center justify-center gap-2 group">
                  <span>Build Your PC</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>

          {/* Accessories Card */}
          <div
            className="group relative bg-white rounded-3xl overflow-hidden border-2 border-slate-200 hover:border-green-400 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative p-8">
              <div className="mb-6 inline-block">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-green-500/30">
                  <Keyboard className="w-10 h-10 text-white" strokeWidth={2.5} />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-slate-900 mb-3">
                Computer Accessories
              </h2>
              
              <p className="text-slate-600 mb-6 leading-relaxed">
                Gaming keyboards, mice, headsets, monitors, SSDs, RAM, graphics cards, motherboards, power supply, cooling fans, etc - all computer parts.
              </p>
              
              <ul className="space-y-2 mb-8 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-green-500" />
                  Gaming Peripherals & Parts
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-green-500" />
                  Monitors, SSD, RAM, GPU
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-green-500" />
                  Genuine Products & Warranty
                </li>
              </ul>
              
              <Link href="/shop/accessories">
                <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 flex items-center justify-center gap-2 group">
                  <span>Browse Accessories</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}