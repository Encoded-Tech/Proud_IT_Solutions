"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Folder,
  Package,
  FileText,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Users,
  ShoppingCart,
  ComputerIcon,
  Wrench,
  MailPlus,
} from "lucide-react";
import Image from "@/components/ui/optimized-image";

interface AdminProps {
  collapsed: boolean;
}

type MenuName =
  | "categories"
  | "products"
  | "variants"
  | "posts"
  | "buildUserPC"
  ;

export default function AdminSidebar({ collapsed }: AdminProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<MenuName, boolean>>({
    categories: false,
    products: false,
    variants: false,
    posts: false,
    buildUserPC: false,
   
  });

  useEffect(() => {
    if (pathname.startsWith("/admin/category")) {
      setOpenMenus((prev) => ({ ...prev, categories: true }));
    }
    if (pathname.startsWith("/admin/product")) {
      setOpenMenus((prev) => ({ ...prev, products: true }));
    }
    if (pathname.startsWith("/admin/variants")) {
      setOpenMenus((prev) => ({ ...prev, variants: true }));
    }
    if (pathname.startsWith("/admin/posts")) {
      setOpenMenus((prev) => ({ ...prev, posts: true }));
    }
    if (pathname.startsWith("/admin/build-user-pc")) {
      setOpenMenus((prev) => ({ ...prev, buildUserPC: true }));
    }
  }, [pathname]);

  const toggleMenu = (name: MenuName) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const isActivePath = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const isDashboardActive = pathname === "/admin";

  const isSectionActive = (hrefs: string[]) => hrefs.some((href) => isActivePath(href));

  const navLinkClass = (active: boolean, compactCenter = false) =>
    `flex items-center rounded-lg transition ${
      compactCenter ? "justify-center" : "gap-3"
    } ${
      active
        ? "bg-red-50 text-red-700 ring-1 ring-red-100"
        : "hover:bg-gray-100 text-gray-900"
    }`;

  const navChildLinkClass = (active: boolean) =>
    `block rounded-lg p-2 transition ${
      active ? "bg-red-50 text-red-700 ring-1 ring-red-100" : "hover:bg-gray-50 text-gray-700"
    }`;

  return (
    <div className="h-screen fixed flex flex-col overflow-hidden">
      {/* Logo Section */}
      <div className="px-4 py-4 pb-6 flex items-center gap-2 flex-shrink-0">
        {collapsed ? (
          <Link href="/">
            <Image
              src="/logo/logomain.png"
              alt="logo"
              width={1000}
              height={1000}
              className="object-contain lg:w-14 w-12"
            />
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/">
              <Image
                src="/logo/logomain.png"
                alt="logo"
                width={1000}
                height={1000}
                className="object-contain lg:w-14 w-12"
              />
            </Link>
            <h2 className="text-xl font-semibold text-gray-900">
              Proud Nepal
            </h2>
          </div>
        )}
      </div>

      {/* Navigation Menu - Scrollable */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll pb-4">
        {/* Dashboard - No header needed, it's obvious */}
        <ul className="px-4 space-y-1 mb-2 text-sm font-medium">
          <li>
            <Link
              href="/admin"
              className={`p-2 ${navLinkClass(isDashboardActive, collapsed)}`}
            >
              <LayoutDashboard className={`w-5 h-5 ${isDashboardActive ? "text-red-600" : "text-gray-600"}`} />
              {!collapsed && (
                <span className={isDashboardActive ? "text-red-700 font-semibold" : "text-gray-900"}>
                  Dashboard
                </span>
              )}
            </Link>
          </li>
        </ul>

        {/* Catalog Section */}
        {!collapsed && (
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase mb-2">
            Catalog
          </p>
        )}
        <ul className="px-4 mb-2 space-y-1 text-sm font-medium">
          {/* Categories */}
          <li>
            <button
              onClick={() => toggleMenu("categories")}
              className={`w-full p-2 ${navLinkClass(isSectionActive(["/admin/category"]), collapsed)}`}
            >
              <Folder className={`w-5 h-5 ${isSectionActive(["/admin/category"]) ? "text-red-600" : "text-gray-600"}`} />
              {!collapsed && (
                <>
                  <span className={isSectionActive(["/admin/category"]) ? "text-red-700 font-semibold" : "text-gray-900"}>
                    Categories
                  </span>
                  {openMenus.categories ? (
                    <ChevronDown className={`ml-auto w-4 ${isSectionActive(["/admin/category"]) ? "text-red-500" : "text-gray-400"}`} />
                  ) : (
                    <ChevronRight className={`ml-auto w-4 ${isSectionActive(["/admin/category"]) ? "text-red-500" : "text-gray-400"}`} />
                  )}
                </>
              )}
            </button>

            {openMenus.categories && !collapsed && (
              <ul className="mt-1 ml-8 space-y-1">
                <li>
                  <Link
                    href="/admin/category"
                    className={navChildLinkClass(isActivePath("/admin/category"))}
                  >
                    All Categories
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/category/add-category"
                    className={navChildLinkClass(isActivePath("/admin/category/add-category"))}
                  >
                    Add Category
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Products */}
          <li>
            <button
              onClick={() => toggleMenu("products")}
              className={`w-full p-2 ${navLinkClass(isSectionActive(["/admin/product"]), collapsed)}`}
            >
              <Package className={`w-5 h-5 ${isSectionActive(["/admin/product"]) ? "text-red-600" : "text-gray-600"}`} />
              {!collapsed && (
                <>
                  <span className={isSectionActive(["/admin/product"]) ? "text-red-700 font-semibold" : "text-gray-900"}>
                    Products
                  </span>
                  {openMenus.products ? (
                    <ChevronDown className={`ml-auto w-4 ${isSectionActive(["/admin/product"]) ? "text-red-500" : "text-gray-400"}`} />
                  ) : (
                    <ChevronRight className={`ml-auto w-4 ${isSectionActive(["/admin/product"]) ? "text-red-500" : "text-gray-400"}`} />
                  )}
                </>
              )}
            </button>

            {openMenus.products && !collapsed && (
              <ul className="mt-1 ml-8 space-y-1">
                <li>
                  <Link
                    href="/admin/product"
                    className={navChildLinkClass(isActivePath("/admin/product"))}
                  >
                    All Products
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/product/add-product"
                    className={navChildLinkClass(isActivePath("/admin/product/add-product"))}
                  >
                    Add Product
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Product Variants */}
          <li>
            <button
              onClick={() => toggleMenu("variants")}
              className={`w-full p-2 ${navLinkClass(isSectionActive(["/admin/variants"]), collapsed)}`}
            >
              <Package className={`w-5 h-5 ${isSectionActive(["/admin/variants"]) ? "text-red-600" : "text-gray-600"}`} />
              {!collapsed && (
                <>
                  <span className={isSectionActive(["/admin/variants"]) ? "text-red-700 font-semibold" : "text-gray-900"}>
                    Product Variants
                  </span>
                  {openMenus.variants ? (
                    <ChevronDown className={`ml-auto w-4 ${isSectionActive(["/admin/variants"]) ? "text-red-500" : "text-gray-400"}`} />
                  ) : (
                    <ChevronRight className={`ml-auto w-4 ${isSectionActive(["/admin/variants"]) ? "text-red-500" : "text-gray-400"}`} />
                  )}
                </>
              )}
            </button>

            {openMenus.variants && !collapsed && (
              <ul className="mt-1 ml-8 space-y-1">
                <li>
                  <Link
                    href="/admin/variants"
                    className={navChildLinkClass(isActivePath("/admin/variants"))}
                  >
                    All Variants
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/variants/add-variant"
                    className={navChildLinkClass(isActivePath("/admin/variants/add-variant"))}
                  >
                    Add Variants
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Build My PC */}
          <li>
            <button
              onClick={() => toggleMenu("buildUserPC")}
              className={`w-full p-2 ${navLinkClass(isSectionActive(["/admin/build-user-pc"]), collapsed)}`}
            >
              <ComputerIcon className={`w-5 h-5 ${isSectionActive(["/admin/build-user-pc"]) ? "text-red-600" : "text-gray-600"}`} />
              {!collapsed && (
                <>
                  <span className={isSectionActive(["/admin/build-user-pc"]) ? "text-red-700 font-semibold" : "text-gray-900"}>
                    Build My PC
                  </span>
                  {openMenus.buildUserPC ? (
                    <ChevronDown className={`ml-auto w-4 ${isSectionActive(["/admin/build-user-pc"]) ? "text-red-500" : "text-gray-400"}`} />
                  ) : (
                    <ChevronRight className={`ml-auto w-4 ${isSectionActive(["/admin/build-user-pc"]) ? "text-red-500" : "text-gray-400"}`} />
                  )}
                </>
              )}
            </button>

            {openMenus.buildUserPC && !collapsed && (
              <ul className="mt-1 ml-8 space-y-1">
                <li>
                  <Link
                    href="/admin/build-user-pc/parts-table"
                    className={navChildLinkClass(isActivePath("/admin/build-user-pc/parts-table"))}
                  >
                    All Build Parts
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/build-user-pc/add-part"
                    className={navChildLinkClass(isActivePath("/admin/build-user-pc/add-part"))}
                  >
                    Add Build Parts
                  </Link>
                </li>
              </ul>
            )}
          </li>
        </ul>

        {/* Content Section */}
        {!collapsed && (
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase mb-2">
            Content
          </p>
        )}
        <ul className="px-4 space-y-1 mb-2 text-sm font-medium">
          <li>
            <button
              onClick={() => toggleMenu("posts")}
              className={`w-full p-2 ${navLinkClass(isSectionActive(["/admin/posts"]), collapsed)}`}
            >
              <FileText className={`w-5 h-5 ${isSectionActive(["/admin/posts"]) ? "text-red-600" : "text-gray-600"}`} />
              {!collapsed && (
                <>
                  <span className={isSectionActive(["/admin/posts"]) ? "text-red-700 font-semibold" : "text-gray-900"}>
                    Posts
                  </span>
                  {openMenus.posts ? (
                    <ChevronDown className={`ml-auto w-4 ${isSectionActive(["/admin/posts"]) ? "text-red-500" : "text-gray-400"}`} />
                  ) : (
                    <ChevronRight className={`ml-auto w-4 ${isSectionActive(["/admin/posts"]) ? "text-red-500" : "text-gray-400"}`} />
                  )}
                </>
              )}
            </button>

            {openMenus.posts && !collapsed && (
              <ul className="mt-1 ml-8 space-y-1">
                <li>
                  <Link
                    href="/admin/posts"
                    className={navChildLinkClass(isActivePath("/admin/posts"))}
                  >
                    All Posts
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/posts/add-posts"
                    className={navChildLinkClass(isActivePath("/admin/posts/add-posts"))}
                  >
                    Add Post
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Inbox */}

                <li>
            <Link
              href="/admin/inbox"
              className={`p-2 ${navLinkClass(isActivePath("/admin/inbox"), collapsed)}`}
            >
              <MessageSquare className={`w-5 h-5 ${isActivePath("/admin/inbox") ? "text-red-600" : "text-gray-600"}`} />
              {!collapsed && (
                <span className={isActivePath("/admin/inbox") ? "text-red-700 font-semibold" : "text-gray-900"}>
                  Inbox
                </span>
              )}
            </Link>
          </li>
        </ul>

        {/* Sales Section */}
        {!collapsed && (
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase mb-2">
            Customer & Sales
          </p>
        )}
        <ul className="px-4 space-y-1 mb-2 text-sm font-medium">
          <li>
            <Link
              href="/admin/users"
              className={`p-2 ${navLinkClass(isActivePath("/admin/users"), collapsed)}`}
            >
              <Users className={`w-5 h-5 ${isActivePath("/admin/users") ? "text-red-600" : "text-gray-600"}`} />
              {!collapsed && (
                <span className={isActivePath("/admin/users") ? "text-red-700 font-semibold" : "text-gray-900"}>
                  Users
                </span>
              )}
            </Link>
          </li>

          <li>
            <Link
              href="/admin/newsletter"
              className={`p-2 ${navLinkClass(isActivePath("/admin/newsletter"), collapsed)}`}
            >
              <MailPlus className={`w-5 h-5 ${isActivePath("/admin/newsletter") ? "text-red-600" : "text-gray-600"}`} />
              {!collapsed && (
                <span className={isActivePath("/admin/newsletter") ? "text-red-700 font-semibold" : "text-gray-900"}>
                  Newsletter
                </span>
              )}
            </Link>
          </li>

          <li>
            <Link
              href="/admin/orders"
              className={`p-2 ${navLinkClass(isActivePath("/admin/orders"), collapsed)}`}
            >
              <ShoppingCart className={`w-5 h-5 ${isActivePath("/admin/orders") ? "text-red-600" : "text-gray-600"}`} />
              {!collapsed && (
                <span className={isActivePath("/admin/orders") ? "text-red-700 font-semibold" : "text-gray-900"}>
                  Orders
                </span>
              )}
            </Link>
          </li>

          <li>
            <Link
              href="/admin/quotations"
              className={`p-2 ${navLinkClass(isActivePath("/admin/quotations"), collapsed)}`}
            >
              <FileText className={`w-5 h-5 ${isActivePath("/admin/quotations") ? "text-red-600" : "text-gray-600"}`} />
              {!collapsed && (
                <span className={isActivePath("/admin/quotations") ? "text-red-700 font-semibold" : "text-gray-900"}>
                  Quotations
                </span>
              )}
            </Link>
          </li>

          <li>
            <Link
              href="/admin/build-requests"
              className={`p-2 ${navLinkClass(isActivePath("/admin/build-requests"), collapsed)}`}
            >
              <Wrench className={`w-5 h-5 ${isActivePath("/admin/build-requests") ? "text-red-600" : "text-gray-600"}`} />
              {!collapsed && (
                <span className={isActivePath("/admin/build-requests") ? "text-red-700 font-semibold" : "text-gray-900"}>
                  Build Requests
                </span>
              )}
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
