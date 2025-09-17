import React from "react";

const ContactForm = () => {
  return (
    <main className=" grid lg:grid-cols-2 grid-cols-1 gap-6 md:p-4 p-2 md:my-24 my-10">
      <div className="space-y-6 overflow-hidden">
        <h2 className="font-semibold capitalize text-2xl text-primary">Get in Touch</h2>
        <p className="font-medium md:text-base text-sm text-zinc-500">
          We are an independently owned and officially authorized full-service
          tour operator based in Kathmandu, Nepal.
        </p>

        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d28237.4372563045!2d85.26903907431641!3d27.78884310000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb1f001dcf200f%3A0xca48ca5d9313fbe4!2sMystic%20Nepal%20Adventure%20(p.).Ltd!5e0!3m2!1sen!2snp!4v1741168743483!5m2!1sen!2snp"
          loading="lazy"
          height="full"
          className="w-full h-full mx-auto rounded-lg shadow-md"
        ></iframe>
      </div>
      <div className="space-y-6 bg-zinc-50 rounded-lg md:p-6 p-2">
        <h2 className="font-semibold capitalize text-2xl text-primary">Fill up the form</h2>
        <p className="font-medium md:text-base text-xs text-lighttext">
          Your email address will not be published.Required fields are marked
        </p>

        <form action="" className="!mt-10 space-y-4">
          <div className="flex w-full gap-4 items-center">
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="fullName" className="text-sm font-medium">
                Full Name
              </label>
              <input
                placeholder="Joh Doe"
                className="md:p-3 p-2 rounded-lg border-zinc-200 bg-white outline-none md:text-sm text-xs  border w-full"
              />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="fullName" className="text-sm font-medium">
                Email
              </label>
              <input
                placeholder="john@gmail.com"
                className="md:p-3 p-2 rounded-lg border-zinc-200 bg-white outline-none md:text-sm text-xs  border w-full"
              />
            </div>
          </div>
          <div className="flex w-full gap-4 items-center">
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="fullName" className="text-sm font-medium">
                Contact
              </label>
              <input
                placeholder="+977-9800000000"
                className="md:p-3 p-2 rounded-lg border-zinc-200 bg-white outline-none md:text-sm text-xs  border w-full"
              />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="fullName" className="text-sm font-medium">
                Subject
              </label>
              <input
                placeholder="Subject matter"
                className="md:p-3 p-2 rounded-lg border-zinc-200 bg-white outline-none md:text-sm text-xs  border w-full"
              />
            </div>
          </div>

          <div>
            <label htmlFor="fullName" className="text-sm font-medium">
              Message
            </label>
            <textarea
              placeholder="Hello i want to state..."
              rows={10}
              className="md:p-3 p-2 rounded-lg border-zinc-200 bg-white outline-none md:text-sm text-xs  border w-full"
            />
          </div>
        </form>
      </div>
    </main>
  );
};

export default ContactForm;
