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
  FileCheck
} from "lucide-react";
import { InnoNexusLogo } from "@/components/icons/innnexus-logo";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
      href: "/admin/events", 
      label: "Events", 
      icon: <CalendarDays className="h-5 w-5" />,
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
    <div className="flex h-screen bg-neutral-900 text-white overflow-hidden">
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
                    display: open ? 'inline-block' : 'none'
                  }}
                >
                  Admin Panel
                </motion.span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4">
              <div className="space-y-1 px-2">
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
                        }
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
                    </a>
                  </div>
                ))}
              </div>
            </nav>

            {/* Footer */}
            <div className="p-2 border-t border-neutral-800">
              <SidebarLink
                link={{
                  href: "/",
                  label: "Back to Home",
                  icon: <Home className="h-5 w-5" />
                }}
                className="text-neutral-300 hover:bg-neutral-800/50 hover:text-white"
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
              
              <div className="p-4 border-t border-neutral-800">
                <Link 
                  href="/" 
                  className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-300 hover:bg-neutral-800/50 hover:text-white transition-colors"
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
            <Link href="/admin/dashboard" className="flex items-center space-x-2">
              <InnoNexusLogo className="h-8 w-8 text-white" />
              <span className="text-lg font-semibold text-white">Admin</span>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-neutral-900/50">
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
    <SidebarProvider>
      <AdminLayoutContent>
        {children}
      </AdminLayoutContent>
    </SidebarProvider>
  );
}
