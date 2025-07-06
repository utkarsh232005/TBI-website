// src/app/user/layout.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // Added useRouter
import {
  Sidebar,
  SidebarBody,
  DesktopSidebar,
  MobileSidebar,
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
  const { open, setOpen } = useSidebar(); const { showOnboarding, completeOnboarding } = useOnboarding();
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
    }, {
      href: "/user/settings",
      label: "Profile",
      icon: <User className="h-5 w-5" />,
      disabled: false // Now functional
    },
  ];
  const handleLogout = async () => {
    try {
      // Sign out from Firebase Auth
      await logoutUser();

      // Clear local session data
      clearUserSession();

      // Close sidebar if on mobile
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        setOpen(false);
      }

      // Redirect to login
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if Firebase logout fails, still redirect
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
          <DesktopSidebar>
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-800">
              <Link href="/user/dashboard" className="flex items-center space-x-3 min-w-max">
                <InnoNexusLogo className="h-8 w-8 text-white flex-shrink-0" text="TBI" />
                <motion.span
                  className="text-lg font-semibold whitespace-nowrap text-white"
                  animate={{
                    opacity: open ? 1 : 0,
                    display: open ? 'inline-block' : 'none'
                  }}
                >
                  User Portal
                </motion.span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4">
              <div className="space-y-1 px-2">
                {navItems.map((item) => (
                  <div key={item.href} className="group relative" title={item.disabled ? 'Coming soon' : ''}>
                    <Link
                      href={item.disabled ? '#' : item.href}
                      className={cn(
                        'flex items-center justify-start gap-3 py-3 px-3 rounded-lg transition-colors duration-200',
                        'cursor-pointer',
                        pathname === item.href
                          ? 'bg-indigo-900/50 text-white'
                          : 'text-neutral-300 hover:bg-neutral-800/50 hover:text-white',
                        item.disabled && 'opacity-50 hover:bg-transparent hover:text-neutral-300 cursor-not-allowed',
                        'group/sidebar'
                      )}
                      onClick={(e) => {
                        if (item.disabled) e.preventDefault();
                      }}
                    >
                      <span className="text-indigo-400 group-hover/sidebar:text-indigo-300 transition-colors">
                        {item.icon}
                      </span>
                      <motion.span
                        animate={{
                          display: 'inline-block',
                          opacity: 1
                        }}
                        className="text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
                      >
                        {item.label}
                      </motion.span>
                    </Link>
                  </div>
                ))}
              </div>
            </nav>

            {/* Footer Actions */}
            <div className="p-2 border-t border-neutral-800 space-y-1">
              <button
                onClick={handleLogout}
                className={cn(
                  'flex items-center justify-start gap-3 py-3 px-3 rounded-lg transition-colors duration-200 w-full',
                  'text-neutral-300 hover:bg-rose-800/50 hover:text-white',
                  'group/sidebar'
                )}
              >
                <span className="text-rose-400 group-hover/sidebar:text-rose-300 transition-colors">
                  <LogOut className="h-5 w-5" />
                </span>
                <motion.span
                  animate={{
                    display: 'inline-block',
                    opacity: 1
                  }}
                  className="text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
                >
                  Logout
                </motion.span>
              </button>
              <Link
                href="/"
                className={cn(
                  'flex items-center justify-start gap-3 py-3 px-3 rounded-lg transition-colors duration-200 w-full',
                  'text-neutral-300 hover:bg-neutral-800/50 hover:text-white',
                  'group/sidebar'
                )}
              >
                <span className="text-indigo-400 group-hover/sidebar:text-indigo-300 transition-colors">
                  <Home className="h-5 w-5" />
                </span>
                <motion.span
                  animate={{
                    display: 'inline-block',
                    opacity: 1
                  }}
                  className="text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
                >
                  Back to Home
                </motion.span>
              </Link>
            </div>
          </DesktopSidebar>

          <MobileSidebar>
            {/* Mobile sidebar content */}
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto py-4">
                <div className="space-y-1 px-2">
                  {navItems.map((item) => (
                    <div key={`mobile-${item.href}`} className="group relative" title={item.disabled ? 'Coming soon' : ''}>
                      <Link
                        href={item.disabled ? '#' : item.href}
                        className={cn(
                          "flex items-center px-3 py-3 rounded-lg text-base font-medium transition-colors cursor-pointer",
                          pathname === item.href
                            ? 'bg-indigo-900/50 text-white'
                            : 'text-neutral-300 hover:bg-neutral-800/50 hover:text-white',
                          item.disabled && 'opacity-50 hover:bg-transparent hover:text-neutral-300 cursor-not-allowed'
                        )}
                        onClick={(e) => {
                          if (item.disabled) e.preventDefault();
                          handleMobileLinkClick();
                        }}
                      >
                        <span className="flex-shrink-0 mr-3">
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 border-t border-neutral-800 space-y-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2.5 rounded-lg text-base font-medium text-neutral-300 hover:bg-rose-800/50 hover:text-white transition-colors w-full"
                >
                  <LogOut className="h-5 w-5 mr-3 text-rose-400" />
                  <span>Logout</span>
                </button>
                <Link
                  href="/"
                  className="flex items-center px-3 py-2.5 rounded-lg text-base font-medium text-neutral-300 hover:bg-neutral-800/50 hover:text-white transition-colors"
                  onClick={handleMobileLinkClick}
                >
                  <Home className="h-5 w-5 mr-3" />
                  <span>Back to Home</span>
                </Link>
              </div>
            </div>
          </MobileSidebar>
        </SidebarBody>
      </Sidebar>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between h-16 px-4 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setOpen(!open)}
              className="p-2 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/user/dashboard" className="flex items-center space-x-2">
              <InnoNexusLogo className="h-8 w-8 text-white" text="TBI" />
              <span className="text-lg font-semibold text-white">Portal</span>
            </Link>
          </div>
        </header>

        {/* Floating Notifications Panel */}
        {user?.uid && (
          <NotificationsPanel userId={user.uid} />
        )}

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-neutral-900/50">
          {children}
        </main>
      </div>

      {/* Onboarding Popup */}
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
