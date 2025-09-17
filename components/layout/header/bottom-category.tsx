"use client";
import React from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { navitems } from "@/constants";
import { usePathname } from "next/navigation";

const BottomCategory = () => {
  const pathname = usePathname();
  return (
    <div className="bg-primary p-4 text-white">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-6">
        <div className="flex  items-center font-medium gap-10">
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

        <div className="flex gap-4 items-center">
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
      </div>
    </div>
  );
};

export default BottomCategory;
