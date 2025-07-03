// src/app/admin/layout.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarBody,
  DesktopSidebar,
  MobileSidebar,
  SidebarLink,
  useSidebar,
  SidebarProvider
} from "@/components/ui/animated-sidebar";
import {
  FileText,
  LogOut,
  Settings,
  CalendarDays,
  UserCog,
  BarChart2,
  Home,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  LayoutDashboard,
  FileCheck,
  MessageSquare,
  Rocket, // Added Rocket icon
  ClipboardCheck // Added for Evaluation icon
} from "lucide-react";
import { InnoNexusLogo } from "@/components/icons/innnexus-logo";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import NotificationsPanel from "@/components/ui/notifications-panel";

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

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 text-slate-800 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-400/5 to-indigo-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/5 to-pink-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-gradient-to-br from-indigo-400/3 to-blue-400/3 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <Sidebar>
        <SidebarBody>
          <DesktopSidebar>
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-800">
              <Link href="/admin/dashboard" className="flex items-center space-x-3 min-w-max">
                <InnoNexusLogo className="h-8 w-8 text-white flex-shrink-0" />
                <motion.span
                  className="text-lg font-semibold whitespace-nowrap text-white"
                  animate={{
                    opacity: open ? 1 : 0,
                    display: open ? 'flex' : 'none'
                  }}
                  transition={{ duration: 0.2 }}
                >
                  Admin Panel
                </motion.span>
              </Link>
            </div>

            {/* Navigation - Remove scrollbar and perfect spacing */}
            <nav className="flex-1 overflow-hidden">
              <div className="space-y-2 h-full overflow-y-auto scrollbar-hide sidebar-scroll pr-1">
                {navItems.map((item) => (
                  <div key={item.href} className="group relative" title={item.disabled ? 'Coming soon' : ''}>
                    <a
                      href={item.disabled ? '#' : item.href}
                      className={cn(
                        'flex items-center justify-start gap-3 py-3 px-3 rounded-lg transition-colors duration-200',
                        'cursor-pointer',
                        pathname === item.href
                          ? 'bg-indigo-900/50 text-white'
                          : 'text-neutral-300 hover:bg-neutral-800/50 hover:text-white',
                        item.disabled && 'opacity-50 hover:bg-transparent hover:text-neutral-300',
                        'group/sidebar'
                      )}
                      onClick={(e) => {
                        if (item.disabled) {
                          e.preventDefault();
                        } else {
                          handleMobileLinkClick();
                        }
                      }}
                    >
                      {/* Active indicator */}
                      {pathname === item.href && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-500 via-indigo-600 to-purple-600 rounded-r-full shadow-md"></div>
                      )}
                      
                      {/* Enhanced glow effect for active item */}
                      {pathname === item.href && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/8 via-indigo-500/8 to-purple-500/8 rounded-xl"></div>
                      )}
                      
                      <div className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 relative z-10 border backdrop-blur-sm flex-shrink-0 overflow-hidden',
                        pathname === item.href 
                          ? 'bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-white shadow-lg border-blue-400/40' 
                          : 'bg-gradient-to-br from-blue-100/90 to-indigo-100/80 text-blue-600 border-blue-200/40 group-hover/nav:from-blue-500/25 group-hover/nav:to-indigo-500/25 group-hover/nav:text-blue-700 group-hover/nav:border-blue-400/60 group-hover/nav:shadow-md'
                      )}>
                        {/* Icon shimmer effect */}
                        <div className="absolute inset-0 shimmer-effect opacity-0 group-hover/nav:opacity-100 transition-opacity duration-500 rounded-lg"></div>
                        
                        <div className={cn(
                          "transition-transform duration-300 flex items-center justify-center text-base relative z-10",
                          pathname === item.href ? 'scale-110' : 'group-hover/nav:scale-110'
                        )}>
                          {item.icon}
                        </div>
                      </div>
                      
                      <motion.span
                        animate={{
                          display: 'inline-block',
                          opacity: 1
                        }}
                        className={cn(
                          "text-sm font-medium group-hover/nav:translate-x-1 transition-all duration-300 whitespace-pre inline-block !p-0 !m-0 relative z-10 min-w-0 flex-1",
                          pathname === item.href ? 'font-semibold' : 'group-hover/nav:font-semibold'
                        )}
                      >
                        {item.label}
                      </motion.span>
                      
                      {/* Subtle glow effect */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/0 via-indigo-400/0 to-purple-400/0 group-hover/nav:from-blue-400/6 group-hover/nav:via-indigo-400/6 group-hover/nav:to-purple-400/6 transition-all duration-500"></div>
                    </a>
                  </div>
                ))}
              </div>
            </nav>

            {/* Footer */}
            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100/90 to-blue-100/70 backdrop-blur-lg rounded-2xl border border-blue-200/40 shadow-md"></div>
                <SidebarLink
                  link={{
                    href: "/",
                    label: "Back to Home",
                    icon: <Home className="h-5 w-5" />
                  }}
                  className="relative z-10 text-slate-600 hover:text-slate-800"
                />
              </div>
            </div>
          </DesktopSidebar>

          <MobileSidebar>
            {/* Mobile sidebar content */}
            <div className="flex flex-col h-full">
              {/* Mobile Logo */}
              <div className="mb-8 px-3">
                <div className="flex items-center space-x-3 p-4 bg-gradient-to-br from-white/95 via-blue-50/60 to-indigo-50/40 backdrop-blur-lg rounded-2xl border border-white/60 shadow-lg">
                  <div className="p-3 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl shadow-lg">
                    <InnoNexusLogo className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                      Admin Panel
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      TBI Management
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-hide sidebar-scroll py-2">
                <div className="space-y-2 px-3">
                  {navItems.map((item) => (
                    <div key={`mobile-${item.href}`} className="group relative" title={item.disabled ? 'Coming soon' : ''}>
                      <Link
                        href={item.disabled ? '#' : item.href}
                        className={cn(
                          "flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                          pathname === item.href
                            ? 'bg-indigo-900/50 text-white'
                            : 'text-neutral-300 hover:bg-neutral-800/50 hover:text-white',
                          item.disabled && 'opacity-50 hover:bg-transparent hover:text-neutral-300'
                        )}
                        onClick={(e) => {
                          if (item.disabled) {
                            e.preventDefault();
                          }
                          handleMobileLinkClick();
                        }}
                      >
                        {/* Active indicator */}
                        {pathname === item.href && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-500 via-indigo-600 to-purple-600 rounded-r-full shadow-md"></div>
                        )}
                        
                        <div className={cn(
                          'flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 border backdrop-blur-sm relative overflow-hidden',
                          pathname === item.href 
                            ? 'bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-white shadow-lg border-blue-400/40' 
                            : 'bg-gradient-to-br from-slate-100/90 to-blue-100/70 text-blue-600 border-slate-200/50 group-hover:from-blue-500/25 group-hover:to-indigo-500/25 group-hover:text-blue-700 group-hover:border-blue-400/50 group-hover:shadow-md'
                        )}>
                          <div className="absolute inset-0 shimmer-effect opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
                          <div className={cn(
                            "transition-transform duration-300 relative z-10 text-base",
                            pathname === item.href ? 'scale-110' : 'group-hover:scale-110'
                          )}>
                            {item.icon}
                          </div>
                        </div>
                        
                        <span className="relative z-10 min-w-0 flex-1">
                          {item.label}
                        </span>
                        
                        {/* Subtle glow effect */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/0 via-indigo-400/0 to-purple-400/0 group-hover:from-blue-400/5 group-hover:via-indigo-400/5 group-hover:to-purple-400/5 transition-all duration-500"></div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4">
                <Link
                  href="/"
                  className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-300 hover:bg-neutral-800/50 hover:text-white transition-colors"
                  onClick={handleMobileLinkClick} // Close mobile menu on link click
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
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Gradient overlay for main content */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 via-white/60 to-blue-50/40 pointer-events-none"></div>
        
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between h-16 px-3 relative z-10 bg-gradient-to-r from-white/95 via-slate-50/90 to-blue-50/60 backdrop-blur-xl border-b border-white/50 shadow-[0_4px_20px_rgba(59,130,246,0.08)]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200/30 backdrop-blur-sm">
              <button
                onClick={() => setOpen(!open)}
                className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
            <Link href="/admin/dashboard" className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl shadow-lg">
                <InnoNexusLogo className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                  Admin Panel
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  TBI Management
                </span>
              </div>
            </Link>
          </div>
          <NotificationsPanel userId="admin@tbi.com" />
        </header>

        {/* Desktop header with notifications */}
        <header className="hidden md:flex items-center justify-end h-16 px-3 relative z-10 bg-gradient-to-r from-white/80 via-slate-50/60 to-blue-50/40 backdrop-blur-xl border-b border-white/40 shadow-sm">
          <NotificationsPanel userId="admin@tbi.com" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-3 md:p-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
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
    <SidebarProvider>
      <AdminLayoutContent>
        {children}
      </AdminLayoutContent>
    </SidebarProvider>
  );
}
