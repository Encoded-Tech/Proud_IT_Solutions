  import React from "react";
  import ContactForm from "./contact-form";
  import ContactDetails from "./contact-details";

import { Metadata } from "next";
import { APP_NAME } from "@/config/env";

export const metadata: Metadata = {
  title: `Contact Proud Nepal | Buy Genuine Electronics & Tech in Nepal | ${APP_NAME}`,
  description:
    "Contact Proud Nepal for genuine electronics, laptops, mobiles, accessories, and tech solutions in Nepal. Reach us for product inquiries, support, bulk orders, or partnerships.",
  keywords: [
    "Proud Nepal contact",
    "electronics store Nepal contact",
    "buy electronics Nepal",
    "genuine electronics Nepal",
    "laptop store Nepal",
    "mobile store Nepal",
    "tech accessories Nepal",
    "online electronics shop Nepal",
    "Proud Nepal support",
    "electronics customer service Nepal",
  ],
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: `Contact Proud Nepal | Trusted Electronics Store in Nepal | ${APP_NAME}`,
    description:
      "Get in touch with Proud Nepal — Nepal’s trusted destination for authentic electronics and technology products. Contact us for support, orders, and business inquiries.",
    url: "https://proudnepal.com.np/contact",
    images: [
      {
        url: "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1200",
        width: 1200,
        height: 630,
        alt: "Contact Proud Nepal - Electronics Store in Nepal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Contact Proud Nepal | Electronics & Technology in Nepal | ${APP_NAME}`,
    description:
      "Have questions or need support? Contact Proud Nepal for genuine electronics, expert guidance, and reliable tech solutions across Nepal.",
    images: [
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1200",
    ],
  },
};

  
  const Contact = () => {
    return (
      <main className="max-w-7xl xl:mx-auto mx-4 my-10">
        <ContactForm />
        <ContactDetails />
      </main>
    );
  };

  export default Contact;
