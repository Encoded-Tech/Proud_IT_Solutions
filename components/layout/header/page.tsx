"use client";
import React from "react";
import Image from "next/image";
import BottomCategory from "./bottom-category";
import { Icon } from "@iconify/react/dist/iconify.js";
import Sidebar from "./sidebar";

const Header = () => {
  const [openSidebar, setOpenSidebar] = React.useState(false);
  return (
    <div className="bg-white relative">
      <nav className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span
            onClick={() => setOpenSidebar(!openSidebar)}
            className="bg-primary md:hidden ease-in-out duration-300 hover:scale-110 hover:bg-primary/90  text-white p-3 rounded-full cursor-pointer"
          >
            <Icon icon="pajamas:hamburger" width="20" height="20" />
          </span>
          <Image src="/logo/logomain.png" alt="logo" width={1000} height={1000} className="object-fit w-25" />
        </div>
        <div className="relative w-[650px]">
        <input
          className="border border-zinc-400 rounded-full p-3 pr-12 text-sm w-full focus:border-blue-500 outline-none"
          type="text"
          placeholder="Search for products..."
        />
        <span
          className="bg-red-600 absolute right-2 top-1/2 -translate-y-1/2 ease-in-out duration-300 hover:scale-110 hover:bg-red-700 text-white p-2 rounded-full cursor-pointer"
        >
          <Icon icon="mdi:magnify" width="20" height="20" />
        </span>
      </div>


        <div className="flex items-center gap-8">
          {info.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span>{item.icon}</span>
              <div className="flex flex-col">
                <span className="font-medium text-lg text-zinc-800">
                  {item.title}
                </span>
                <span className="text-sm font-medium text-zinc-500">
                  {" "}
                  {item.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div
        className={`${
          openSidebar ? "translate-x-0" : "-translate-x-full"
        } ease-in-out duration-500 h-screen w-80  fixed top-0 bg-white z-[4] p-4 left-0  `}
      >
        <Sidebar />
      </div>

      {openSidebar && (
        <div
          onClick={() => setOpenSidebar(false)}
          className="fixed inset-0 z-[2] bg-black/50 bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-40 h-full w-full"
        />
      )}

      <div className="sticky h-fit top-20">
        <BottomCategory />
      </div>
    </div>
  );
};

export default Header;

const info = [
  {
    title: "Customer Support",
    desc: "+977 9898989898",
    icon: (
      <Icon
        icon="streamline-plump:customer-support-3-remix"
        width="30"
        height="30"
      />
    ),
  },
  {
    title: "Delivery",
    desc: "All Over Nepal",
    icon: <Icon icon="mdi:truck-delivery" width="30" height="30" />,
  },
];
