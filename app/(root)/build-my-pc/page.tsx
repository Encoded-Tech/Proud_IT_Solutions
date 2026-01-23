

import BuildClient from "@/components/client/BuildClient";
import { APP_NAME } from "@/config/env";

import { fetchPartOptions } from "@/lib/server/actions/admin/BuildMyPc/partsAction";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `Build Your PC | ${APP_NAME}`,
  description: `Customize and build your own PC with the best components. Select parts, compare prices, and create your perfect PC setup with ${APP_NAME}.`,
  openGraph: {
    title: `Build Your PC | ${APP_NAME}`,
    description: `Customize and build your own PC with the best components.`,
    type: "website",
    siteName: APP_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `Build Your PC | ${APP_NAME}`,
    description: `Customize and build your own PC with the best components.`,
    images: []
    
  },
};


export default async function BuildPage() {
  const result = await fetchPartOptions(true);

  if (!result.success) {
    return <div className="p-10 text-red-500">Failed to load parts</div>;
  }

  const parts = result.data.map((p) => ({
    _id: p._id!,
    name: p.name,
    brand: p.brand ?? "Unknown",
    price: p.price ?? 0,
    type: p.type,          
    image: p.imageUrl,
    specs: [],
  }));

  return (
    <main>
      <BuildClient parts={parts} />
    </main>
  );
}

