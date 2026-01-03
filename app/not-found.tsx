"use client";

import React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import Image from "next/image";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      {/* Illustration / Icon */}
      <div className="relative w-96 ">
        <Image
        width={1000}
        height={1000}
          src="/notfound.png" // Replace with your image or illustration
          alt="Not Found"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Button */}
      <Link
        href="/"
        className="flex items-center gap-2 bg-primary text-white px-4  py-2 rounded-lg text-sm md:text-base font-medium hover:bg-primary-dark transition"
      >
        <Icon icon="mdi:arrow-left" width="20" height="20" />
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;
