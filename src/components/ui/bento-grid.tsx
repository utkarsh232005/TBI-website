
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
        transition: { type: "spring", stiffness: 300, damping: 15 }
      }}
    >
      {header}
      <motion.div 
        className="transition-none" 
        variants={itemContentVariants}
      >
        {icon}
        <div className="font-poppins mt-2 mb-2 font-bold text-foreground dark:text-neutral-900"> {/* Updated to text-foreground and dark:text-neutral-900 for dark text in dark mode */}
          {title}
        </div>
        <div className="font-poppins text-xs font-normal text-muted-foreground dark:text-neutral-700"> {/* Updated to text-muted-foreground and dark:text-neutral-700 for dark text in dark mode */}
          {description}
        </div>
      </motion.div>
    </motion.div>
  );
};
