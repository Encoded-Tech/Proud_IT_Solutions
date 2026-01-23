
import { APP_NAME } from "@/constants";
import { Heart, Users, Leaf } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: `About | ${APP_NAME}`, // Custom title for About page
  description:
    "Learn about Proud Nepal, our mission, vision, and commitment to delivering authentic electronics and innovative technology solutions in Nepal.",
  openGraph: {
    title: `About | ${APP_NAME}`,
    description:
      "Learn about Proud Nepal, our mission, vision, and commitment to delivering authentic electronics and innovative technology solutions in Nepal.",
    type: "website",
    siteName: APP_NAME,
    images: [
      {
        url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1074",
        width: 1200,
        height: 630,
        alt: "About Proud Nepal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `About | ${APP_NAME}`,
    description:
      "Learn about Proud Nepal, our mission, vision, and commitment to delivering authentic electronics and innovative technology solutions in Nepal.",
    images: [
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1074",
    ],
  },
};

export default function Component() {
  return (
    <div className="flex flex-col min-h-screen my-10 ">
      <main className="flex-1 space-y-16">
        {/* Hero Section */}
        <section className="w-full  ">
          <div className="max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-8">
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                Our Story
              </h1>
              <div className="text-gray-600 prose prose-lg max-w-none leading-relaxed">
                <p>
                  At Proud Nepal, technology is more than just gadgets—it’s
                  about empowering people. Since our beginning, we’ve been
                  dedicated to bringing high-quality electronics that make life
                  easier, smarter, and more connected.
                </p>
                <p>
                  From powerful laptops to everyday home appliances, each
                  product is carefully selected to deliver performance,
                  reliability, and value for our customers.
                </p>
                <p>
                  We are committed to authenticity, durability, and providing
                  the latest innovations—because technology should improve
                  lives, not complicate them.
                </p>
                <p>
                  Our mission is simple: to provide trusted electronics that
                  help every household, student, and business in Nepal move
                  forward with confidence.
                </p>
              </div>
            </div>
            <div>
              <Image
                src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1074"
                alt="Modern electronics"
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
                sustainable—helping every Nepali family and business thrive.
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
                { value: "8+", label: "Years of Excellence" },
                { value: "20+", label: "Districts Reached" },
                { value: "100%", label: "Genuine Products" },
              ].map(({ value, label }, i) => (
                <div
                  key={i}
                  className="p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow"
                >
                  <div>{value}</div>
                  <p className="text-sm text-gray-600 font-medium mt-2">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Founder Section */}
        <section className="w-full  bg-white">
          <div className="max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Image
                src="https://images.unsplash.com/photo-1549924231-f129b911e442?q=80&w=1170"
                alt="Founder of Proud Nepal"
                width={600}
                height={600}
                className="rounded-2xl object-cover aspect-square shadow-lg hover:shadow-xl transition-shadow"
              />
            </div>
            <div className="space-y-8">
              <span className="bg-primarymain text-white text-sm px-5 py-2 rounded-full inline-block font-medium">
                Our Founder
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                A Vision for Smarter Nepal
              </h2>
              <div className="text-gray-600 prose prose-lg max-w-none leading-relaxed">
                <p>
                  Proud Nepal was founded with the belief that quality
                  electronics should be accessible to everyone.
                </p>
                <p>
                  What started as a small initiative quickly grew into a trusted
                  electronics brand serving thousands of households, students,
                  and businesses.
                </p>
                <p>
                  Today, we continue our founder&apos;s vision—providing authentic,
                  affordable, and future-ready electronics that uplift Nepal&apos;s
                  digital journey.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
