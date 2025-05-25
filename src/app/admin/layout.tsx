// src/app/admin/layout.tsx
"use client";

import React from "react";
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, FileText, Users, LogOut, Settings, CalendarDays } from "lucide-react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

// Logo component
const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="h-7 w-8 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-[#4F46E5]" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="font-medium text-lg font-sans text-[#E0E0E0]"
      >
        RCEOM-TBI
      </motion.span>
    </div>
  );
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin/dashboard", label: "Submissions", icon: FileText },
    { href: "/admin/events", label: "Events", icon: CalendarDays, disabled: false },
    { href: "/admin/mentors", label: "Mentors", icon: Users, disabled: false },
    { href: "/admin/settings", label: "Settings", icon: Settings, disabled: false },
  ];

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen bg-[#121212]">
        <Sidebar className="border-r border-[#2A2A2A] bg-[#121212] shadow-xl">
          <SidebarHeader className="p-4">
            <Link href="/" className="flex items-center gap-2" aria-label="RCEOM-TBI Home">
              <Logo />
            </Link>
          </SidebarHeader>
          <SidebarContent className="flex-1 p-2">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    disabled={item.disabled}
                    className={`transition-all hover:bg-[#252525] ${item.disabled ? "cursor-not-allowed opacity-50" : ""} ${pathname === item.href ? "bg-[#252525]" : ""}`}
                  >
                    <Link href={item.href} className="flex items-center gap-2 p-2 rounded-lg">
                      <item.icon className="h-5 w-5 text-[#4F46E5]" />
                      <span className="text-[#E0E0E0] font-sans">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-[#2A2A2A]">
             <Button asChild variant="outline" className="w-full bg-transparent border-[#2A2A2A] text-[#E0E0E0] hover:bg-[#252525] hover:text-[#E0E0E0]">
                <Link href="/">
                  <LogOut className="mr-2 h-4 w-4 text-[#4F46E5]" /> Back to Homepage
                </Link>
              </Button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[#2A2A2A] bg-[#121212] px-6 shadow-md">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6 text-[#4F46E5]" />
              <h1 className="text-xl font-bold text-[#E0E0E0] font-sans">
                Admin Panel
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-[#4F46E5] flex items-center justify-center text-white font-sans">
                A
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6 bg-[#121212]">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
