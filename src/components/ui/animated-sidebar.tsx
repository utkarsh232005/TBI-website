"use client";

import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconMenu2, IconX } from "@tabler/icons-react";
 
interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}
 
interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}
 
const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);
 
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};
 
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
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};
 
export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};
 
export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};
 
export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <>
      <motion.div
        className={cn(
          "h-full hidden md:flex md:flex-col relative sidebar-pulse",
          "bg-gradient-to-br from-white/99 via-slate-50/95 to-blue-50/90",
          "backdrop-blur-xl border-r border-slate-200/50",
          "shrink-0 overflow-hidden scrollbar-hide",
          "shadow-[0_20px_40px_rgba(0,0,0,0.06),0_8px_16px_rgba(59,130,246,0.08)]",
          "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/80 before:via-slate-50/60 before:to-blue-50/50 before:backdrop-blur-lg before:-z-10",
          "after:absolute after:top-0 after:left-0 after:w-full after:h-20 after:bg-gradient-to-b after:from-blue-500/3 after:via-indigo-500/2 after:to-transparent after:-z-10",
          "border-l-2 border-l-blue-400/20", // Added distinctive border marker
          className
        )}
        animate={{
          width: animate ? (open ? "240px" : "72px") : "240px",
        }}
        style={{ 
          boxShadow: "0 20px 40px rgba(0,0,0,0.06), 0 8px 16px rgba(59,130,246,0.08)"
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        {...props}
      >
        <div className="relative z-10 h-full flex flex-col px-2 py-4">
          {children as React.ReactNode}
        </div>
        
        {/* Elegant border accents */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-300/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-300/20 to-transparent"></div>
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-blue-300/20 to-transparent"></div>
      </motion.div>
    </>
  );
};
 
export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-16 px-4 py-3 flex flex-row md:hidden items-center justify-between",
          "bg-gradient-to-r from-white/98 via-blue-50/90 to-indigo-50/80",
          "backdrop-blur-xl border-b border-blue-200/40",
          "w-full shadow-[0_4px_24px_rgba(59,130,246,0.1)]",
          "relative",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/80 before:to-blue-50/60 before:backdrop-blur-sm before:-z-10"
        )}
        {...props}
      >
        <div className="flex justify-end z-20 w-full">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/12 to-indigo-500/12 border border-blue-300/40 backdrop-blur-sm hover:from-blue-500/20 hover:to-indigo-500/20 hover:border-blue-400/60 transition-all duration-300 shadow-sm hover:shadow-md">
            <IconMenu2
              className="text-blue-600 cursor-pointer hover:text-blue-700 transition-colors duration-200"
              onClick={() => setOpen(!open)}
              size={20}
            />
          </div>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 z-[100] flex flex-col justify-start",
                "bg-gradient-to-br from-white/98 via-blue-50/95 to-indigo-50/90",
                "backdrop-blur-xl p-6 pt-20",
                "shadow-[0_0_80px_rgba(59,130,246,0.2)]",
                "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/80 before:via-blue-50/40 before:to-indigo-50/30 before:-z-10",
                className
              )}
            >
              <div
                className="absolute right-6 top-6 z-50 p-2.5 rounded-xl bg-gradient-to-br from-slate-100/90 to-blue-100/80 border border-slate-300/50 backdrop-blur-sm hover:from-blue-100/90 hover:to-indigo-100/80 hover:border-blue-400/60 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
                onClick={() => setOpen(!open)}
              >
                <IconX className="text-slate-600 hover:text-blue-600 transition-colors duration-200" size={20} />
              </div>
              <div className="relative z-10">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
 
export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
}) => {
  const { open, animate } = useSidebar();
  return (
    <a
      href={link.href}
      className={cn(
        "flex items-center justify-start gap-3 group/sidebar py-2.5 px-3 rounded-lg",
        "relative overflow-hidden transition-all duration-300",
        "hover:bg-gradient-to-r hover:from-blue-50/80 hover:via-indigo-50/60 hover:to-slate-50/40",
        "hover:border-blue-300/40 hover:shadow-[0_6px_20px_rgba(59,130,246,0.15)]",
        "border border-transparent backdrop-blur-sm",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-blue-500/0 before:to-transparent",
        "hover:before:from-blue-500/8 hover:before:via-indigo-500/8 hover:before:to-purple-500/8",
        "before:transition-all before:duration-300",
        "hover:scale-[1.02] active:scale-[0.98]",
        "min-h-[44px]",
        "group/link",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100/90 to-indigo-100/80 group-hover/sidebar:from-blue-500/25 group-hover/sidebar:to-indigo-500/25 transition-all duration-300 shadow-sm group-hover/sidebar:shadow-md backdrop-blur-sm border border-blue-200/40 group-hover/sidebar:border-blue-400/60 flex-shrink-0 relative overflow-hidden">
        {/* Subtle shimmer effect */}
        <div className="absolute inset-0 shimmer-effect opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-500 rounded-lg"></div>
        
        <span className="text-blue-600 group-hover/sidebar:text-blue-700 transition-all duration-300 group-hover/sidebar:scale-105 flex items-center justify-center text-base font-medium relative z-10 group-hover/sidebar:rotate-1 transform">
          {link.icon}
        </span>
      </div>
 
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-slate-700 text-sm font-medium group-hover/sidebar:translate-x-1 group-hover/sidebar:text-slate-900 transition-all duration-300 whitespace-pre inline-block !p-0 !m-0 group-hover/sidebar:font-semibold min-w-0 flex-1"
      >
        {link.label}
      </motion.span>
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/0 via-indigo-400/0 to-purple-400/0 group-hover/sidebar:from-blue-400/6 group-hover/sidebar:via-indigo-400/6 group-hover/sidebar:to-purple-400/6 transition-all duration-500"></div>
      
      {/* Elegant shimmer effect */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover/sidebar:opacity-100 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 transition-opacity duration-500"></div>
    </a>
  );
};
