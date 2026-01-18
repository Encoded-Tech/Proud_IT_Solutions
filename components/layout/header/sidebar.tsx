"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Folder,
  Package,
  FileText,
  MessageSquare,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";

interface AdminProops {
  collapsed : boolean
}

type MenuName = "categories" | "products" | "variants" |"posts" | "buildUserPC";

export default function AdminSidebar({ collapsed }: AdminProops) {
  const [openMenus, setOpenMenus] = useState<Record<MenuName, boolean>>({
    categories: false,
    products: false,
    variants: false,
    posts: false,
    buildUserPC: false,
  });

  const toggleMenu = (name: MenuName) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="flex-1 fixed overflow-y-auto py-4 flex flex-col">

<div className="px-4  pb-4 flex items-center gap-2">
  {/* Show small logo when collapsed */}
  {collapsed && (
   <Link href="/">
   <Image
     src="/logo/logomain.png"
     alt="logo"
     width={1000}
     height={1000}
     className="object-contain lg:w-14 w-12"
   />
 </Link>
  )}

  {/* Show title + full logo when expanded */}
  {!collapsed && (
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
      {/* MENU HEADING */}
    
        <p className="px-4  text-xs font-semibold text-gray-400 uppercase mb-2">
          Menu
        </p>


      <ul className="flex-1 px-4 space-y-1 text-sm font-medium">

        {/* Dashboard */}
        <li>
          <Link
            href="/admin"
            className={`flex items-center p-2 rounded-lg hover:bg-gray-100 transition ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            <LayoutDashboard className="w-5 h-5 text-gray-600" />
            {!collapsed && <span className="text-gray-900">Dashboard</span>}
          </Link>
        </li>

        {/* Categories */}
        <li>
          <button
            onClick={() => toggleMenu("categories")}
            className={`flex w-full items-center p-2 rounded-lg hover:bg-gray-100 transition ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            <Folder className="w-5 h-5 text-gray-600" />
            {!collapsed && (
              <>
                <span className="text-gray-900">Categories</span>
                {openMenus.categories ? (
                  <ChevronDown className="ml-auto w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="ml-auto w-4 text-gray-400" />
                )}
              </>
            )}
          </button>

          {openMenus.categories && !collapsed && (
            <ul className="mt-1 ml-8 space-y-1">
              <li>
                <Link
                  href="/admin/category"
                  className="block p-2 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  All Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/category/add-category"
                  className="block p-2 rounded-lg hover:bg-gray-50 text-gray-700"
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
            className={`flex w-full items-center p-2 rounded-lg hover:bg-gray-100 transition ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            <Package className="w-5 h-5 text-gray-600" />
            {!collapsed && (
              <>
                <span className="text-gray-900">Products</span>
                {openMenus.products ? (
                  <ChevronDown className="ml-auto w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="ml-auto w-4 text-gray-400" />
                )}
              </>
            )}
          </button>

          {openMenus.products && !collapsed && (
            <ul className="mt-1 ml-8 space-y-1">
              <li>
                <Link
                  href="/admin/product"
                  className="block p-2 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/product/add-product"
                  className="block p-2 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  Add Product
                </Link>
              </li>
            </ul>
          )}
        </li>
        <li>
          <button
            onClick={() => toggleMenu("variants")}
            className={`flex w-full items-center p-2 rounded-lg hover:bg-gray-100 transition ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            <Package className="w-5 h-5 text-gray-600" />
            {!collapsed && (
              <>
                <span className="text-gray-900">Product Variants</span>
                {openMenus.variants ? (
                  <ChevronDown className="ml-auto w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="ml-auto w-4 text-gray-400" />
                )}
              </>
            )}
          </button>

          {openMenus.variants && !collapsed && (
            <ul className="mt-1 ml-8 space-y-1">
              <li>
                <Link
                  href="/admin/variants"
                  className="block p-2 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  All Variants
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/variants/add-variant"
                  className="block p-2 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  Add Variants
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Posts */}
        <li>
          <button
            onClick={() => toggleMenu("posts")}
            className={`flex w-full items-center p-2 rounded-lg hover:bg-gray-100 transition ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            <FileText className="w-5 h-5 text-gray-600" />
            {!collapsed && (
              <>
                <span className="text-gray-900">Posts</span>
                {openMenus.posts ? (
                  <ChevronDown className="ml-auto w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="ml-auto w-4 text-gray-400" />
                )}
              </>
            )}
          </button>

          {openMenus.posts && !collapsed && (
            <ul className="mt-1 ml-8 space-y-1">
              <li>
                <Link
                  href="/admin/posts"
                  className="block p-2 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  All Posts
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/posts/add-posts"
                  className="block p-2 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  Add Post
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Build My PC */}
        <li>
          <button
            onClick={() => toggleMenu("buildUserPC")}
            className={`flex w-full items-center p-2 rounded-lg hover:bg-gray-100 transition ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            <Package className="w-5 h-5 text-gray-600" />
            {!collapsed && (
              <>
                <span className="text-gray-900">Build My PC</span>
                {openMenus.buildUserPC ? (
                  <ChevronDown className="ml-auto w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="ml-auto w-4 text-gray-400" />
                )}
              </>
            )}
          </button>

          {openMenus.buildUserPC && !collapsed && (
            <ul className="mt-1 ml-8 space-y-1">
              <li>
                <Link
                  href="/admin/build-user-pc/parts-table"
                  className="block p-2 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  All Build Parts 
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/build-user-pc/add-part"
                  className="block p-2 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  Add Build Parts
                </Link>
              </li>
              
            </ul>
          )}
        </li>

        {/* Messages */}
        <li>
          <Link
            href="/admin/messages"
            className={`flex items-center p-2 rounded-lg hover:bg-gray-100 transition ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            <MessageSquare className="w-5 h-5 text-gray-600" />
            {!collapsed && <span className="text-gray-900">Messages</span>}
          </Link>
        </li>
      </ul>
    </div>
  );
}
