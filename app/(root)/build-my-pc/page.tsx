

import BuildClient from "@/components/client/BuildClient";
import { APP_NAME } from "@/config/env";

import { fetchPartOptions } from "@/lib/server/actions/admin/BuildMyPc/partsAction";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `Build Custom PC in Nepal | Gaming & Office PC Builder | ${APP_NAME}`,
  description:
    `Build your custom PC in Nepal with ${APP_NAME}. Choose CPUs, GPUs, RAM, storage, and more to create the perfect gaming PC, office PC, or workstation at the best price.`,

    keywords: [
      "best custom PC builder Nepal",
      "build custom PC in affordable price in Nepal",
      "build PC in Nepal",
      "best gaming PC in Nepal",
      "best workstation customization in Nepal",
      "best office PC customizationin Nepal",
      "budget PC in Nepal",
      "custom PC in Nepal",
      "PC builder in Nepal",
      "PC in Nepal",
      "gaming PC builder in Nepal",
      "workstation builder in Nepal",
      "office PC builder in Nepal",
      "budget PC builder in Nepal",
    ],
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: `Build Custom PC in Nepal | ${APP_NAME}`,
    description:
      `Customize and build your own PC in Nepal. Compare components, prices, and performance to create your ideal gaming or office PC.`,
  },
  twitter: {
    card: "summary_large_image",
    title: `Build Custom PC in Nepal | ${APP_NAME}`,
    description:
      `Build gaming PCs, office PCs, and workstations in Nepal using our custom PC builder.`,
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

      <section
  className="sr-only"
>
  <h2>
    Build Your Custom PC in Nepal with Confidence
  </h2>

  <div >
    <p>
      At <strong>{APP_NAME}</strong>, we make it easy to build a custom PC in
      Nepal using genuine, high-quality computer components. Whether you are
      building a gaming PC, workstation, office computer, or budget-friendly
      setup, our PC builder helps you choose the right parts with confidence.
    </p>

    <p>
      Select from trusted brands of <strong>CPU, GPU, motherboard, RAM,
      storage, power supply, cabinet, and cooling solutions</strong>. Compare
      prices, check compatibility, and create a future-ready PC tailored to
      your needs — all in one place.
    </p>

    <p>
      Proud Nepal is a trusted online electronics store in Nepal, offering
      authentic computer parts, transparent pricing, and reliable customer
      support. Our Build Your PC tool is designed for gamers, students,
      professionals, and businesses looking for the best custom PC solutions
      in Nepal.
    </p>
  </div>
</section>

      <BuildClient parts={parts} />
    </main>
  );
}

