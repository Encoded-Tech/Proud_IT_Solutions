"use client";
import React, { useState } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { navitems } from "@/constants";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { selectCartTotalAmount, selectCartTotalItems } from "@/redux/features/cart/cartSlice";
import { selectIsAuthenticated, selectUser } from "@/redux/features/auth/userSlice";
import { signOut } from "next-auth/react";
import { selectWishlistCount } from "@/redux/features/wishlist/wishListSlice";
import Image from "next/image";

const BottomCategory = () => {
  const pathname = usePathname();
  const totalItems = useAppSelector(selectCartTotalItems);
  const totalAmount = useAppSelector(selectCartTotalAmount);
  const totalWishlist = useAppSelector(selectWishlistCount);
  const isLoggedIn = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser); // make sure your user slice has user info including image

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="lg:bg-primary bg-blue-100 lg:p-4 p-2 text-white">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-6">
        {/* NAV ITEMS */}
        <div className="lg:flex hidden items-center font-medium gap-10">
          {navitems.map((item, index) => (
            <nav key={index}>
              <Link
                href={item.href}
                className={`${pathname === item.href ? "navbarhover active" : "navbarhover"}`}
              >
                {item.name}
              </Link>
            </nav>
          ))}
        </div>

        {/* RIGHT ICONS */}
        <div className="lg:flex hidden gap-4 items-center relative">
          {isLoggedIn ? (
            <div className="relative">
              {/* USER IMAGE */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="rounded-full overflow-hidden w-10 h-10 border-2 border-white"
              >
                <Image
                width={100}
                height={100}
                  src={user?.image || "/default-user.png"}
                  alt="User"
                  className="w-full h-full object-cover"
                />
              </button>

              {/* DROPDOWN */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded-md shadow-lg z-10">
                  <Link
                    href="/account"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Account
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="bg-white p-2 rounded-full text-black">
              <Icon icon="et:profile-male" width="22" height="22" />
            </Link>
          )}

          {/* WISHLIST */}
          <Link href="/wishlist" className="relative bg-white p-2 rounded-full text-black">
            <Icon icon="mdi-light:heart" width="22" height="22" />
            <span className="absolute -right-4 -top-2 bg-white h-6 w-6 flex justify-center items-center rounded-full text-sm">
              {totalWishlist}
            </span>
          </Link>

          {/* CART */}
          <Link href="/cart" className="relative bg-white p-2 rounded-full text-black">
            <Icon icon="ion:cart-outline" width="22" height="22" />
            <span className="absolute -right-4 -top-2 bg-white h-6 w-6 flex justify-center items-center rounded-full text-sm">
              {totalItems}
            </span>
          </Link>

          <div>
            <h2 className="font-medium">Rs {totalAmount.toFixed(2)}</h2>
          </div>
        </div>

        {/* MOBILE SEARCH */}
        <form className="lg:hidden flex relative p-1 border border-zinc-200 bg-white text-black rounded-full text-base w-full">
          <input
            className="flex-1 pl-4 outline-none"
            type="text"
            placeholder="Search"
            required
          />
          <button
            type="submit"
            className="p-1 text-white rounded-full bg-primary cursor-pointer"
          >
            <Icon icon="ri:search-line" width="20" height="20" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default BottomCategory;
