
"use client";
import { cn } from "@/lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion"; // Changed from "motion/react" to "framer-motion" for typical usage

import React, { useRef, useState } from "react";
import { InnoNexusLogo as AppLogo } from '@/components/icons/innnexus-logo';
import Link from 'next/link';


interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: {
    name: string;
    link: string;
  }[];
  className?: string;
  onItemClick?: () => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const [visible, setVisible] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 100) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  return (
    <motion.div
      ref={ref}
      className={cn("sticky inset-x-0 top-0 z-50 w-full", className)} // Changed top-20 to top-0
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible },
            )
          : child,
      )}
    </motion.div>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        // boxShadow: visible // Kept boxShadow but ensure it respects dark theme
        //   ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
        //   : "none",
        width: visible ? "40%" : "100%",
        y: visible ? 20 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      style={{
        minWidth: "800px",
      }}
      className={cn(
        "relative z-[60] mx-auto hidden w-full max-w-screen-2xl flex-row items-center justify-between self-start rounded-full bg-transparent px-4 py-2 lg:flex dark:bg-transparent",
        visible && "bg-background/80 dark:bg-background/80 border border-border shadow-lg", // Adjusted for theme
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-muted-foreground transition duration-200 hover:text-foreground lg:flex lg:space-x-2", // Adjusted colors
        className,
      )}
    >
      {items.map((item, idx) => (
        <Link
          href={item.link}
          key={`link-${idx}`}
          onMouseEnter={() => setHovered(idx)}
          onClick={onItemClick}
          className="relative px-4 py-2 text-muted-foreground hover:text-primary dark:text-neutral-300" // Adjusted colors
        >
          {hovered === idx && (
            <motion.div
              layoutId="hovered"
              className="absolute inset-0 h-full w-full rounded-full bg-accent dark:bg-neutral-800" // Adjusted for theme
            />
          )}
          <span className="relative z-20">{item.name}</span>
        </Link>
      ))}
    </motion.div>
  );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        // boxShadow: visible // Kept boxShadow
        //   ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
        //   : "none",
        width: visible ? "90%" : "100%",
        paddingRight: visible ? "12px" : "0px",
        paddingLeft: visible ? "12px" : "0px",
        borderRadius: visible ? "1.5rem" : "0rem", // Changed from 4px to 2rem and then 0rem
        y: visible ? 20 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-transparent px-0 py-2 lg:hidden", // max-w original
        // "container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 lg:hidden", // Trying to match old navbar container
        visible && "bg-background/80 dark:bg-background/80 border border-border shadow-lg", // Adjusted for theme
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
}: MobileNavHeaderProps) => {
  return (
    <div
      className={cn(
        "flex w-full flex-row items-center justify-between px-4", // Added px-4 for padding
        className,
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
}: MobileNavMenuProps) => { // Removed onClose as it's handled by link clicks
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            "absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-lg bg-card px-4 py-8 shadow-xl dark:bg-card", // Adjusted for theme and shadow
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return isOpen ? (
    <IconX className="text-foreground dark:text-foreground" onClick={onClick} />
  ) : (
    <IconMenu2 className="text-foreground dark:text-foreground" onClick={onClick} />
  );
};

export const NavbarLogo = () => {
  return (
    <Link
      href="/"
      aria-label="InnoNexus Home"
      className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal"
    >
      <AppLogo className="h-8 w-auto" />
    </Link>
  );
};

export const NavbarButton = ({
  href,
  as: Tag = "button", // Default to button if not linking
  children,
  className,
  variant = "primary",
  onClick, // Added onClick to handle it for button type
  ...props
}: {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark" | "gradient" | "outline" | "ghost"; // Added more variants
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
} & (
  | React.ComponentPropsWithoutRef<"a">
  | React.ComponentPropsWithoutRef<"button">
)) => {
  // Using ShadCN buttonVariants for consistency
  const baseStyles = "px-4 py-2 rounded-md text-sm font-semibold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center";

  // Simplified variants, ideally map to globals.css theme
  const variantStyles = {
    primary: "bg-primary text-primary-foreground shadow-md",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    dark: "bg-neutral-900 text-white shadow-md", // Example dark variant
    gradient: "bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-md", // Example gradient
  };
  
  // Ensure props like 'type' are passed if Tag is 'button'
  const buttonProps = Tag === "button" ? { type: "button", ...props } : props;


  if (Tag === "a" && href) {
    return (
      <Link href={href} passHref legacyBehavior>
        <Tag
          className={cn(baseStyles, variantStyles[variant as keyof typeof variantStyles], className)}
          onClick={onClick}
          {...buttonProps}
        >
          {children}
        </Tag>
      </Link>
    );
  }
  
  return (
     <Tag
      className={cn(baseStyles, variantStyles[variant as keyof typeof variantStyles], className)}
      onClick={onClick}
      {...buttonProps}
    >
      {children}
    </Tag>
  );
};
