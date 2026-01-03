"use client";

import { navitems } from "@/constants";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";

import { signOut, useSession } from "next-auth/react";

const MobileSlider = ({
  setIsOpen,
}: {
  setIsOpen: React.Dispatch<boolean>;
}) => {
  const pathname = usePathname();

 const { data: session, status } = useSession();

const isLoggedIn = status === "authenticated";
const user = session?.user;
const isAdmin = isLoggedIn && user?.role === "admin";




  useEffect(() => {
    setIsOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
    setIsOpen(false);
  };

  return (
    <div>
      {/* HEADER */}
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

        <button
          onClick={() => setIsOpen(false)}
          className="text-zinc-500"
        >
          <Icon icon="fluent-mdl2:cancel" width="20" height="20" />
        </button>
      </div>

      {/* NAV ITEMS */}
      <div className="py-2 mt-4">
        {navitems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={`${
              pathname === item.href ? "text-primary" : "text-zinc-500"
            } font-medium text-sm border-b border-zinc-200 py-4 block`}
          >
            {item.name}
          </Link>
        ))}
      </div>

      {/* AUTH SECTION */}
      <div className="mt-6 border-t pt-4 space-y-3">
        {/* NOT LOGGED IN */}
        {!isLoggedIn && (
          <Link
            href="/login"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 text-sm font-medium text-zinc-600"
          >
            <Icon icon="et:profile-male" width="20" />
            Login
          </Link>
        )}

        {/* ADMIN */}
        {isLoggedIn && isAdmin && (
          <Link
            href="/admin"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 text-sm font-medium text-zinc-600"
          >
            <Icon icon="mdi:view-dashboard" width="20" />
            Admin Dashboard
          </Link>
        )}

        {/* USER */}
        {isLoggedIn && !isAdmin && (
          <>
          <div className="flex items-center gap-3 border-b pb-4">
    <Image
      src={user.image || "/default-user.png"}
      alt={user.name || "User"}
      width={40}
      height={40}
      className="rounded-full object-cover"
    />
    <div className="flex flex-col">
      <span className="text-sm font-semibold text-zinc-800">
        {user.name}
      </span>
      <span className="text-xs text-zinc-500 truncate">
        {user.email}
      </span>
    </div>
  </div>
            <Link
              href="/account"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 text-sm font-medium text-zinc-600"
            >
              <Icon icon="mdi:account-outline" width="20" />
              My Account
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 text-sm font-medium text-zinc-600"
            >
              <Icon icon="mdi:cog-outline" width="20" />
              Settings
            </Link>
          </>
        )}

        {/* LOGOUT */}
        {isLoggedIn && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-sm font-medium text-red-600"
          >
            <Icon icon="mdi:logout" width="20" />
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default MobileSlider;
