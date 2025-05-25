"use client";

import React, { createContext, useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconChevronRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface SidebarContextType {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  className,
}: {
  children: React.ReactNode;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
}) => {
  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      <div
        className={cn(
          "relative h-full w-20 flex-col items-center justify-between border-r border-neutral-200 bg-gray-100 px-2 pb-5 pt-4 transition-all dark:border-neutral-700 dark:bg-[#121212]",
          open && "w-60 px-4",
          className
        )}
      >
        <button
          className="absolute -right-3 top-10 z-30 grid h-6 w-6 place-items-center rounded-full border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800"
          onClick={() => setOpen(!open)}
        >
          <IconChevronRight
            className={cn(
              "h-3 w-3 transition-transform",
              open && "rotate-180"
            )}
          />
        </button>
        {children}
      </div>
    </SidebarContext.Provider>
  );
};

export const SidebarBody = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn("flex h-full flex-col items-center gap-4", className)}
    >
      {children}
    </div>
  );
};

export const SidebarLink = ({
  link,
  className,
}: {
  link: {
    label: string;
    href: string;
    icon: React.ReactNode;
  };
  className?: string;
}) => {
  const { open } = useSidebar();
  return (
    <a
      href={link.href}
      className={cn(
        "group flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 transition-all duration-150 ease-in-out hover:bg-neutral-200 dark:hover:bg-neutral-700",
        open ? "justify-start" : "justify-center",
        className
      )}
    >
      {link.icon}
      <AnimatePresence mode="wait" initial={false}>
        {open && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="flex-1 whitespace-nowrap text-sm font-semibold text-neutral-700 dark:text-neutral-200"
          >
            {link.label}
          </motion.span>
        )}
      </AnimatePresence>
    </a>
  );
};
