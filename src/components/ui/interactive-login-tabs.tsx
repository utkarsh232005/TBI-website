
"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Users, Shield } from "lucide-react";

const InteractiveLoginTabs = TabsPrimitive.Root;

const InteractiveLoginTabsList = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.List
        ref={ref}
        className={cn(
            "inline-flex h-12 items-center justify-center rounded-lg bg-gray-50 border border-gray-200 p-1 text-gray-700 shadow-sm",
            "relative overflow-hidden",
            className
        )}
        {...props}
    />
));
InteractiveLoginTabsList.displayName = TabsPrimitive.List.displayName;

interface InteractiveLoginTabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
    icon?: React.ReactNode;
    variant?: "user" | "admin";
}

const InteractiveLoginTabsTrigger = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    InteractiveLoginTabsTriggerProps
>(({ className, children, icon, variant = "user", ...props }, ref) => {
    const variantStyles = {
        user: {
            active: "data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900",
            hover: "hover:bg-gray-50"
        },
        admin: {
            active: "data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900",
            hover: "hover:bg-gray-50"
        }
    };

    return (
        <TabsPrimitive.Trigger
            ref={ref}
            className={cn(
                "relative group inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                "text-gray-600 hover:text-gray-900",
                variantStyles[variant].active,
                variantStyles[variant].hover,
                "data-[state=active]:text-gray-900 data-[state=active]:font-semibold",
                className
            )}
            {...props}
        >
            <motion.div
                className="flex items-center gap-2 relative z-10"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
                {icon && (
                    <motion.div
                        className="flex items-center"
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        {icon}
                    </motion.div>
                )}
                <span className="font-medium">{children}</span>
            </motion.div>
        </TabsPrimitive.Trigger>
    );
});
InteractiveLoginTabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const InteractiveLoginTabsContent = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
    <AnimatePresence mode="wait">
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{
                duration: 0.3,
                ease: "easeInOut",
                type: "spring",
                stiffness: 300,
                damping: 25
            }}
        >
            <TabsPrimitive.Content
                ref={ref}
                className={cn(
                    "mt-6 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    className
                )}
                {...props}
            />
        </motion.div>
    </AnimatePresence>
));
InteractiveLoginTabsContent.displayName = TabsPrimitive.Content.displayName;

export {
    InteractiveLoginTabs,
    InteractiveLoginTabsList,
    InteractiveLoginTabsTrigger,
    InteractiveLoginTabsContent,
};
