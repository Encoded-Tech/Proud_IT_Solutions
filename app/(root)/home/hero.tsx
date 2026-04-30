import Image from "@/components/ui/optimized-image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type HeroCard = {
  image: string;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  badge: string;
  aspect: string;
};

const heroCards: HeroCard[] = [
  {
    image: "/banner/hero1.png",
    title: "Fresh Arrivals for You",
    description:
      "Browse premium laptops, office-ready notebooks, and creator machines backed by genuine support.",
    ctaLabel: "Shop Laptops",
    href: "/shop?category=laptops",
    badge: "Hero First",
    aspect: "lg:aspect-[16/11]",
  },
  {
    image: "/banner/hero2.png",
    title: "Build, Upgrade, and Save",
    description:
      "Compare trending accessories, custom PC parts, and limited-time bundles from the homepage.",
    ctaLabel: "Explore Accessories",
    href: "/shop?category=monitor",
    badge: "Hero Second",
    aspect: "lg:aspect-[16/10]",
  },
];

function HeroCardLink({ item, priority }: { item: HeroCard; priority?: boolean }) {
  return (
    <Link
      href={item.href}
      aria-label={`${item.title} - ${item.ctaLabel}`}
      className={`group relative block overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950 shadow-[0_24px_70px_rgba(15,23,42,0.14)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_32px_90px_rgba(15,23,42,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 ${item.aspect}`}
    >
      <div className="relative aspect-[16/12] h-full">
        <Image
          src={item.image}
          alt={item.title}
          fill
          priority={priority}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-slate-950/35 to-red-900/35" />
        <div className="relative flex h-full min-h-[280px] flex-col justify-between p-6 sm:p-8">
          <div className="space-y-4">
            <span className="inline-flex w-fit rounded-full border border-white/20 bg-white/12 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-white backdrop-blur-sm">
              {item.badge}
            </span>
            <div className="max-w-lg space-y-3">
              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                {item.title}
              </h2>
              <p className="max-w-md text-sm leading-6 text-slate-200 sm:text-base">
                {item.description}
              </p>
            </div>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-lg transition duration-300 group-hover:bg-red-50">
            <span>{item.ctaLabel}</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Hero() {
  return (
    <section className="h-full w-full" aria-label="Homepage hero promotions">
      <div className="grid h-full gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <HeroCardLink item={heroCards[0]} priority />
        </div>
        <div className="lg:col-span-5">
          <HeroCardLink item={heroCards[1]} />
        </div>
      </div>
    </section>
  );
}
