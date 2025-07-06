
"use client";

import { useState } from 'react';
import AdminLoginForm from "@/components/auth/admin-login-form";
import UserLoginForm from "@/components/auth/user-login-form";
import MentorLoginForm from "@/components/auth/mentor-login-form"; // Import the new mentor form
import { InnoNexusLogo } from "@/components/icons/innnexus-logo";
import { PasswordResetDialog } from "@/components/ui/password-reset-dialog";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, Shield, UserCheck } from "lucide-react"; // Import a new icon for mentor
import {
  InteractiveLoginTabs,
  InteractiveLoginTabsList,
  InteractiveLoginTabsTrigger,
  InteractiveLoginTabsContent,
} from "@/components/ui/interactive-login-tabs";

export default function LoginPage() {
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Professional Background Pattern */}
      <div className="absolute inset-0 bg-white/40"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(156,163,175,0.1),transparent_50%)]"></div>

      {/* Subtle geometric pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 border border-gray-300 rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 border border-gray-300 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-gray-300 rounded-full"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 text-center"
        >
          <Link href="/" aria-label="Go to homepage">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <InnoNexusLogo className="h-16 w-auto mx-auto mb-6 text-gray-700" />
            </motion.div>
          </Link>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="font-inter text-2xl md:text-3xl font-bold text-gray-900 mb-2"
          >
            Welcome Back
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-4"
          >
            <p className="text-gray-800 text-lg font-bold tracking-wide">
              RCOEM-TBI
            </p>
            <p className="text-gray-600 text-sm font-medium -mt-1">
              Technology Business Incubator
            </p>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-gray-600 text-sm font-medium"
          >
            Sign in to access your account
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="w-full max-w-md"
        >
          <InteractiveLoginTabs defaultValue="user" className="w-full">
            <InteractiveLoginTabsList className="grid w-full grid-cols-3 mb-6">
              <InteractiveLoginTabsTrigger
                value="user"
                variant="user"
                icon={<Users className="h-4 w-4" />}
              >
                User
              </InteractiveLoginTabsTrigger>
              <InteractiveLoginTabsTrigger
                value="mentor"
                variant="user" // Using user variant styles for mentor
                icon={<UserCheck className="h-4 w-4" />}
              >
                Mentor
              </InteractiveLoginTabsTrigger>
              <InteractiveLoginTabsTrigger
                value="admin"
                variant="admin"
                icon={<Shield className="h-4 w-4" />}
              >
                Admin
              </InteractiveLoginTabsTrigger>
            </InteractiveLoginTabsList>
            <InteractiveLoginTabsContent value="user">
              <UserLoginForm onForgotPassword={() => setIsPasswordResetOpen(true)} />
            </InteractiveLoginTabsContent>
            <InteractiveLoginTabsContent value="mentor">
              <MentorLoginForm onForgotPassword={() => setIsPasswordResetOpen(true)} />
            </InteractiveLoginTabsContent>
            <InteractiveLoginTabsContent value="admin">
              <AdminLoginForm onForgotPassword={() => setIsPasswordResetOpen(true)} />
            </InteractiveLoginTabsContent>
          </InteractiveLoginTabs>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-8 text-center text-sm text-gray-600 font-medium"
        >
          Don&apos;t have an account?{' '}
          <Link href="/#contact" className="text-gray-900 hover:text-gray-700 underline underline-offset-4 transition-colors duration-200 font-semibold">
            Apply for Incubation
          </Link>
        </motion.p>
      </div>

      {/* Password Reset Dialog */}
      <PasswordResetDialog
        isOpen={isPasswordResetOpen}
        onClose={() => setIsPasswordResetOpen(false)}
      />
    </div>
  );
}
