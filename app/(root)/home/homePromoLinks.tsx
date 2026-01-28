"use client";
import React from "react";
import { Monitor, Cpu, Keyboard, Zap, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function HomePromoLinks() {
  const cards = [
    {
      icon: Monitor,
      title: "Buy Laptops in Nepal",
      desc:
        "Gaming laptops, business laptops, ultrabooks from Dell, HP, Lenovo, Asus, Acer, MSI. Best laptop price in Nepal with genuine warranty applied.",
      items: [
        "Gaming & Business Laptops",
        "Dell, HP, Lenovo, Asus, MSI",
        "Official Warranty & Support",
      ],
      color: "red",
      link: "/shop/laptops",
      btn: "Shop Laptops Now",
    },
    {
      icon: Cpu,
      title: "Custom PC Build",
      desc:
        "Build custom gaming PC, workstation, desktop computer in Nepal. Expert PC assembly, RGB builds, Intel & AMD processors, RTX graphics cards.",
      items: [
        "Gaming & Workstation Builds",
        "Intel, AMD, NVIDIA RTX",
        "Professional PC Assembly",
      ],
      color: "blue",
      link: "/build-my-pc",
      btn: "Build Your PC",
    },
    {
      icon: Keyboard,
      title: "Computer Accessories",
      desc:
        "Gaming keyboards, mice, headsets, monitors, SSDs, RAM, graphics cards, motherboards, power supply, cooling fans, etc - all computer parts.",
      items: [
        "Gaming Peripherals & Parts",
        "Monitors, SSD, RAM, GPU",
        "Genuine Products & Warranty",
      ],
      color: "green",
      link: "/shop/accessories",
      btn: "Browse Accessories",
    },
  ];

  return (
    <section className="w-full bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-72 h-72 md:w-96 md:h-96 bg-blue-400 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 md:w-96 md:h-96 bg-red-400 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 md:w-96 md:h-96 bg-green-400 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Decorative grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 via-blue-500 to-green-500 px-4 sm:px-6 py-2 rounded-full mb-5 shadow-lg">
            <Zap className="w-4 h-4 text-white" />
            <span className="text-white text-xs sm:text-sm font-semibold">
              Nepal&apos;s Most Trusted Electronics Store
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-slate-900 mb-5 leading-tight">
            Premium{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-red-700">
              Laptops
            </span>
            ,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700">
              Custom PCs
            </span>{" "}
            &{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-green-600 to-green-700">
              Accessories
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto">
            Buy the latest gaming laptops, workstation computers, custom-built PCs,
            and premium computer accessories in Nepal. Authorized dealer with
            warranty, fast delivery all over Nepal.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className={`group relative bg-white rounded-3xl overflow-hidden border-2 border-slate-200 hover:border-${card.color}-400 transition-all duration-500 transform hover:scale-[1.03] hover:shadow-2xl hover:shadow-${card.color}-500/20`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br from-${card.color}-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
                <div className="relative p-6 sm:p-8">
                  <div
                    className={`mb-5 inline-block bg-gradient-to-br from-${card.color}-500 to-${card.color}-600 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-${card.color}-500/30`}
                  >
                    <Icon className="w-8 sm:w-10 h-8 sm:h-10 text-white" strokeWidth={2.5} />
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
                    {card.title}
                  </h2>

                  <p className="text-sm sm:text-base text-slate-600 mb-5 leading-relaxed">
                    {card.desc}
                  </p>

                  <ul className="space-y-2 mb-6 text-sm text-slate-700">
                    {card.items.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <ChevronRight className={`w-4 h-4 text-${card.color}-500`} />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Link href={card.link}>
                    <button
                      className={`w-full bg-gradient-to-r from-${card.color}-500 to-${card.color}-600 text-white font-bold py-3 sm:py-4 rounded-xl hover:from-${card.color}-600 hover:to-${card.color}-700 transition-all duration-300 shadow-lg shadow-${card.color}-500/30 hover:shadow-${card.color}-500/50 flex items-center justify-center gap-2`}
                    >
                      {card.btn}
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
