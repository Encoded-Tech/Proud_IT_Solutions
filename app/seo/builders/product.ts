import { SERVER_PRODUCTION_URL } from "@/config/env";
import {ProductSEOSchemaConfig } from "../types/seo-config";
import { productType } from "@/types/product";

/**
 * Builds a JSON-LD Product schema for SEO purposes.
 * This schema follows the Schema.org standard and can be injected
 * into a webpage's <script type="application/ld+json"> tag.
 *
 * @param product - The frontend product object
 * @returns A ProductSEOConfig object ready for JSON-LD usage
 */
export const buildProductSchema = (product: productType): ProductSEOSchemaConfig => {
  // Construct the absolute URL for the product
  const productUrl = `${SERVER_PRODUCTION_URL}/products/${product.slug}`;

  /**
   * Build the Offer object for the product.
   * - Uses the offeredPrice if the offer is active.
   * - Falls back to the regular price if no offer is active.
   * - Includes stock availability and the product URL.
   */
  const offers: ProductSEOSchemaConfig["offers"] = product.isOfferedPriceActive && product.offeredPrice
    ? {
        "@type": "Offer", // Literal type as per ProductSEOConfig
        priceCurrency: "NPR", // Nepalese Rupee
        price: product.offeredPrice,
        availability: product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        url: productUrl,
        validFrom: product.offerStartDate?.toISOString(), // Optional start date
      }
    : {
        "@type": "Offer",
        priceCurrency: "NPR",
        price: product.price,
        availability: product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        url: productUrl,
      };

  /**
   * Build the AggregateRating object for SEO.
   * - Only include if the product has at least one review.
   */
  const aggregateRating: ProductSEOSchemaConfig["aggregateRating"] = product.reviews?.length > 0
    ? {
        "@type": "AggregateRating",
        ratingValue: product.avgRating, // Average rating from all reviews
        reviewCount: product.reviews.length, // Total number of reviews
      }
    : undefined;

  /**
   * Map product reviews to the Schema.org Review format.
   * - Each review includes author, date, body, and rating.
   * - If user name is missing, defaults to "Anonymous".
   */
  const review: ProductSEOSchemaConfig["review"] = product.reviews?.map(r => ({
    "@type": "Review",
    author: r.user.name || "Anonymous",
    datePublished: r.createdAt.toString(),
    reviewBody: r.comment,
    reviewRating: {
      "@type": "Rating",
      ratingValue: r.rating,
    },
  }));

  // Return the fully constructed ProductSEOConfig object
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    url: productUrl,
    image: product?.images?.map(img => `${SERVER_PRODUCTION_URL}/${img}`) || [], // Full URLs for images
    sku: product.slug, // SKU identifier
    brand: {
      "@type": "Brand",
      name: product.brandName,
    },
    offers,
    aggregateRating,
    review,
  };
};
