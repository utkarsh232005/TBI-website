// src/app/user/layout.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  useSidebar,
  SidebarProvider
} from "@/components/ui/animated-sidebar";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Settings,
  LogOut,
  Home,
  Menu,
  User,
  Star,
  X,
  MessageSquare,
} from "lucide-react";
import NotificationsPanel from "@/components/ui/notifications-panel";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { OnboardingPopup } from "@/components/ui/onboarding-popup";
import { useOnboarding } from "@/hooks/useOnboarding";
import { UserProvider, useUser } from "@/contexts/user-context";
import { clearUserSession } from "@/lib/client-utils";
import { logoutUser } from "@/app/actions/auth-actions";
import { TooltipProvider } from "@/components/ui/tooltip";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

function UserLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { open, setOpen } = useSidebar();
  const { showOnboarding, completeOnboarding } = useOnboarding();
  const { user } = useUser();

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setOpen(false);
    }
  }, [pathname, setOpen]);

  const navItems: NavItem[] = [
    {
      href: "/user/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      disabled: false
    },
    {
      href: "/user/mentors",
      label: "Mentors",
      icon: <Users className="h-5 w-5" />,
      disabled: false
    },
    {
      href: "/user/mentor-requests",
      label: "My Requests",
      icon: <MessageSquare className="h-5 w-5" />,
      disabled: false
    },
    {
      href: "/user/events",
      label: "Events",
      icon: <CalendarDays className="h-5 w-5" />,
      disabled: false
    },
    {
      href: "/user/evaluation",
      label: "Evaluation",
      icon: <Star className="h-5 w-5" />,
      disabled: false
    },
    {
      href: "/user/settings",
      label: "Profile",
      icon: <User className="h-5 w-5" />,
      disabled: false
    },
  ];

  const handleLogout = async () => {
    try {
      await logoutUser();
      clearUserSession();
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        setOpen(false);
      }
      router.push('/');
    } catch (error) {
      console.error('Error during logout:', error);
      clearUserSession();
      router.push('/');
    }
  };

  const handleMobileLinkClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
       <TooltipProvider>
      <Sidebar>
        <SidebarBody>
            <div className="flex items-center justify-center h-16">
              <Link href="/user/dashboard" className="flex items-center space-x-2">
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
                  className="font-semibold text-lg text-gray-800"
                >
                  User Portal
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
                     icon: <div className="min-w-6 flex items-center justify-center">{item.icon}</div>,
                   }}
                   className={cn(
                     "font-medium text-gray-700",
                     pathname === item.href && "bg-gray-200 text-gray-900",
                     item.disabled && "opacity-50 cursor-not-allowed"
                   )}
                   onClick={(e) => {
                     if (item.disabled) e.preventDefault();
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
      </TooltipProvider>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-white">
          <Link href="/user/dashboard" className="flex items-center space-x-2">
             <Image
                src="/logo192.png"
                alt="TBI Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="font-semibold text-gray-800">Portal</span>
          </Link>
          <button onClick={() => setOpen(!open)} className="p-2">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </header>

        <header className="hidden md:flex items-center justify-end h-16 px-6 bg-white border-b border-gray-200">
            {user?.uid && <NotificationsPanel userId={user.uid} />}
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-100">
          {children}
        </main>
      </div>

      <OnboardingPopup
        isOpen={showOnboarding}
        onClose={completeOnboarding}
        onComplete={completeOnboarding}
        userUid={user?.uid}
      />
    </div>
  );
}

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <SidebarProvider>
        <UserLayoutContent>
            {children}
        </UserLayoutContent>
      </SidebarProvider>
  );
}
