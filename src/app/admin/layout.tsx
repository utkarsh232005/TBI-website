// src/app/admin/layout.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image"; // Import the Next.js Image component
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  useSidebar,
  SidebarProvider
} from "@/components/ui/animated-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Settings,
  CalendarDays,
  BarChart2,
  Home,
  Menu,
  Users,
  LayoutDashboard,
  FileCheck,
  MessageSquare,
  Rocket,
  ClipboardCheck,
  LogOut,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import NotificationsPanel from "@/components/ui/notifications-panel";
import { clearUserSession } from "@/lib/client-utils";
import { logoutUser } from "@/app/actions/auth-actions";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  disabled: boolean;
}

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { open, setOpen } = useSidebar();

  React.useEffect(() => {
    // Close sidebar on mobile when route changes
    if (window.innerWidth < 768) {
      setOpen(false);
    }
  }, [pathname, setOpen]);

  const navItems: NavItem[] = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      disabled: false
    },
    {
      href: "/admin/submissions",
      label: "Submissions",
      icon: <FileCheck className="h-5 w-5" />,
      disabled: false
    },
    {
      href: "/admin/mentors",
      label: "Mentors",
      icon: <Users className="h-5 w-5" />,
      disabled: false
    },
    {
      href: "/admin/mentor-requests",
      label: "Mentor Requests",
      icon: <MessageSquare className="h-5 w-5" />,
      disabled: false
    },
    {
      href: "/admin/events",
      label: "Events",
      icon: <CalendarDays className="h-5 w-5" />,
      disabled: false
    },
    {
      href: "/admin/startups", // Link to the startups management page
      label: "Add-startups",   // New label
      icon: <Rocket className="h-5 w-5" />, // Using Rocket icon
      disabled: false
    },
    {
      href: "/admin/analysis",
      label: "Analysis",
      icon: <BarChart2 className="h-5 w-5" />,
      disabled: false
    },
    {
      href: "/admin/evaluation",
      label: "Evaluation",
      icon: <ClipboardCheck className="h-5 w-5" />,
      disabled: false
    },
    {
      href: "/admin/settings",
      label: "Settings",
      icon: <Settings className="h-5 w-5" />,
      disabled: false
    },
  ];

  const handleMobileLinkClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) { // Check if mobile
      setOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      clearUserSession();
      router.push('/');
    } catch (error) {
      console.error('Error during logout:', error);
      clearUserSession();
      router.push('/');
    }
  };


  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
      
      <Sidebar>
        <SidebarBody>
            <div className="flex items-center justify-center h-16">
              <Link href="/admin/dashboard" className="flex items-center space-x-2">
                <Image
                  src="/logo192.png"
                  alt="TBI Logo"
                  width={32}
                  height={32}
                  className="h-8 w-8 flex-shrink-0"
                />
                <motion.span
                  animate={{
                    opacity: open ? 1 : 0,
                    display: open ? 'flex' : 'none'
                  }}
                  className="font-semibold text-lg"
                >
                  Admin Panel
                </motion.span>
              </Link>
            </div>
            <nav className="flex-1 overflow-y-auto py-2">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <SidebarLink
                    key={item.href}
                    link={{
                      href: item.href,
                      label: item.label,
                      icon: item.icon,
                    }}
                    className={cn(
                        "font-semibold text-gray-900", // No background color for active link
                        item.disabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={(e: React.MouseEvent) => {
                        if(item.disabled) e.preventDefault();
                        handleMobileLinkClick();
                    }}
                  />
                ))}
              </div>
            </nav>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <motion.span
                    animate={{ display: open ? "inline-block" : "none", opacity: open ? 1: 0}}
                >
                    Logout
                </motion.span>
              </button>
            </div>
        </SidebarBody>
      </Sidebar>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
          <div className="flex items-center">
            <button
              onClick={() => setOpen(!open)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link href="/admin/dashboard" className="ml-4">
                 <Image
                  src="/logo192.png"
                  alt="TBI Logo"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
            </Link>
          </div>
          <NotificationsPanel userId="admin@tbi.com" />
        </header>

        <header className="hidden md:flex items-center justify-end h-16 px-6 bg-white border-b border-gray-200">
          <NotificationsPanel userId="admin@tbi.com" />
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
            {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AdminLayoutContent>
          {children}
        </AdminLayoutContent>
      </SidebarProvider>
    </TooltipProvider>
  );
}
