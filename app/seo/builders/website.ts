// app/seo/builders/website.ts
import { COMPANY_CONFIG } from "../config/company";
import { WebsiteSEOSchemaConfig } from "../types/seo-config";
import { SERVER_PRODUCTION_URL } from "@/config/env";

/**
 * Builds a JSON-LD Website schema for SEO.
 * This can be embedded in the <head> of your pages.
 *
 * @returns WebsiteSEOConfig
 */
export const buildWebsiteSchema = (): WebsiteSEOSchemaConfig => ({
  "@context": "https://schema.org",
  "@type": "WebSite",

  // Main website URL
  url: SERVER_PRODUCTION_URL,
  
  // Name of the website
  name: COMPANY_CONFIG.name,

  // Publisher information
  publisher: {
    "@type": "Organization",
    name: COMPANY_CONFIG.name,
    url: COMPANY_CONFIG.url,
  },

  // Optional: enables Google search box rich result
  potentialAction: {
    "@type": "SearchAction",
    target: `${SERVER_PRODUCTION_URL}/search?query={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});
