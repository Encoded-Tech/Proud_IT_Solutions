import { APP_DESCRIPTION, APP_NAME, SERVER_PRODUCTION_URL } from "@/config/env";
import type { Metadata } from "next";

const defaultOgImage = `${SERVER_PRODUCTION_URL}/images/og-image.jpg`;
const defaultTwitterImage = `${SERVER_PRODUCTION_URL}/images/twitter-image.jpg`;

type MetadataInput = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  image?: string;
  images?: string[];
  index?: boolean;
};

export function buildMetadata({
  title,
  description,
  path = "",
  keywords,
  image,
  images,
  index = true,
}: MetadataInput): Metadata {
  const canonicalUrl = `${SERVER_PRODUCTION_URL}${path}`;
  const socialImages = (images && images.length > 0 ? images : [image || defaultOgImage]).filter(
    Boolean
  );

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      siteName: APP_NAME,
      title,
      description,
      url: canonicalUrl,
      images: socialImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: socialImages.length > 0 ? socialImages : [defaultTwitterImage],
    },
    robots: {
      index,
      follow: index,
      googleBot: {
        index,
        follow: index,
      },
    },
  };
}

export function buildNoIndexMetadata({
  title,
  description = APP_DESCRIPTION,
  path = "",
}: {
  title: string;
  description?: string;
  path?: string;
}): Metadata {
  return buildMetadata({
    title,
    description,
    path,
    index: false,
  });
}
