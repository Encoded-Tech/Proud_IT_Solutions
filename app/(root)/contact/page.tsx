  import React from "react";
  import ContactForm from "./contact-form";
  import ContactDetails from "./contact-details";

import { APP_NAME } from "@/config/env";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: `Contact Us | ${APP_NAME}`,
  description: `Get in touch with ${APP_NAME}. Fill out our contact form or reach us through email or phone.`,
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: `Contact Us | ${APP_NAME}`,
    description: `Get in touch with ${APP_NAME}. Fill out our contact form or reach us through email or phone.`,
    images: [],
  },
  twitter: {
    card: "summary_large_image",
    title: `Contact Us | ${APP_NAME}`,
    description: `Get in touch with ${APP_NAME}. Fill out our contact form or reach us through email or phone.`,
    images: [],
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
