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
} from "@/components/ui/dropdown-menu";
import AdminSidebar from "@/components/layout/header/sidebar";
import { Toaster } from "sonner";
import { RootLayoutProps } from "@/types/layout";

export default function AdminLayout({ children }: RootLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex w-full overflow-x-hidden bg-gray-50 text-gray-800">
      <Toaster position="top-right" richColors />

      {/* DESKTOP SIDEBAR */}
      <aside
        className={`
          hidden md:flex flex-col border-r bg-white
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-20" : "w-[220px] "}
        `}
      >
        <AdminSidebar collapsed={collapsed} />
      </aside>

      {/* MAIN WRAPPER */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* TOP NAVBAR */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 shrink-0">

          {/* LEFT SIDE */}
          <div className="flex items-center gap-3">

            {/* MOBILE SIDEBAR BUTTON */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="lg:hidden p-2 rounded hover:bg-gray-100">
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>

              <SheetContent side="left" className="p-0 w-[240px]">
                <AdminSidebar collapsed={false} />
              </SheetContent>
            </Sheet>

            {/* DESKTOP COLLAPSE BUTTON */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-2 rounded hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>

   
          </div>

          {/* PROFILE DROPDOWN */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button>
                <Avatar className="cursor-pointer">
                  <AvatarImage src="" />
                  <AvatarFallback>PN</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
             
              <DropdownMenuItem className="text-red-600">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-8 px-4 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
