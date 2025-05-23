
import { cn } from "@/lib/utils";
import type React from "react";
import { motion } from "framer-motion";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-7xl grid-cols-1 gap-4 md:auto-rows-[18rem] md:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
};

const itemContentVariants = {
  rest: { x: 0 },
  hover: { x: 8, transition: { type: "spring", stiffness: 300, damping: 20 } },
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <motion.div
      className={cn(
        "group/bento row-span-1 flex flex-col justify-between space-y-4 rounded-xl border border-card-foreground/10 bg-card p-4 transition duration-200 hover:shadow-primary/20",
        className,
      )}
      whileHover={{ 
        scale: 1.02, 
        // Slightly change background on hover for better feedback if desired
        // backgroundColor: "hsla(var(--card-foreground-hsl), 0.03)", // Example: very subtle
        transition: { type: "spring", stiffness: 300, damping: 15 }
      }}
      // The variants for the inner content are controlled by the parent hover state
      // So, we need to pass the hover state down or use Framer Motion's group hover capabilities
      // For simplicity, we'll use variants on the inner content div and trigger it via the parent's whileHover
    >
      {header}
      <motion.div 
        className="transition-none" // Remove Tailwind transition as Framer Motion handles it
        variants={itemContentVariants}
        // This will animate when the parent `motion.div` (BentoGridItem) is hovered
      >
        {icon}
        <div className="mt-2 mb-2 font-poppins font-bold text-foreground">
          {title}
        </div>
        <div className="font-poppins text-xs font-normal text-muted-foreground">
          {description}
        </div>
      </motion.div>
    </motion.div>
  );
};
