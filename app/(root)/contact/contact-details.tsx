import { Icon } from "@iconify/react/dist/iconify.js";
import React from "react";

const ContactDetails = () => {
  return (
    <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 md:gap-8 gap-4 md:my-20 my-10">
      {contactdata.map((item, index) => (
        <div
          key={index}
          className="flex flex-col items-center p-6 border rounded-md bg-zinc-50 border-primary-600 border-dashed"
        >
          <span className="lg:text-4xl text-2xl text-primary-600">
            {item.icon}
          </span>
          <div className="text-center mt-4">
            <h1 className="font-semibold lg:text-xl text-lg   mb-2 text-primary">
              {item.title}
            </h1>
            <p className="font-medium text-sm">{item.desc}</p>
            <p className="font-medium text-sm">{item.desc2}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactDetails;

const contactdata = [
  {
    title: "Address Line",
    desc: "Kathmandu , Nepal",
    icon: <Icon icon="mdi:address-marker-outline" />,
  },
  {
    title: "Contact Number",
    desc: "+977-1-5913427",
    desc2: "985-1073427",
    icon: <Icon icon="fluent:call-24-regular" />,
  },
  {
    title: "Mailing Address",
    desc: "info@proudnepal.com",
    desc2: " proudnepal@hotmail.com",
    icon: <Icon icon="famicons:mail-outline" />,
  },
];
