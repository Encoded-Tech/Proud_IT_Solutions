import { buildProductSchema } from "@/app/seo/builders/product";
import { buildMetadata } from "@/app/seo/utils/metadata";
import ListSingleProduct from "@/components/server/ListSingleProduct";
import {
  fetchPublicProductBySlug,
  fetchPublicProductSlugs,
} from "@/lib/server/fetchers/fetchPublicProducts";
import { APP_NAME } from "@/config/env";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";

export async function generateStaticParams() {
  const slugs = await fetchPublicProductSlugs();

  if (slugs.length === 0) {
    return [{ slug: "__placeholder__" }];
  }

  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const res = await fetchPublicProductBySlug(slug);
  const product = res.data;

  if (!product) {
    return buildMetadata({
      title: `Product Not Found | ${APP_NAME}`,
      description: "The requested product could not be found.",
      path: `/products/${slug}`,
      index: false,
    });
  }

  const descriptionSource =
    product.seoMeta?.metaDescription ||
    product.description ||
    `${product.name} from ${APP_NAME}. View pricing, specifications, stock, and purchase details.`;

  const cleanDescription = descriptionSource.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  return buildMetadata({
    title: product.seoMeta?.metaTitle || `${product.name} in Nepal`,
    description: cleanDescription.slice(0, 160),
    path: `/products/${product.slug}`,
    keywords: product.seoMeta?.metaKeywords
      ? product.seoMeta.metaKeywords.split(",").map((item) => item.trim()).filter(Boolean)
      : [
          product.name,
          product.brandName,
          product.category?.categoryName,
          `${product.name} in Nepal`,
          `Buy ${product.name} online Nepal`,
        ].filter(Boolean) as string[],
    image: product.images?.[0],
  });
}


export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (slug === "__placeholder__") {
    notFound();
  }

  const res = await fetchPublicProductBySlug(slug);
  const product = res.data;


  // If product not found, fallback (you can also handle 404 here)
  if (!product) return <p>Product not found</p>;

  // Build JSON-LD schema
  const productSchema = buildProductSchema(product);

  return (
    <>
      <Script
        id={`product-schema-${product.slug}`}
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
        }}
      />

      <ListSingleProduct slug={slug} initialProduct={product} />
    </>
  );
}
