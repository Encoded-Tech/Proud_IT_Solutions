import type { Metadata } from "next";
import "./globals.css";
import { Jost } from "next/font/google";
import { APP_DESCRIPTION, APP_NAME, SERVER_URL } from "@/constants";

const jost = Jost({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Himalayan Garment",
    default: APP_NAME,
  },
  description: APP_DESCRIPTION,
  metadataBase: new URL(SERVER_URL),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jost.variable}>
      <body className={jost.variable}>{children}</body>
    </html>
  );
}
