"use client";
import React, { useState } from "react";
import Image from "next/image";
import BottomCategory from "./bottom-category";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import MobileSlider from "./mobile-slider";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white relative">
<<<<<<< HEAD
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

=======
      <nav className="max-w-7xl xl:mx-auto mx-4 py-2 flex justify-between  items-center">
        {/* hamburger icon */}
        <div onClick={() => setIsOpen(true)} className="lg:hidden block">
          <Icon icon="ci:hamburger-md" width="24" height="24" />
        </div>

        {isOpen && (
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[6] xl:hidden"
          />
        )}
        <Link href="/">
          <Image
            src="/logo/mainlogo.png"
            alt="logo"
            width={1000}
            height={1000}
            className="object-contain lg:w-20 w-14"
          />
        </Link>
>>>>>>> feature-merged

        {/* search input field */}
        <form className="lg:flex hidden relative lg:p-1  border border-zinc-200 bg-white  rounded-full  text-base lg:text-sm lg:w-[700px] w-full  focus:border-blue-500 outline-none z-[5]">
          <input
            className="flex-1 pl-4 outline-none"
            type="text"
            placeholder="Search"
            required
          />
          <button
            type="submit"
            className=" p-2 text-white rounded-full bg-primary cursor-pointer"
          >
            <Icon
              icon="ri:search-line"
              width="24"
              height="24"
              className="hover:scale-125 ease-in-out duration-300"
            />
          </button>
        </form>

        <div className="lg:flex hidden items-center xl:gap-8 gap-4">
          {info.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span>{item.icon}</span>
              <div className="flex flex-col">
                <span className="font-medium whitespace-nowrap xl:text-base text-sm text-zinc-800">
                  {item.title}
                </span>
                <span className="text-sm whitespace-nowrap  text-zinc-500">
                  {" "}
                  {item.desc}
                </span>
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/login"
          className="lg:hidden block bg-white p-2 rounded-full text-black "
        >
          <Icon icon="et:profile-male" width="22" height="22" />{" "}
        </Link>
      </nav>

      <div className="sticky h-fit top-20">
        <BottomCategory />
      </div>

      {/* slider navbar on mobile */}
      <div
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:hidden bg-white z-[11] h-screen  overflow-y-scroll w-52 p-2 fixed top-0 left-0 ease-in-out duration-500`}
      >
        <div className="flex-1 overflow-y-scroll ">
          <MobileSlider setIsOpen={setIsOpen} />
        </div>
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
