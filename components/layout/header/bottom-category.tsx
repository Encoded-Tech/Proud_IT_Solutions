"use client";
import React from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { navitems } from "@/constants";
import { usePathname } from "next/navigation";

const BottomCategory = () => {
  const pathname = usePathname();
  return (
    <div className="lg:bg-primary bg-blue-100 lg:p-4 p-2 text-white">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-6">
        <div className="lg:flex hidden  items-center font-medium gap-10">
          {navitems.map((item, index) => (
            <nav key={index}>
              <Link
                href={item.href}
                className={`${
                  pathname === item.href ? "navbarhover active" : "navbarhover"
                }`}
              >
                {item.name}
              </Link>
            </nav>
          ))}
        </div>

        <div className="lg:flex hidden gap-4 items-center">
          <Link href="/login" className="bg-white p-2 rounded-full text-black ">
            <Icon icon="et:profile-male" width="22" height="22" />{" "}
          </Link>

          <Link
            href="/wishlist"
            className="relative bg-white p-2 rounded-full text-black"
          >
            <Icon icon="mdi-light:heart" width="22" height="22" />{" "}
            <span className="absolute -right-4 -top-2 bg-white h-6 w-6 flex justify-center items-center aspect-auto rounded-full text-sm">
              0
            </span>
          </Link>
          <Link
            href="/cart"
            className="relative bg-white p-2 rounded-full text-black"
          >
            <Icon icon="ion:cart-outline" width="22" height="22" />{" "}
            <span className="absolute -right-4 -top-2 bg-white h-6 w-6 flex justify-center items-center aspect-auto rounded-full text-sm">
              0
            </span>
          </Link>

          <div>
            <h2 className="font-medium">Rs 0.00</h2>
          </div>
        </div>

        <form className="lg:hidden flex relative p-1  border border-zinc-200 bg-white text-black  rounded-full  text-base lg:text-sm lg:w-[700px] w-full  focus:border-blue-500 outline-none z-[5]">
          <input
            className="flex-1 pl-4 outline-none"
            type="text"
            placeholder="Search"
            required
          />

          <button
            type="submit"
            className=" p-1 text-white rounded-full bg-primary cursor-pointer"
          >
            <Icon
              icon="ri:search-line"
              width="20"
              height="20"
              className="hover:scale-125 ease-in-out duration-300"
            />
          </button>
        </form>
      </div>
    </div>
  );
};

export default BottomCategory;
