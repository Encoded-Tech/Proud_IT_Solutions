import React from "react";

const ContactForm = () => {
  return (
    <main className=" grid lg:grid-cols-2 grid-cols-1 gap-6 md:p-4 p-2 md:my-24 my-10">
      <div className="space-y-6 overflow-hidden">
        <h2 className="font-semibold capitalize md:text-2xl text-xl">Get in Touch</h2>
        <p className=" md:text-base text-sm text-zinc-500">
          We are an independently owned and officially authorized full-service
          tour operator based in Kathmandu, Nepal.
        </p>

        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.4764581012696!2d85.31973007535768!3d27.702571776185334!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb190068981201%3A0x57a04923de17fa78!2sProud%20Nepal%20IT%20Suppliers%20Pvt%20Ltd!5e0!3m2!1sen!2snp!4v1758092155921!5m2!1sen!2snp"
          loading="lazy"
          height="full"
          className="w-full h-full mx-auto rounded-lg shadow-md"
        ></iframe>
      </div>
      <div className="space-y-6 bg-zinc-50 rounded-lg md:p-6 p-2">
        <h2 className="font-semibold capitalize md:text-2xl text-xl">Fill up the form</h2>
        <p className=" md:text-base text-xs text-lighttext">
          Your email address will not be published.Required fields are marked
        </p>

        <form action="" className="!mt-10 space-y-4">
          <div className="flex w-full gap-4 items-center">
            <input
              placeholder="Joh Doe"
              className="md:p-3 p-2 rounded-lg border-zinc-200 bg-white outline-none md:text-sm text-xs  border w-full"
            />

            <input
              placeholder="john@gmail.com"
              className="md:p-3 p-2 rounded-lg border-zinc-200 bg-white outline-none md:text-sm text-xs  border w-full"
            />
          </div>
          <div className="flex w-full gap-4 items-center">
            <input
              placeholder="+977-9800000000"
              className="md:p-3 p-2 rounded-lg border-zinc-200 bg-white outline-none md:text-sm text-xs  border w-full"
            />

            <input
              placeholder="Subject matter"
              className="md:p-3 p-2 rounded-lg border-zinc-200 bg-white outline-none md:text-sm text-xs  border w-full"
            />
          </div>

          <textarea
            placeholder="Hello i want to state..."
            rows={10}
            className="md:p-3 p-2 rounded-lg border-zinc-200 bg-white outline-none md:text-sm text-xs  border w-full"
          />

          <button className="flex items-center gap-2 bg-primary rounded-md p-2 text-white text-sm font-medium ">
            Submit
          </button>
        </form>
      </div>
    </main>
  );
};

export default ContactForm;
