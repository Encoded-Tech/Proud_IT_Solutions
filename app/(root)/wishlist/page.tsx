import { Icon } from "@iconify/react/dist/iconify.js";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Wishlist = () => {
  return (
    <div className="max-w-7xl xl:mx-auto mx-4 my-10">
      <div className="flex flex-col justify-center items-center space-y-6">
        <Image
          src="/empty-cart.png"
          alt="Empty Cart"
          width={400}
          height={400}
        />
        <div className="flex flex-col items-center space-y-4">
          <h2 className="font-semibold text-xl">
            Ohh.. Your Wishlist is Empty
          </h2>

          <Link href={`/shop`}>
            <button className="flex items-center gap-2 bg-primary rounded-md p-2 text-white text-sm font-medium ">
              <Icon icon="bitcoin-icons:cart-outline" width="24" height="24" />
              Shop Now
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
