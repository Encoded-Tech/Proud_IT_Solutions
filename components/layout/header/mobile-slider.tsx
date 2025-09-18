"use client";
import { Icon } from "@iconify/react/dist/iconify.js";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";

const MobileSlider = ({
  setIsOpen,
}: {
  setIsOpen: React.Dispatch<boolean>;
}) => {
  const currentRoute = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [currentRoute]);

  return (
    <div className="">
      <div className="flex justify-between items-center">
        <Link href="/">
          <Image
            src="/logo/mainlogo.png"
            alt="logo"
            width={1000}
            height={1000}
            className="object-contain w-12"
          />
        </Link>

        <div onClick={() => setIsOpen(false)} className=" text-zinc-500">
          <Icon icon="fluent-mdl2:cancel" width="20" height="20" />
        </div>
      </div>

      <div className="py-2 mt-4">
        {navitems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={`${
              currentRoute === item.href ? "text-primary" : "text-zinc-500"
            }   font-medium text-sm border-b border-zinc-200 py-4 block hover:text-blue-600`}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileSlider;

export const navitems = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Shop",
    href: "/shop",
  },
  {
    name: "About",
    href: "/about",
  },
  {
    name: "Blogs",
    href: "/blogs",
  },
  {
    name: "Contact",
    href: "/contact",
  },
];
