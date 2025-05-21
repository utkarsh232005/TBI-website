
"use client";

import * as React from "react";
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
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, FileText, Users, LogOut, Settings } from "lucide-react";
import { InnoNexusLogo } from "@/components/icons/innnexus-logo";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin/dashboard", label: "Submissions", icon: FileText },
    { href: "#", label: "User Management", icon: Users, disabled: true }, // Placeholder
    { href: "#", label: "Settings", icon: Settings, disabled: true }, // Placeholder
  ];

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen">
        <Sidebar className="border-r border-border bg-card">
          <SidebarHeader className="p-4">
            <Link href="/" className="flex items-center gap-2" aria-label="InnoNexus Home">
              <InnoNexusLogo className="h-8 w-auto" />
            </Link>
          </SidebarHeader>
          <SidebarContent className="flex-1 p-2">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    href={item.href}
                    asChild
                    isActive={pathname === item.href}
                    disabled={item.disabled}
                    className={item.disabled ? "cursor-not-allowed opacity-50" : ""}
                    tooltip={item.disabled ? `${item.label} (Coming Soon)`: item.label}
                  >
                    <Link href={item.href} className="flex items-center gap-2">
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-border">
             <Button asChild variant="outline" className="w-full">
                <Link href="/">
                  <LogOut className="mr-2 h-4 w-4" /> Back to Homepage
                </Link>
              </Button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-[57px] items-center gap-2 border-b bg-background px-4 sm:px-6">
            <SidebarTrigger className="text-foreground" />
            <div className="flex items-center gap-2">
                <LayoutDashboard className="h-6 w-6 text-primary" />
                <h1 className="font-orbitron text-xl font-bold text-primary">
                Admin Panel
                </h1>
            </div>
          </header>
          <SidebarInset className="flex-1 overflow-auto bg-background">
            <main className="p-4 sm:p-6 lg:p-8">
                {children}
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
