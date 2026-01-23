import Footer from "@/components/layout/footer/page";
import Header from "@/components/layout/header/page";
import LaunchNotice from "@/components/layout/launchNotice";
import { APP_DESCRIPTION, APP_NAME, SERVER_PRODUCTION_URL } from "@/config/env";
import { RootLayoutProps } from "@/types/layout";
import { Metadata } from "next";
import { buildWebsiteSchema } from "../seo/builders/website";
import { buildOrganizationSchema } from "../seo/builders/organization";
import Script from "next/script";

export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_NAME}`,
    default: APP_NAME,
  },
  description: APP_DESCRIPTION,
  metadataBase: new URL(SERVER_PRODUCTION_URL),
  openGraph: {
    type: 'website',
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [
      {
        url: `${SERVER_PRODUCTION_URL}/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: `${APP_NAME} - ${APP_DESCRIPTION}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [`${SERVER_PRODUCTION_URL}/images/twitter-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: SERVER_PRODUCTION_URL,
  },
};

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        {/* Website Schema */}
        <Script
          id="website-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildWebsiteSchema()) }}
        />
        {/* Organization Schema */}
        <Script
          id="organization-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildOrganizationSchema()) }}
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <LaunchNotice />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
