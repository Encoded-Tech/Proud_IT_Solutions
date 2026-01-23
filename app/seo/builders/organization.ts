import { COMPANY_CONFIG } from "../config/company";
import { CONTACT_CONFIG } from "../config/contact";
import { OrganizationSEOSchemaConfig } from "../types/seo-config";

/**
 * Builds a JSON-LD Organization schema for SEO purposes.
 * This schema follows Schema.org standards and can be used
 * in a <script type="application/ld+json"> tag on the website.
 *
 * @returns OrganizationSEOConfig
 */
export const buildOrganizationSchema = (): OrganizationSEOSchemaConfig => ({
  "@context": "https://schema.org",

  // Multiple types for better SEO coverage
  "@type": ["Organization", "LocalBusiness", "Brand"],

  // Basic organization info
  name: COMPANY_CONFIG.name,
  legalName: COMPANY_CONFIG.legalName,
  url: COMPANY_CONFIG.url,

  // Logo information
  logo: {
    "@type": "ImageObject",
    url: COMPANY_CONFIG.logo.url,
    width: COMPANY_CONFIG.logo.width,
    height: COMPANY_CONFIG.logo.height,
  },

  // Optional details about founding and pricing
  foundingDate: COMPANY_CONFIG.foundingDate,
  priceRange: COMPANY_CONFIG.priceRange,

  // Address information
  address: {
    "@type": "PostalAddress",
    streetAddress: CONTACT_CONFIG.address.street,
    addressLocality: CONTACT_CONFIG.address.locality,
    addressRegion: CONTACT_CONFIG.address.region,
    postalCode: CONTACT_CONFIG.address.postalCode,
    addressCountry: "NP", // Country code for Nepal
  },

  // Geo coordinates for the business location
  geo: {
    "@type": "GeoCoordinates",
    latitude: CONTACT_CONFIG.address.geo.latitude,
    longitude: CONTACT_CONFIG.address.geo.longitude,
  },

  // Contact points: can include multiple ways to contact the organization
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: CONTACT_CONFIG.contactPoint.email,
      telephone: CONTACT_CONFIG.contactPoint.telephone,
      availableLanguage: CONTACT_CONFIG.contactPoint.availableLanguage,
    },
  ],

  // Area served
  areaServed: {
    "@type": "Country",
    name: "Nepal",
  },

  // Social media and other sameAs links
  sameAs: COMPANY_CONFIG.socialLinks,
});
