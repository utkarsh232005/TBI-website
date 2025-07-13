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
  ClipboardCheck
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

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden admin-typography-system">
      
      <Sidebar>
        <SidebarBody>
          <DesktopSidebar>
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
              <Link href="/admin/dashboard" className="flex items-center space-x-3 min-w-max">
                <InnoNexusLogo className="h-8 w-8 text-blue-600 flex-shrink-0" />
                <motion.span
                  className="admin-heading-5 whitespace-nowrap"
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
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                        item.disabled && 'opacity-50 hover:bg-transparent hover:text-gray-400',
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
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full"></div>
                      )}
                      
                      <div className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 flex-shrink-0',
                        pathname === item.href 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200 group-hover:text-gray-700'
                      )}>
                        <div className="flex items-center justify-center text-base">
                          {item.icon}
                        </div>
                      </div>
                      
                      <motion.span
                        animate={{
                          display: 'inline-block',
                          opacity: 1
                        }}
                        className={cn(
                          "admin-nav-text transition-all duration-200 whitespace-pre inline-block !p-0 !m-0 relative z-10 min-w-0 flex-1",
                          pathname === item.href ? 'admin-nav-text-active' : 'group-hover:admin-nav-text-active'
                        )}
                      >
                        {item.label}
                      </motion.span>
                    </a>
                  </div>
                ))}
              </div>
            </nav>

            {/* Footer */}
            <div className="mt-4">
              <SidebarLink
                link={{
                  href: "/",
                  label: "Back to Home",
                  icon: <Home className="h-5 w-5" />
                }}
                className="text-gray-600 hover:text-gray-800"
              />
            </div>
          </DesktopSidebar>

          <MobileSidebar>
            {/* Mobile sidebar content */}
            <div className="flex flex-col h-full">
              {/* Mobile Logo */}
              <div className="mb-8 px-3">
                <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <InnoNexusLogo className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="admin-heading-5">
                      Admin Panel
                    </span>
                    <span className="admin-caption">
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
                          "flex items-center px-3 py-3 rounded-lg admin-nav-text transition-colors cursor-pointer",
                          pathname === item.href
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                          item.disabled && 'opacity-50 hover:bg-transparent hover:text-gray-400'
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
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full"></div>
                        )}
                        
                        <div className={cn(
                          'flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 border',
                          pathname === item.href 
                            ? 'bg-blue-100 text-blue-600 border-blue-200' 
                            : 'bg-gray-100 text-gray-600 border-gray-200 group-hover:bg-gray-200 group-hover:text-gray-700'
                        )}>
                          <div className="flex items-center justify-center text-base">
                            {item.icon}
                          </div>
                        </div>
                        
                        <span className="relative z-10 min-w-0 flex-1">
                          {item.label}
                        </span>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4">
                <Link
                  href="/"
                  className="flex items-center px-3 py-2.5 rounded-lg admin-nav-text text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
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
        <header className="md:hidden flex items-center justify-between h-16 px-3 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gray-100 border border-gray-200">
              <button
                onClick={() => setOpen(!open)}
                className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
            <Link href="/admin/dashboard" className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <InnoNexusLogo className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex flex-col">
                <span className="admin-body-small admin-font-semibold">
                  Admin Panel
                </span>
                <span className="admin-caption">
                  TBI Management
                </span>
              </div>
            </Link>
          </div>
        </header>

        {/* Desktop header with notifications */}
        <header className="hidden md:flex items-center justify-end h-16 px-3 bg-white border-b border-gray-200 shadow-sm">
          <NotificationsPanel userId="admin@tbi.com" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-3 md:p-4 bg-white">
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
