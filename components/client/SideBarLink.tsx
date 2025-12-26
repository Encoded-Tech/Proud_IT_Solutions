"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
export default function SidebarLink({ href, label }: { href: string; label: string }) {
const pathname = usePathname();
  const isRootAccount = href === "/account";

  const isActive = isRootAccount
    ? pathname === href
    : pathname === href || pathname.startsWith(href + "/");
    
  return (
    <Link
      href={href}
      className={clsx(
        "block px-4 py-2 rounded-md text-sm transition",
        isActive
          ? "bg-red-50 text-red-600 font-medium border-l-2 border-red-500"
          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
      )}
    >
      {label}
    </Link>
  );
}