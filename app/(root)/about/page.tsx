

import { Heart, Users, Leaf } from "lucide-react";


import Image from "next/image";

import { Metadata } from "next";
import { APP_NAME, SERVER_PRODUCTION_URL } from "@/config/env";
import Script from "next/script";
import AnimatedCounter from "@/components/shared/AnimatedCounter";

export const metadata: Metadata = {
  title: `Trusted Computer Store in Nepal | ${APP_NAME}`,
  description:
    "Learn about Proud Nepal, a trusted electronics store in Nepal. Discover our mission, vision, and commitment to delivering genuine laptops, PCs, and electronic accessories across Nepal.",

keywords: [
  "about Proud Nepal",
  "Proud Nepal company profile",
  "Proud Nepal electronics Nepal",
  "electronics company Nepal",
  "Nepal-based electronics company",
  "electronics business Nepal",
  "trusted Nepali electronics company",
  "electronics brand Nepal history",
  "electronics company mission Nepal",
  "electronics company vision Nepal",
  "customer-focused electronics Nepal",
  "Nepali technology company",
  "electronics leadership Nepal",
  "electronics expertise Nepal",
  "electronics company values Nepal",
  "electronics service excellence Nepal",
  "locally trusted electronics Nepal",
  "Nepal electronics industry",
  "electronics company journey Nepal",
  "who we are Proud Nepal",
],

  alternates: {
    canonical: `${SERVER_PRODUCTION_URL}/about`,
  },

  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: `Trusted Computer Store in Nepal  | Electronics Store in Nepal`,
    description:
      "Know the story behind Proud Nepal—your trusted destination for laptops, custom PCs, and electronic accessories in Nepal.",
    url: `${SERVER_PRODUCTION_URL}/about`,
    images: [],
  },

  twitter: {
    card: "summary_large_image",
    title: `Trusted Computer Store in Nepal   | Computer Store in Nepal`,
    description:
      "Discover Proud Nepal’s journey, mission, and commitment to genuine electronics, laptops, and PCs in Nepal.",
    images: [],
  },
};


export default function Component() {
  return (
    <>
      <head>
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Proud Nepal",
              url: SERVER_PRODUCTION_URL,
              description:
                "Proud Nepal is a trusted electronics store in Nepal offering genuine laptops, custom PCs, printers, monitors, and accessories.",
              sameAs: [],
            }),
          }}
        />

      </head>
      <div className="flex flex-col min-h-screen my-10 ">
        <main className="flex-1 space-y-16">
          <div className="sr-only">
            <h1>About Proud Nepal – Trusted Electronics Store in Nepal</h1>

            <p>
              Proud Nepal is a trusted electronics store in Nepal offering genuine laptops,
              custom-built PCs, printers, monitors, and computer accessories for students,
              professionals, gamers, and businesses across the country.
            </p>

            <p>
              Based in Nepal, Proud Nepal focuses on authentic products, transparent pricing,
              reliable warranties, and customer-first service. We help customers choose the
              right technology solutions with confidence.
            </p>

            <p>
              Whether you are searching for the best laptop store in Nepal, a reliable PC
              builder, or quality electronic accessories, Proud Nepal is committed to
              delivering value, trust, and long-term support.
            </p>
          </div>


          {/* Hero Section */}
          <section className="w-full">
            <div className="max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto grid gap-12 lg:grid-cols-2 items-center">
              <div className="space-y-8">
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                  Our Story
                </h1>

                <div className="text-gray-600 prose prose-lg max-w-none leading-relaxed">
                  <p>
                    Proud Nepal is a trusted electronics store in Nepal built with one
                    clear goal to make genuine technology accessible to everyone.
                    From students and professionals to gamers and businesses, we help
                    people find the right laptops, PCs, and electronic accessories with
                    confidence.
                  </p>

                  <p>
                    What started as a passion for quality electronics has grown into a
                    reliable destination for laptops, custom-built PCs, printers,
                    monitors, and computer accessories in Nepal. Every product we offer
                    is carefully selected to meet performance, durability, and value
                    standards.
                  </p>

                  <p>
                    We believe buying electronics should be simple and transparent.
                    That’s why Proud Nepal focuses on authentic products, honest pricing,
                    and dependable after-sales suppor h  helping customers avoid
                    counterfeit or low-quality devices.
                  </p>

                  <p>
                    Today, Proud Nepal proudly serves customers across Nepal, empowering
                    homes, offices, and institutions with technology that supports
                    productivity, creativity, and growth.
                  </p>
                </div>
              </div>

              <div>
                <Image
                  src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1074"
                  alt="Proud Nepal electronics store team delivering genuine laptops and PCs in Nepal"
                  width={600}
                  height={600}
                  className="rounded-2xl object-cover aspect-square shadow-lg hover:shadow-xl transition-shadow"
                />
              </div>
            </div>
          </section>

          {/* Mission Section */}
          <section className="w-full  bg-white">
            <div className="max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto space-y-16">
              <div className="text-center space-y-6">
                <span className="bg-primarymain text-white text-sm px-5 py-2 rounded-full inline-block font-medium">
                  Our Mission
                </span>
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                  Powering Nepal with Innovation
                </h2>
                <p className="max-w-3xl mx-auto text-gray-600 text-lg leading-relaxed">
                  We believe in making technology accessible, reliable, and
                  sustainable h elping every Nepali family and business thrive.
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <Image
                    src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1170"
                    alt="Electronics display"
                    width={600}
                    height={400}
                    className="rounded-2xl object-cover aspect-video shadow-lg hover:shadow-xl transition-shadow"
                  />
                </div>
                <div className="space-y-8">
                  {[
                    {
                      icon: <Heart className="w-8 h-8 text-pink-500" />,
                      title: "Trusted Products",
                      desc: "We ensure all our electronics are genuine, durable, and performance-tested.",
                    },
                    {
                      icon: <Leaf className="w-8 h-8 text-pink-500" />,
                      title: "Sustainable Technology",
                      desc: "We promote energy-efficient devices and eco-friendly practices in our supply chain.",
                    },
                    {
                      icon: <Users className="w-8 h-8 text-pink-500" />,
                      title: "Customer First",
                      desc: "Our focus is on affordability, after-sales support, and building long-term trust.",
                    },
                  ].map(({ icon, title, desc }, i) => (
                    <div
                      key={i}
                      className="flex gap-4 items-start hover:bg-gray-100 p-4 rounded-lg transition-colors"
                    >
                      <div>{icon}</div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {title}
                        </h3>
                        <p className="text-gray-600">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Impact Section */}
          <section className="w-full py-8 bg-primary/70">
            <div className="max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto space-y-12 text-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
                  Our Impact
                </h2>
                <p className="max-w-3xl mx-auto text-gray-200 text-lg leading-relaxed">
                  Celebrating milestones that show our dedication to technology,
                  trust, and innovation in Nepal.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-pink-500 font-bold text-4xl">
                {[
                  { value: "50K+", label: "Happy Customers" },
                  { value: "15+", label: "Years of Excellence" },
                  { value: "20+", label: "Districts Reached" },
                  { value: "100%", label: "Genuine Products" },
                ].map(({ label }, i) => (
                  <div
                    key={i}
                    className="p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="text-pink-500 font-bold text-4xl">
                      {label === "Happy Customers" && <AnimatedCounter value={50000} suffix="+" />}
                      {label === "Years of Excellence" && <AnimatedCounter value={15} suffix="+" />}
                      {label === "Districts Reached" && <AnimatedCounter value={20} suffix="+" />}
                      {label === "Genuine Products" && <AnimatedCounter value={100} suffix="%" />}
                    </div>

                    <p className="text-sm text-gray-600 font-medium mt-2">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Founder Section */}
          <section className="w-full bg-white">
            <div className="max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Image
                  src="https://images.unsplash.com/photo-1549924231-f129b911e442?q=80&w=1170"
                  alt="Founder of Proud Nepal, a trusted electronics store in Nepal"
                  width={600}
                  height={600}
                  className="rounded-2xl object-cover aspect-square shadow-lg hover:shadow-xl transition-shadow"
                />
              </div>

              <div className="space-y-8">


                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                  A Vision for Smarter Nepal
                </h2>

                <div className="text-gray-600 prose prose-lg max-w-none leading-relaxed">
                  <p>
                    Proud Nepal was founded with a simple yet powerful belief people in
                    Nepal deserve access to genuine, high-quality electronics without
                    confusion or compromise.
                  </p>

                  <p>
                    Our founder envisioned an electronics store in Nepal where customers
                    could confidently purchase laptops, custom PCs, monitors, printers,
                    and accessories backed by trust, transparency, and expert guidance.
                  </p>

                  <p>
                    Today, that vision continues to guide Proud Nepal as we serve
                    individuals, students, professionals, and businesses across Nepal
                    with authentic, affordable, and future-ready technology solutions.
                  </p>
                </div>
              </div>
            </div>
          </section>

        </main>
      </div>
    </>
  );
}
