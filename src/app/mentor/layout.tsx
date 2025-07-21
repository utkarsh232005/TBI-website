// src/app/mentor/layout.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  MessageSquare,
  ClipboardCheck,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { clearUserSession } from "@/lib/client-utils";
import { logoutUser } from "@/app/actions/auth-actions";
import { InnoNexusLogo } from "@/components/icons/innnexus-logo";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import NotificationsPanel from "@/components/ui/notifications-panel";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

function MentorLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { open, setOpen } = useSidebar();

  React.useEffect(() => {
    if (window.innerWidth < 768) {
      setOpen(false);
    }
  }, [pathname, setOpen]);

  const navItems: NavItem[] = [
    {
      href: "/mentor/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      href: "/mentor/requests",
      label: "Requests",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      href: "/mentor/my-mentees",
      label: "My Mentees",
      icon: <Users className="h-5 w-5" />,
    },
    {
      href: "/mentor/evaluation",
      label: "Evaluation",
      icon: <ClipboardCheck className="h-5 w-5" />,
    },
    {
      href: "/mentor/profile",
      label: "Profile",
      icon: <User className="h-5 w-5" />,
    },
  ];

  const handleLogout = async () => {
    try {
      await logoutUser();
      clearUserSession();
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
    <div className="flex h-screen bg-gray-50 text-gray-800">
      <Sidebar>
        <SidebarBody>
            <div className="flex items-center justify-center h-16 border-b border-gray-200">
               <InnoNexusLogo className="h-8 w-8 text-gray-800" text="Mentor Panel" />
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-4">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <SidebarLink
                      link={{
                          href: item.href,
                          label: item.label,
                          icon: item.icon,
                      }}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        pathname === item.href
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                        item.disabled && 'opacity-50 cursor-not-allowed'
                      )}
                      onClick={(e) => {
                        if(item.disabled) e.preventDefault();
                        handleMobileLinkClick();
                      }}
                    />
                  </li>
                ))}
              </ul>
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
        <header className="md:hidden flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-white">
          <Link href="/mentor/dashboard" className="flex items-center space-x-2">
            <InnoNexusLogo className="h-8 w-8 text-gray-800" text="Mentor" />
          </Link>
          <button onClick={() => setOpen(!open)} className="p-2">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </header>

        <header className="hidden md:flex items-center justify-end h-16 px-6 bg-white border-b border-gray-200">
            {user?.email && <NotificationsPanel userId={user.email} />}
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <SidebarProvider>
        <MentorLayoutContent>
            {children}
        </MentorLayoutContent>
      </SidebarProvider>
  );
}
