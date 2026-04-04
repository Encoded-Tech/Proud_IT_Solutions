"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {

  X,
  ArrowRight,
  Timer,
  ShoppingBag,
  CalendarDays,
  Sparkles,
  Monitor,
  Laptop,
  Tv2,
  Camera,
  Printer,
  Package,
} from "lucide-react";

// ── types ─────────────────────────────────────────────────────────────────────
interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// ── constants ─────────────────────────────────────────────────────────────────
const TARGET_DATE     = new Date("2026-05-14T23:59:59");
const OFFER_END_LABEL = "Last Day of Baisakh 2083 - May 14, 2026";

const OFFER_ITEMS = [
  { icon: Monitor,  label: "Gaming PCs"      },
  { icon: Laptop,   label: "Gaming Laptops"  },
  { icon: Tv2,      label: "Monitors"        },
  { icon: Camera,   label: "CCTV Cameras"    },
  { icon: Printer,  label: "Printers"        },
  { icon: Package,  label: "IT Accessories"  },
];

// ── helpers ───────────────────────────────────────────────────────────────────
function getTimeLeft(): TimeLeft {
  const diff = TARGET_DATE.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days:    Math.floor(diff / 86_400_000),
    hours:   Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
  };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// ── CountUnit ─────────────────────────────────────────────────────────────────
function CountUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="
          relative w-16 h-16 sm:w-20 sm:h-20
          flex items-center justify-center
          rounded-2xl
          text-white font-black text-2xl sm:text-3xl
          tracking-tight tabular-nums
          overflow-hidden
        "
        style={{
          background: "linear-gradient(160deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.04) 100%)",
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        {pad(value)}
        {/* subtle inner pulse glow */}
        <span
          className="absolute inset-0 rounded-2xl pointer-events-none animate-pulse"
          style={{ background: "radial-gradient(circle at 50% 0%, rgba(248,113,113,0.18), transparent 70%)" }}
        />
      </div>
      <span
        className="uppercase tracking-widest font-semibold"
        style={{ fontSize: 9, color: "rgba(252,165,165,0.85)", letterSpacing: "0.2em" }}
      >
        {label}
      </span>
    </div>
  );
}

// ── BannerTimer ───────────────────────────────────────────────────────────────
function BannerTimer({ t }: { t: TimeLeft }) {
  return (
    <span className="font-mono font-bold tracking-tight">
      {pad(t.days)}d {pad(t.hours)}h {pad(t.minutes)}m {pad(t.seconds)}s
    </span>
  );
}

// ── OfferTicker — horizontal scrolling pill strip ─────────────────────────────
function OfferTicker() {
  // Duplicate for seamless loop
  const items = [...OFFER_ITEMS, ...OFFER_ITEMS];
  return (
    <div
      className="w-full overflow-hidden"
      style={{
        borderTop:    "0.5px solid rgba(255,255,255,0.07)",
        borderBottom: "0.5px solid rgba(255,255,255,0.07)",
        padding: "10px 0",
        background: "rgba(0,0,0,0.18)",
      }}
    >
      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          display: flex;
          width: max-content;
          animation: ticker 18s linear infinite;
        }
        .ticker-track:hover { animation-play-state: paused; }
      `}</style>

      <div className="ticker-track">
        {items.map(({ icon: Icon, label }, i) => (
          <span
            key={i}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              margin: "0 10px",
              padding: "5px 14px",
              borderRadius: 999,
              background: "rgba(220,38,38,0.13)",
              border: "0.5px solid rgba(248,113,113,0.25)",
              color: "rgba(252,165,165,0.95)",
              fontSize: 12,
              fontWeight: 600,
              whiteSpace: "nowrap",
              letterSpacing: "0.02em",
            }}
          >
            <Icon size={13} strokeWidth={1.8} style={{ color: "#f87171", flexShrink: 0 }} />
            {label}
            <span style={{ marginLeft: 4, color: "rgba(248,113,113,0.5)", fontSize: 10 }}>●</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function NewYearOfferModal() {
  const [isOpen,   setIsOpen]   = useState<boolean>(false);
  const [mounted,  setMounted]  = useState<boolean>(false);
  const [visible,  setVisible]  = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft());

  useEffect(() => {
    setMounted(true);
    setIsOpen(true);
    setTimeout(() => setVisible(true), 20);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1_000);
    return () => clearInterval(id);
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(() => setIsOpen(false), 350);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && handleClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClose]);

  if (!mounted) return null;

  const showBanner = !isOpen;

  return (
    <>
      {/* ── Sticky Banner ── */}
      <div
        aria-hidden={isOpen}
        className={`
          sticky top-0 z-50 w-full overflow-hidden
          transition-all duration-500 ease-in-out
          ${showBanner ? "max-h-12 opacity-100" : "max-h-0 opacity-0 pointer-events-none"}
        `}
      >
        <div
          className="flex items-center justify-between gap-2 px-4 py-2 sm:px-6 text-white text-xs sm:text-sm font-medium shadow-md"
          style={{
            background: "linear-gradient(90deg, #991b1b 0%, #cc0000 45%, #b91c1c 100%)",
            boxShadow: "0 2px 12px rgba(153,27,27,0.45)",
          }}
        >
          <span className="flex items-center gap-2 min-w-0 truncate">
          
            <span className="font-semibold truncate">
              🎉 Proud IT Suppliers New Year Offer - Naya Barsha 2083!
            </span>
            <span className="hidden sm:inline text-white/40">|</span>
            <Timer className="hidden sm:inline-block w-3.5 h-3.5 shrink-0 text-red-200" aria-hidden="true" />
            <span className="hidden sm:inline text-red-100">
              <BannerTimer t={timeLeft} />
            </span>
          </span>
          <Link
            href="/shop"
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white font-bold text-xs transition-all duration-200 hover:bg-red-50 hover:scale-105 hover:shadow-md"
            style={{ color: "#cc0000" }}
          >
            <ShoppingBag className="w-3 h-3" aria-hidden="true" />
            Shop Now
          </Link>
        </div>
      </div>

      {/* ── Modal ── */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="New Year Offer"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            onClick={handleClose}
            className={`absolute inset-0 backdrop-blur-sm transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
            style={{ background: "rgba(60,0,0,0.55)" }}
          />

          {/* Card */}
          <div
            className={`
              relative z-10 w-full max-w-md
              rounded-3xl overflow-hidden
              transition-all duration-300 ease-out
              ${visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-8"}
            `}
            style={{
              background: "linear-gradient(160deg, #1a0505 0%, #0f0a0a 50%, #160808 100%)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(220,38,38,0.2), inset 0 0 80px rgba(220,38,38,0.04)",
            }}
          >
            {/* Top gradient bar */}
            <div
              className="absolute top-0 inset-x-0 h-[3px] rounded-t-3xl"
              style={{ background: "linear-gradient(90deg, #7f1d1d, #cc0000, #ef4444, #cc0000, #7f1d1d)" }}
            />

            {/* Ambient glow blobs */}
            <div
              className="absolute -top-12 -right-12 w-44 h-44 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(220,38,38,0.15) 0%, transparent 70%)", filter: "blur(24px)" }}
            />
            <div
              className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(153,27,27,0.12) 0%, transparent 70%)", filter: "blur(24px)" }}
            />

            {/* Subtle ring */}
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{ boxShadow: "inset 0 0 0 0.5px rgba(220,38,38,0.18)" }}
            />

            {/* ── Content ── */}
            <div className="relative z-10 flex flex-col items-center text-center">

              {/* Close */}
              <button
                onClick={handleClose}
                aria-label="Close"
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "0.5px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.5)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.15)"; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)"; }}
              >
                <X className="w-4 h-4" />
              </button>

              {/* Top section */}
              <div className="px-6 pt-9 pb-5 sm:px-8 sm:pt-11 flex flex-col items-center gap-5">

                {/* Badge */}
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest"
                  style={{
                    background: "rgba(220,38,38,0.12)",
                    border: "0.5px solid rgba(248,113,113,0.3)",
                    color: "#fca5a5",
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  नया वर्ष २०८३ · Naya Barsha 2083
                </span>

                {/* Title */}
                <div className="space-y-0.5">
                  <h2 className="text-white font-black text-xl sm:text-2xl leading-tight tracking-tight">
                    Proud IT Suppliers
                  </h2>
                  <h3
                    className="font-black text-2xl sm:text-3xl leading-tight"
                    style={{
                      background: "linear-gradient(90deg, #f87171, #cc0000, #f87171)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    New Year Offer 🎉
                  </h3>
                </div>

                {/* Description */}
                <p style={{ color: "rgba(203,213,225,0.75)", fontSize: 14, lineHeight: 1.65, maxWidth: 300 }}>
                  Celebrate Naya Barsha 2083 with exclusive savings on{" "}
                  <span style={{ color: "#f87171", fontWeight: 600 }}>laptops</span>,{" "}
                  <span style={{ color: "#f87171", fontWeight: 600 }}>PCs</span>, and{" "}
                  <span style={{ color: "#f87171", fontWeight: 600 }}>IT accessories</span> - curated for
                  gamers, creators, and professionals.
                </p>
              </div>

              {/* ── Offer Ticker Strip ── */}
              <OfferTicker />

              {/* Bottom section */}
              <div className="px-6 pb-7 pt-5 sm:px-8 sm:pb-8 flex flex-col items-center gap-5 w-full">

                {/* Countdown */}
                <div className="w-full">
                  <div
                    className="flex items-center justify-center gap-1.5 mb-3"
                    style={{ color: "rgba(148,163,184,0.7)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase" }}
                  >
                    <Timer className="w-3.5 h-3.5" aria-hidden="true" />
                    Offer ends in
                  </div>
                  <div className="flex justify-center gap-2 sm:gap-3">
                    <CountUnit value={timeLeft.days}    label="Days"  />
                    <div className="text-white/25 font-black text-2xl self-center mb-5">:</div>
                    <CountUnit value={timeLeft.hours}   label="Hours" />
                    <div className="text-white/25 font-black text-2xl self-center mb-5">:</div>
                    <CountUnit value={timeLeft.minutes} label="Mins"  />
                    <div className="text-white/25 font-black text-2xl self-center mb-5">:</div>
                    <CountUnit value={timeLeft.seconds} label="Secs"  />
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href="/shop"
                  className="group relative w-full max-w-xs inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-white font-black text-base tracking-wide transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #991b1b 0%, #cc0000 50%, #b91c1c 100%)",
                    boxShadow: "0 6px 24px rgba(204,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.12)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 10px 32px rgba(204,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 6px 24px rgba(204,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.12)";
                  }}
                >
                  <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                  Shop Now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                  {/* Shimmer sweep */}
                  <span className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                    <span className="absolute -left-full top-0 h-full w-1/2 bg-white/20 skew-x-12 group-hover:left-full transition-[left] duration-700 ease-in-out" />
                  </span>
                </Link>

                {/* End date */}
                <p
                  className="flex items-center gap-1.5"
                  style={{ color: "rgba(100,116,139,0.8)", fontSize: 11 }}
                >
                  <CalendarDays className="w-3.5 h-3.5" aria-hidden="true" />
                  Offer ends {OFFER_END_LABEL}
                </p>

              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}