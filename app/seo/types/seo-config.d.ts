export interface OrganizationSEOSchemaConfig {
  "@context": "https://schema.org";
  "@type": ("Organization" | "Brand" | "LocalBusiness")[];
  name: string;
  legalName: string;
  url: string | undefined;
  logo: {
    "@type": "ImageObject";
    url: string | undefined;
    width: number;
    height: number;
  };
  foundingDate?: string;
  priceRange?: string;
  address: {
    "@type": "PostalAddress";
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: "NP";
  };
  geo?: {
    "@type": "GeoCoordinates";
    latitude: string;
    longitude: string;
  };
  contactPoint: Array<{
    "@type": "ContactPoint";
    email: string;
    telephone: string;
    contactType?: string;
    availableLanguage: readonly string[];
  }>;
  areaServed: {
    "@type": "Country";
    name: "Nepal";
  };
  sameAs: string[];
  subOrganization?: Array<{
    "@type": "Organization";
    name: string;
    url: string | undefined;
    description?: string;
  }>;
}


export interface WebsiteSEOSchemaConfig {
  "@context": "https://schema.org";
  "@type": "WebSite";
  url: string | undefined;
  name: string;
  publisher: {
    "@type": "Organization";
    name: string;
    url: string | undefined;
  };
  potentialAction: {
    "@type": "SearchAction";
    target: string;
    "query-input": string;
  };
}


// app/seo/types/product.ts

export interface ProductSEOSchemaConfig {
  "@context": "https://schema.org";
  "@type": "Product";
  name: string;
  description?: string;
  url: string | undefined;
  image: string[]; // full URLs to product images
  sku?: string;
  brand: {
    "@type": "Brand";
    name: string;
  };
  offers?: {
    "@type": "Offer";
    priceCurrency: string; // e.g., "NPR"
    price: number;
    availability?: "https://schema.org/InStock" | "https://schema.org/OutOfStock";
    url: string; // product page URL
    validFrom?: string; // ISO date string
  };
  aggregateRating?: {
    "@type": "AggregateRating";
    ratingValue: number;
    reviewCount: number;
  };
  review?: Array<{
    "@type": "Review";
    author: string;
    datePublished: string; // ISO date string
    reviewBody: string;
    reviewRating: {
      "@type": "Rating";
      ratingValue: number;
    };
  }>;
}
