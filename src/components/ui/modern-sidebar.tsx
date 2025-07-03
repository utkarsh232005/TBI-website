"use client";
import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconMenu2, IconX } from "@tabler/icons-react";

export interface Links {
  label: string;
  href: string;
  icon: React.ReactNode;
  disabled?: boolean;
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
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      {children}
    </SidebarContext.Provider>
  );
};
 
export const ModernSidebar = ({
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
 
export const ModernSidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
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
    <motion.div
      className={cn(
        "h-full px-4 py-6 hidden md:flex flex-col bg-white w-[280px] shrink-0",
        "border-r border-gray-100 shadow-sm",
        className
      )}
      animate={{
        width: animate ? (open ? "280px" : "80px") : "280px",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
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
          "h-16 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-white w-full border-b border-gray-100 shadow-sm"
        )}
        {...props}
      >
        <div className="flex items-center gap-2">
          <IconMenu2
            className="text-gray-700 h-6 w-6"
            onClick={() => setOpen(!open)}
          />
          <span className="text-gray-700 font-medium">Admin Panel</span>
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
            className="fixed h-full w-full inset-0 bg-white p-6 z-[100] flex flex-col"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold text-gray-800">Menu</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
              >
                <IconX className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
  const [isActive, setIsActive] = React.useState(false);
  
  // Use useEffect to safely access window object on client side
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsActive(window.location.pathname === link.href);
    }
  }, [link.href]);

  return (
    <a
      href={link.disabled ? '#' : link.href}
      className={cn(
        "flex items-center justify-start gap-3 group/sidebar py-3 px-3 rounded-xl transition-colors",
        isActive 
          ? "bg-blue-50 text-blue-600 border border-blue-200" 
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-800",
        link.disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={(e) => {
        if (link.disabled) {
          e.preventDefault();
        }
      }}
      {...props}
    >
      <div className={cn(
        "flex items-center justify-center h-8 w-8 rounded-lg",
        isActive 
          ? "bg-blue-100 text-blue-600" 
          : "bg-gray-100 text-gray-600 group-hover/sidebar:bg-gray-200/80"
      )}>
        {React.cloneElement(link.icon as React.ReactElement, {
          className: "h-4 w-4"
        })}
      </div>
 
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-sm font-medium whitespace-nowrap transition-colors"
      >
        {link.label}
      </motion.span>
    </a>
  );
};
