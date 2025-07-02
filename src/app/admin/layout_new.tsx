// src/app/admin/layout.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
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
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 text-slate-800 overflow-hidden">
      <Sidebar>
        <SidebarBody>
          <DesktopSidebar>
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200/80 bg-gradient-to-r from-white/80 to-blue-50/50 backdrop-blur-sm rounded-lg mb-2 shadow-sm">
              <Link href="/admin/dashboard" className="flex items-center space-x-3 min-w-max">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                  <InnoNexusLogo className="h-6 w-6 text-white flex-shrink-0" />
                </div>
                <motion.span 
                  className="text-lg font-bold whitespace-nowrap bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent"
                  animate={{
                    opacity: open ? 1 : 0,
                    display: open ? 'inline-block' : 'none'
                  }}
                >
                  Admin Panel
                </motion.span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4">
              <div className="space-y-2 px-2">
                {navItems.map((item) => (
                  <div key={item.href} className="group relative" title={item.disabled ? 'Coming soon' : ''}>
                    <a
                      href={item.disabled ? '#' : item.href}
                      className={cn(
                        'flex items-center justify-start gap-3 py-3 px-4 rounded-xl transition-all duration-300',
                        'cursor-pointer relative overflow-hidden',
                        pathname === item.href 
                          ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 border border-blue-200/50 shadow-lg backdrop-blur-sm' 
                          : 'text-slate-600 hover:bg-gradient-to-r hover:from-white/60 hover:to-blue-50/60 hover:text-slate-800 hover:border-slate-200/50 hover:shadow-md border border-transparent backdrop-blur-sm',
                        item.disabled && 'opacity-50 hover:bg-transparent hover:text-slate-600',
                        'group/sidebar'
                      )}
                      onClick={(e) => {
                        if (item.disabled) {
                          e.preventDefault();
                        }
                      }}
                    >
                      {/* Active indicator */}
                      {pathname === item.href && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-r-full"></div>
                      )}
                      
                      <div className={cn(
                        'flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300',
                        pathname === item.href 
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg' 
                          : 'bg-gradient-to-br from-slate-100 to-slate-200 text-blue-500 group-hover/sidebar:from-blue-100 group-hover/sidebar:to-indigo-100 group-hover/sidebar:text-blue-600'
                      )}>
                        {item.icon}
                      </div>
                      
                      <motion.span
                        animate={{
                          display: 'inline-block',
                          opacity: 1
                        }}
                        className="text-sm font-semibold group-hover/sidebar:translate-x-1 transition duration-300 whitespace-pre inline-block !p-0 !m-0"
                      >
                        {item.label}
                      </motion.span>
                      
                      {/* Hover glow effect */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover/sidebar:from-blue-500/5 group-hover/sidebar:to-indigo-500/5 transition-all duration-300"></div>
                    </a>
                  </div>
                ))}
              </div>
            </nav>

            {/* Footer */}
            <div className="p-2">
              <SidebarLink
                link={{
                  href: "/",
                  label: "Back to Home",
                  icon: <Home className="h-5 w-5" />
                }}
                className="text-slate-600 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 hover:text-slate-800 border border-transparent hover:border-slate-200"
              />
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
                          "flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer border border-transparent",
                          pathname === item.href 
                            ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200 shadow-md' 
                            : 'text-slate-600 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 hover:text-slate-800 hover:border-slate-200',
                          item.disabled && 'opacity-50 hover:bg-transparent hover:text-slate-600'
                        )}
                        onClick={(e) => {
                          if (item.disabled) {
                            e.preventDefault();
                          }
                          handleMobileLinkClick(); // Close mobile menu on link click
                        }}
                      >
                        <span className={cn(
                          'flex-shrink-0 mr-3 transition-colors duration-200',
                          pathname === item.href 
                            ? 'text-blue-600' 
                            : 'text-blue-500'
                        )}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-4">
                <Link 
                  href="/" 
                  className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 hover:text-slate-800 transition-all duration-200 border border-transparent hover:border-slate-200"
                   onClick={handleMobileLinkClick} // Close mobile menu on link click
                >
                  <Home className="h-5 w-5 mr-3 text-blue-500" />
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
        <header className="md:hidden flex items-center justify-between h-16 px-4 border-b border-slate-200 bg-white/90 backdrop-blur-sm shadow-sm">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setOpen(!open)}
              className="p-2 rounded-md text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors duration-200"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/admin/dashboard" className="flex items-center space-x-2">
              <InnoNexusLogo className="h-8 w-8 text-blue-600" />
              <span className="text-lg font-semibold text-slate-800">Admin</span>
            </Link>
          </div>
          <NotificationsPanel userId="admin@tbi.com" />
        </header>

        {/* Desktop header with notifications */}
        <header className="hidden md:flex items-center justify-end h-16 px-6 border-b border-slate-200 bg-white/90 backdrop-blur-sm shadow-sm">
          <NotificationsPanel userId="admin@tbi.com" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-br from-slate-50/50 to-gray-100/50">
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
    <AdminAuthProvider>
      <SidebarProvider>
        <AdminLayoutContent>
          {children}
        </AdminLayoutContent>
      </SidebarProvider>
    </AdminAuthProvider>
  );
}
