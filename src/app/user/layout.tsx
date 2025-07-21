// src/app/user/layout.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // Added useRouter
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  useSidebar,
  SidebarProvider
} from "@/components/ui/animated-sidebar"; // Adjusted import path
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Settings,
  LogOut,
  Home,
  Menu,
  User,
  Star, // Add Star icon for Evaluation
} from "lucide-react";
import NotificationsPanel from "@/components/ui/notifications-panel";
import { InnoNexusLogo } from "@/components/icons/innnexus-logo";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { OnboardingPopup } from "@/components/ui/onboarding-popup";
import { useOnboarding } from "@/hooks/useOnboarding";
import { UserProvider, useUser } from "@/contexts/user-context";
import { clearUserSession } from "@/lib/client-utils";
// import { logoutUser } from "@/app/actions/auth-actions";
import { logoutUser } from "@/app/actions/auth-actions";

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
  const router = useRouter(); // For logout
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
      label: "My Dashboard",
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
      label: "Mentor Requests",
      icon: <Users className="h-5 w-5" />,
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
      disabled: false // Now functional
    },
  ];

  const handleLogout = async () => {
    try {
      await logoutUser();
      clearUserSession();
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        setOpen(false);
      }
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      clearUserSession();
      router.push('/login');
    }
  };

  const handleMobileLinkClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-neutral-900 text-white overflow-hidden">
      <Sidebar>
        <SidebarBody>
            <div className="flex items-center justify-between h-16 px-4">
              <Link href="/user/dashboard" className="flex items-center space-x-2">
                <InnoNexusLogo className="h-8 w-8 text-white flex-shrink-0" />
                <motion.span
                  animate={{
                    opacity: open ? 1 : 0,
                    display: open ? 'flex' : 'none'
                  }}
                  className="font-semibold text-lg"
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
                          icon: item.icon,
                      }}
                      className={cn(
                        pathname === item.href ? "bg-indigo-900/50 text-white" : "text-neutral-300 hover:bg-neutral-800/50",
                        item.disabled && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={(e) => {
                        if(item.disabled) e.preventDefault();
                        handleMobileLinkClick();
                      }}
                    />
                ))}
              </div>
            </nav>
            <div className="p-4 border-t border-neutral-800 space-y-1">
              <button
                onClick={handleLogout}
                className="flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-800/50 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <motion.span
                    animate={{ display: open ? "inline-block" : "none", opacity: open ? 1: 0}}
                >
                    Logout
                </motion.span>
              </button>
              <Link
                href="/"
                className="flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-300 hover:bg-neutral-800/50 transition-colors"
              >
                <Home className="h-5 w-5" />
                <motion.span
                    animate={{ display: open ? "inline-block" : "none", opacity: open ? 1: 0}}
                >
                    Back to Home
                </motion.span>
              </Link>
            </div>
        </SidebarBody>
      </Sidebar>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden flex items-center justify-between h-16 px-4 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setOpen(!open)}
              className="p-2 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/user/dashboard" className="flex items-center space-x-2">
              <InnoNexusLogo className="h-8 w-8 text-white" />
              <span className="text-lg font-semibold text-white">Portal</span>
            </Link>
          </div>
        </header>

        <header className="hidden md:flex items-center justify-end h-16 px-6 bg-neutral-900 border-b border-neutral-800">
            {user?.uid && <NotificationsPanel userId={user.uid} />}
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-neutral-900/50">
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
