'use client';

import React, { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { navitems } from "@/constants";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import {
  selectCartTotalAmount,
  selectCartTotalItems,
} from "@/redux/features/cart/cartSlice";
import {
  selectIsAuthenticated,
  selectUser,
} from "@/redux/features/auth/userSlice";
import { signOut } from "next-auth/react";
import { selectWishlistCount } from "@/redux/features/wishlist/wishListSlice";
import Image from "next/image";
import { createPortal } from "react-dom";

const BottomCategory = () => {
  const pathname = usePathname();

  const totalItems = useAppSelector(selectCartTotalItems);
  const totalAmount = useAppSelector(selectCartTotalAmount);
  const totalWishlist = useAppSelector(selectWishlistCount);

  const isLoggedIn = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);

  const isAdmin = isLoggedIn && user?.role === "admin";

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Logout
  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  // Close dropdown when clicking outside button + dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownOpen &&
        buttonRef.current &&
        dropdownRef.current &&
        !buttonRef.current.contains(e.target as Node) &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Update dropdown position
  useEffect(() => {
    if (dropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({ 
        top: rect.bottom + window.scrollY + 4, 
        left: rect.left + window.scrollX - 200 + rect.width // move left
      });
    }
  }, [dropdownOpen]);

  return (
    <div className="lg:bg-primary bg-blue-100 lg:p-4 p-2 text-white relative z-[50]">
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
          
          {/* LOGIN */}
          {!isLoggedIn && (
            <Link href="/login" className="bg-white p-2 rounded-full text-black">
              <Icon icon="et:profile-male" width="22" height="22" />
            </Link>
          )}

          {/* ADMIN DASHBOARD */}
          {isLoggedIn && isAdmin && (
            <>
              <Link
                href="/admin"
                className="rounded-full w-10 h-10 border-2 border-white bg-white text-black flex items-center justify-center"
                title="Admin Dashboard"
              >
                <Icon icon="mdi:view-dashboard" width="22" height="22" />
              </Link>

              <button
                onClick={handleLogout}
                className="bg-white p-2 rounded-full text-black"
                title="Logout"
              >
                <Icon icon="mdi:logout" width="22" height="22" />
              </button>
            </>
          )}

          {/* USER DROPDOWN */}
          {isLoggedIn && !isAdmin && (
            <>
              <button
                ref={buttonRef}
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="rounded-full overflow-hidden w-10 h-10 border-2 border-white relative z-[51]"
              >
                <Image
                  width={100}
                  height={100}
                  src={user?.image || "/default-user.png"}
                  alt="User"
                  className="w-full h-full object-cover"
                />
              </button>

              {dropdownOpen &&
                createPortal(
                  <div
                    ref={dropdownRef}
                    className="absolute w-56 bg-white text-black rounded-xl shadow-xl z-[9999] overflow-hidden"
                    style={{ top: dropdownPos.top, left: dropdownPos.left }}
                  >
                    {/* USER INFO */}
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-semibold truncate">{user?.name || "User"}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>

                    {/* LINKS */}
                    <div className="py-2">
                      <Link
                        href="/account"
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Icon icon="mdi:account-outline" width="18" />
                        Account
                      </Link>

                      <Link
                        href="/account/security"
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Icon icon="mdi:cog-outline" width="18" />
                        Security
                      </Link>
                    </div>

                    {/* LOGOUT */}
                    <div className="border-t">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Icon icon="mdi:logout" width="18" />
                        Logout
                      </button>
                    </div>
                  </div>,
                  document.body
                )}
            </>
          )}

          {/* WISHLIST & CART */}
          {!isAdmin && isLoggedIn && (
            <>
              <Link
                href="/wishlist"
                className="relative bg-white p-2 rounded-full text-black"
              >
                <Icon icon="mdi-light:heart" width="22" height="22" />
                {totalWishlist > 0 && (
                  <span className="absolute -right-2 -top-2 bg-white text-gray-900 h-5 w-5 flex justify-center items-center rounded-full text-xs font-semibold">
                    {totalWishlist}
                  </span>
                )}
              </Link>

              <Link
                href="/cart"
                className="relative bg-white p-2 rounded-full text-black"
              >
                <Icon icon="ion:cart-outline" width="22" height="22" />
                {totalItems > 0 && (
                  <span className="absolute -right-2 -top-2  bg-white text-gray-900 h-5 w-5 flex justify-center items-center rounded-full text-xs font-semibold">
                    {totalItems}
                  </span>
                )}
              </Link>

              <div>
                <h2 className="font-medium">Rs {totalAmount.toFixed(2)}</h2>
              </div>
            </>
          )}
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
