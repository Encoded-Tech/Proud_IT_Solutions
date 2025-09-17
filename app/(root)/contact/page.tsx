import React from "react";
import ContactForm from "./contact-form";
import ContactDetails from "./contact-details";

const Contact = () => {
  return (
    <main className="max-w-7xl xl:mx-auto mx-4 my-10">
      <ContactForm />
      <ContactDetails />
    </main>
  );
};

export default Contact;
