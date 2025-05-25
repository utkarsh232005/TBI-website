"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  Home,
  User,
  Settings,
  LogOut
} from "lucide-react";
import { motion } from "framer-motion";

interface SidebarProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
  animate?: boolean;
}

interface SidebarBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SidebarLinkProps {
  link: {
    label: string;
    href: string;
    icon: React.ReactNode;
  };
  className?: string;
}

export const useSidebar = () => {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = React.createContext<SidebarContextProps | undefined>(undefined);

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: SidebarProps) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = ({ className, children, ...props }: SidebarBodyProps) => {
  return (
    <>
      <DesktopSidebar className={className} {...props}>
        {children}
      </DesktopSidebar>
      <MobileSidebar className={className} {...props}>
        {children}
      </MobileSidebar>
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { open, setOpen, animate } = useSidebar();
  
  return (
    <>
      <motion.div
        className={cn(
          "h-full px-4 py-4 hidden md:flex md:flex-col bg-[#121212] border-r border-[#2A2A2A] w-[300px] shrink-0",
          className
        )}
        animate={{
          width: animate ? (open ? "300px" : "60px") : "300px",
        }}
        transition={{
          duration: 0.3,
          ease: [0.25, 0.1, 0.25, 1.0]
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        {...props}
      >
        {children}
      </motion.div>
    </>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { open, setOpen } = useSidebar();
  
  return (
    <>
      <div
        className={cn(
          "h-10 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-[#121212] w-full border-b border-[#2A2A2A]"
        )}
        {...props}
      >
        <div className="flex justify-end z-20 w-full">
          <button 
            className="text-[#E0E0E0] hover:text-[#4F46E5] transition-colors"
            onClick={() => setOpen(!open)}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: [0.25, 0.1, 0.25, 1.0]
            }}
            className={cn(
              "fixed h-full w-full inset-0 bg-[#121212] p-10 z-[100] flex flex-col justify-between",
              className
            )}
          >
            <div
              className="absolute right-10 top-10 z-50 text-[#E0E0E0] hover:text-[#4F46E5] cursor-pointer transition-colors"
              onClick={() => setOpen(!open)}
            >
              <ChevronLeft className="h-6 w-6" />
            </div>
            {children}
          </motion.div>
        )}
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}: SidebarLinkProps) => {
  const { open, animate } = useSidebar();
  
  return (
    <a
      href={link.href}
      className={cn(
        "flex items-center justify-start gap-2 group/sidebar py-2 text-[#E0E0E0] hover:text-[#4F46E5] transition-colors duration-200",
        className
      )}
      {...props}
    >
      {link.icon}

      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        transition={{
          duration: 0.2,
          ease: [0.25, 0.1, 0.25, 1.0]
        }}
        className="text-[#E0E0E0] group-hover/sidebar:text-[#4F46E5] text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block"
      >
        {link.label}
      </motion.span>
    </a>
  );
};

export const Logo = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-medium text-[#E0E0E0]"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-[#4F46E5]" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-[#E0E0E0]"
      >
        TBI Admin
      </motion.span>
    </a>
  );
};

export const LogoIcon = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-medium text-[#E0E0E0]"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-[#4F46E5]" />
    </a>
  );
};

export default function SidebarDemo() {
  const links = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: <Home className="h-5 w-5 shrink-0 text-[#E0E0E0] group-hover/sidebar:text-[#4F46E5]" />
    },
    {
      label: "Applications",
      href: "/admin/applications",
      icon: <User className="h-5 w-5 shrink-0 text-[#E0E0E0] group-hover/sidebar:text-[#4F46E5]" />
    },
    {
      label: "Events",
      href: "/admin/events",
      icon: <Settings className="h-5 w-5 shrink-0 text-[#E0E0E0] group-hover/sidebar:text-[#4F46E5]" />
    },
    {
      label: "Logout",
      href: "/logout",
      icon: <LogOut className="h-5 w-5 shrink-0 text-[#E0E0E0] group-hover/sidebar:text-[#4F46E5]" />
    },
  ];
  
  const [open, setOpen] = useState(true);
  
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#121212] md:flex-row shadow-[0_4px_20px_rgba(0,0,0,0.3)]",
        "h-screen"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: "Admin User",
                href: "#",
                icon: (
                  <div className="h-7 w-7 shrink-0 rounded-full bg-[#4F46E5] flex items-center justify-center">
                    <span className="text-white text-xs">AU</span>
                  </div>
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex flex-1">
        <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border-l border-[#2A2A2A] bg-[#121212] p-2 md:p-10">
          <h1 className="text-2xl font-bold text-[#E0E0E0] mb-6">Admin Panel</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, idx) => (
              <div 
                key={`stat-card-${idx}`} 
                className="bg-[#1A1A1A] p-4 rounded-2xl border border-[#2A2A2A] shadow-[0_4px_15px_rgba(0,0,0,0.2)]"
              >
                <div className="text-sm text-[#9CA3AF] mb-1">Stat Title</div>
                <div className="text-2xl font-bold text-[#E0E0E0]">1,234</div>
                <div className="text-xs text-[#4F46E5] mt-2">+12% from last week</div>
              </div>
            ))}
          </div>
          <div className="flex flex-1 gap-4">
            <div className="w-full h-full rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.2)]">
              <h2 className="text-lg font-semibold text-[#E0E0E0] mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {[...Array(5)].map((_, idx) => (
                  <div key={`activity-${idx}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#252525] transition-colors">
                    <div className="h-8 w-8 rounded-full bg-[#252525] flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-[#4F46E5]" />
                    </div>
                    <div>
                      <div className="text-sm text-[#E0E0E0]">Activity description here</div>
                      <div className="text-xs text-[#9CA3AF]">3 hours ago</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
