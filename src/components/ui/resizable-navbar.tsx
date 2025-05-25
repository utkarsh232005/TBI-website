
"use client";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useScroll, useMotionValueEvent, type Variants } from "framer-motion";
import Link from 'next/link';
import React, { useRef, useState } from "react";


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
    isButton?: boolean;
    onClick?: () => void;
  }[];
  className?: string;
  onItemClick?: () => void;
  hoveredItem: string | null;
  setHoveredItem: (name: string | null) => void;
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
      className={cn("sticky inset-x-0 top-0 z-50 w-full", className)}
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
        "relative z-[60] mx-auto hidden w-full max-w-screen-2xl flex-row items-center justify-between self-start rounded-full bg-transparent px-4 py-2 lg:flex",
        visible && "bg-background/80 border border-border shadow-lg",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        width: visible ? "90%" : "100%",
        paddingRight: visible ? "12px" : "0px",
        paddingLeft: visible ? "12px" : "0px",
        borderRadius: visible ? "1.5rem" : "0rem",
        y: visible ? 20 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-transparent px-0 py-2 lg:hidden",
        visible && "bg-background/80 border border-border shadow-lg",
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
        "flex w-full flex-row items-center justify-between px-4",
        className,
      )}
    >
      {children}
    </div>
  );
};

const Path = (props: {d?: string; variants: Variants; transition?: { duration: number }; initial?: string | boolean | undefined; animate?: string | undefined;}) => (
  <motion.path
    fill="transparent"
    strokeWidth="3"
    stroke="currentColor" 
    strokeLinecap="round"
    {...props}
  />
);

const AnimatedMenuToggleSVG = ({ isOpen }: { isOpen: boolean }) => (
  <motion.svg
    width="23"
    height="23"
    viewBox="0 0 23 23"
    initial={false} 
    animate={isOpen ? "open" : "closed"}
    className="text-foreground" 
  >
    <Path
      variants={{
        closed: { d: "M 2 2.5 L 20 2.5" },
        open: { d: "M 3 16.5 L 17 2.5" },
      }}
      transition={{ duration: 0.3 }}
    />
    <Path
      d="M 2 9.423 L 20 9.423"
      variants={{
        closed: { opacity: 1 },
        open: { opacity: 0 },
      }}
      transition={{ duration: 0.1 }}
    />
    <Path
      variants={{
        closed: { d: "M 2 16.346 L 20 16.346" },
        open: { d: "M 3 2.5 L 17 16.346" },
      }}
      transition={{ duration: 0.3 }}
    />
  </motion.svg>
);


export const MobileNavMenu = ({
  children,
  className,
  isOpen,
}: MobileNavMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            "absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-lg bg-card px-4 py-8 shadow-xl",
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
  return (
    <button
      onClick={onClick}
      className="p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background text-foreground"
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
    >
      <AnimatedMenuToggleSVG isOpen={isOpen} />
    </button>
  );
};

export const NavbarLogo = () => {
  return (
    <Link
      href="/"
      aria-label="RCEOM-TBI Home"
      className="relative z-20 flex items-center px-2 py-1"
    >
      <span className="font-montserrat text-2xl font-bold text-primary"> {/* Changed to Montserrat */}
        TBI
      </span>
    </Link>
  );
};

export const NavbarButton = ({
  href,
  as: Tag = "button",
  children,
  className,
  variant = "primary",
  onClick,
  ...props
}: {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
} & (
  | React.ComponentPropsWithoutRef<"a">
  | React.ComponentPropsWithoutRef<"button">
)) => {

  const baseStyles = "px-6 py-2 rounded-full text-base font-normal relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center";


  const variantStyles = {
    primary: "bg-primary text-primary-foreground shadow-md hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-border bg-transparent text-muted-foreground hover:text-foreground hover:border-foreground", // Updated to use theme variables
    ghost: "hover:bg-accent hover:text-accent-foreground text-foreground",
  };

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
