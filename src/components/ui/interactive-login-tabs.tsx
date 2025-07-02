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
            "inline-flex h-16 items-center justify-center rounded-2xl bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl border border-white/20 p-2 text-white shadow-2xl",
            "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-blue-500/5 before:to-purple-500/5 before:-z-10",
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
            active: "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:via-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:shadow-blue-500/25",
            hover: "hover:bg-gradient-to-r hover:from-blue-600/10 hover:to-purple-600/10"
        },
        admin: {
            active: "data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:via-pink-600 data-[state=active]:to-red-600 data-[state=active]:shadow-purple-500/25",
            hover: "hover:bg-gradient-to-r hover:from-purple-600/10 hover:to-pink-600/10"
        }
    };

    return (
        <TabsPrimitive.Trigger
            ref={ref}
            className={cn(
                "relative group inline-flex items-center justify-center whitespace-nowrap rounded-xl px-6 py-3 text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                "text-white/70 hover:text-white/90 hover:bg-white/5",
                variantStyles[variant].active,
                variantStyles[variant].hover,
                "data-[state=active]:text-white data-[state=active]:shadow-lg",
                "transform-gpu overflow-hidden",
                className
            )}
            {...props}
        >
            <motion.div
                className="flex items-center gap-3 relative z-10"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
                {icon && (
                    <motion.div
                        initial={{ rotate: 0 }}
                        whileHover={{ rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        {icon}
                    </motion.div>
                )}
                <span className="font-medium">{children}</span>
            </motion.div>

            {/* Animated Background Glow */}
            <motion.div
                className="absolute inset-0 rounded-xl opacity-0 group-data-[state=active]:opacity-20"
                style={{
                    background: variant === "user"
                        ? "linear-gradient(45deg, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3))"
                        : "linear-gradient(45deg, rgba(147, 51, 234, 0.3), rgba(236, 72, 153, 0.3))"
                }}
                animate={{
                    opacity: [0, 0.2, 0],
                    scale: [1, 1.05, 1],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Ripple Effect */}
            <motion.div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100"
                style={{
                    background: variant === "user"
                        ? "radial-gradient(circle at center, rgba(59, 130, 246, 0.1), transparent 70%)"
                        : "radial-gradient(circle at center, rgba(147, 51, 234, 0.1), transparent 70%)"
                }}
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.3 }}
            />
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
