"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import AdminSidebar from "@/components/layout/header/sidebar";
import { Toaster } from "sonner";
import { RootLayoutProps } from "@/types/layout";


export default function AdminLayout({ children }: RootLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className=" min-h-screen flex bg-gray-50 text-gray-800">
       <Toaster position="top-right" richColors />

      {/* SIDEBAR LEFT (Desktop) */}
      <aside
        className={`hidden md:flex flex-col border-r bg-white transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <AdminSidebar collapsed={collapsed} />
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">

        {/* TOP NAVBAR */}
        <header className="h-16 bg-white border-b flex items-center px-4 justify-between">
          
          {/* MOBILE SIDEBAR BUTTON */}
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger>
                <Menu className="w-6 h-6 md:hidden" />
              </SheetTrigger>

              <SheetContent side="left" className="p-0 w-64">
                <AdminSidebar collapsed={false} />
              </SheetContent>
            </Sheet>

            {/* COLLAPSE BUTTON (Desktop) */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:block p-2 hover:bg-gray-100 rounded"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Search */}
            <Input
              placeholder="Search..."
              className="hidden md:block w-64"
            />
          </div>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="cursor-pointer">
                <AvatarImage src="" />
                <AvatarFallback>PN</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Account Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </header>

        {/* PAGE CONTENT */}
        <main><div className="py-8">{children}</div></main>
      </div>
    </div>
  );
}
