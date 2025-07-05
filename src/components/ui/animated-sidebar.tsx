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
          "h-full hidden md:flex md:flex-col relative",
          "bg-white border-r border-gray-200",
          "shrink-0 overflow-hidden",
          "shadow-sm",
          className
        )}
        animate={{
          width: animate ? (open ? "240px" : "80px") : "240px",
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        {...props}
      >
        <div className="relative z-10 h-full flex flex-col px-3 py-4">
          {children as React.ReactNode}
        </div>
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
          "bg-white border-b border-gray-200",
          "w-full shadow-sm",
          "relative",
          className
        )}
        {...props}
      >
        <div className="flex justify-end z-20 w-full">
          <div className="p-2.5 rounded-lg bg-gray-100 border border-gray-200 hover:bg-gray-200 transition-all duration-200">
            <IconMenu2
              className="text-gray-600 cursor-pointer hover:text-gray-800 transition-colors duration-200"
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
                "bg-white p-6 pt-20",
                "shadow-lg"
              )}
            >
              <div
                className="absolute right-6 top-6 z-50 p-2.5 rounded-lg bg-gray-100 border border-gray-200 hover:bg-gray-200 transition-all duration-200 cursor-pointer"
                onClick={() => setOpen(!open)}
              >
                <IconX className="text-gray-600 hover:text-gray-800 transition-colors duration-200" size={20} />
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
        "flex items-center justify-start gap-3 group/sidebar py-3 px-3 rounded-lg",
        "relative transition-all duration-200",
        "hover:bg-gray-50 hover:border-gray-300",
        "border border-transparent",
        "min-h-[44px]",
        "group/link",
        className
      )}
      {...props}
    >
      <span className="text-gray-500 group-hover/sidebar:text-gray-700 transition-colors">
        {link.icon}
      </span>

      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-gray-700 text-sm font-medium group-hover/sidebar:text-gray-900 transition-all duration-200 whitespace-pre inline-block !p-0 !m-0 min-w-0 flex-1"
      >
        {link.label}
      </motion.span>
    </a>
  );
};
