import React from "react";
import HomeMain from "./home/page";

import { Metadata } from "next";
import { APP_NAME, SERVER_PRODUCTION_URL } from "@/config/env";

export const metadata: Metadata = {
  title: `Computer Store in Nepal | Best Laptop & PC Shop in Kathmandu | ${APP_NAME}`,

  description:
    "Trusted electronics store in Nepal offering laptops, PCs, printers, monitors, and accessories. Best electronics shop in Kathmandu & Putalisadak.",

 keywords: [
  "Proud Nepal electronics",
  "Nepal electronics brand",
  "trusted electronics company Nepal",
  "electronics solutions Nepal",
  "technology store Kathmandu",
  "electronics retailer Kathmandu",
  "Nepal tech products",
  "reliable electronics Nepal",
  "quality electronics Nepal",
  "electronics for home and office Nepal",
  "electronics innovation Nepal",
  "Nepal digital lifestyle store",
  "electronics experts Nepal",
  "customer-first electronics Nepal",
  "modern electronics Nepal",
  "electronics services Nepal",
  "tech-driven electronics Nepal",
  "Nepal electronics marketplace",
  "electronics shopping experience Nepal",
  "future-ready electronics Nepal",
],


  alternates: {
    canonical: SERVER_PRODUCTION_URL,
  },

  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: `Computer Store in Nepal | ${APP_NAME}`,
    description:
      "Buy laptops, PCs, printers, monitors, and electronics from a trusted electronics store in Kathmandu, Nepal.",
    url: SERVER_PRODUCTION_URL,
    images: [],
  },

  twitter: {
    card: "summary_large_image",
    title: `Computer Store in Nepal | ${APP_NAME}`,
    description:
      "Best electronics shop in Nepal for laptops, PCs, printers, and accessories.",
    images: [],
  },
};


const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://proudnepal.com.np/",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Shop",
        "item": "https://proudnepal.com.np/shop",
      },
    ],
  };

const page = () => {
  return (
    <div>

{/* ✅ Breadcrumb Schema (SEO only, invisible) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <HomeMain />
    </div>
  );
};

export default page;
