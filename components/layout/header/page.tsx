"use client";
import React from "react";
import Image from "next/image";
import BottomCategory from "./bottom-category";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";

const Header = () => {
  return (
    <div className="bg-white relative">
      <nav className="max-w-7xl xl:mx-auto mx-4 lg:py-3 py-2 flex justify-between  items-center">
        <div className="lg:hidden block">
          <Icon icon="ci:hamburger-md" width="24" height="24" />
        </div>
        <Link href="/">
          <Image
            src="/logo/mainlogo.png"
            alt="logo"
            width={1000}
            height={1000}
            className="object-contain lg:w-20 w-14"
          />
        </Link>

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

        <div className="lg:flex hidden items-center gap-8">
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
