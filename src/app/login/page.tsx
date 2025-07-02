
"use client";

import AdminLoginForm from "@/components/auth/admin-login-form";
import UserLoginForm from "@/components/auth/user-login-form";
import { InnoNexusLogo } from "@/components/icons/innnexus-logo";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, Shield } from "lucide-react";
import {
  InteractiveLoginTabs,
  InteractiveLoginTabsList,
  InteractiveLoginTabsTrigger,
  InteractiveLoginTabsContent,
} from "@/components/ui/interactive-login-tabs";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-slate-900/50 to-black"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <Link href="/" aria-label="Go to homepage">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <InnoNexusLogo className="h-16 w-auto mx-auto mb-4 text-white drop-shadow-lg" />
            </motion.div>
          </Link>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="font-montserrat text-4xl md:text-5xl font-bold text-white mb-2"
          >
            Welcome Back
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-gray-300 text-lg"
          >
            Sign in to access your RCOEM-TBI account
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="w-full max-w-md"
        >
          <InteractiveLoginTabs defaultValue="user" className="w-full">
            <InteractiveLoginTabsList className="grid w-full grid-cols-2">
              <InteractiveLoginTabsTrigger
                value="user"
                variant="user"
                icon={<Users className="h-4 w-4" />}
              >
                User Portal
              </InteractiveLoginTabsTrigger>
              <InteractiveLoginTabsTrigger
                value="admin"
                variant="admin"
                icon={<Shield className="h-4 w-4" />}
              >
                Admin Portal
              </InteractiveLoginTabsTrigger>
            </InteractiveLoginTabsList>
            <InteractiveLoginTabsContent value="user">
              <UserLoginForm />
            </InteractiveLoginTabsContent>
            <InteractiveLoginTabsContent value="admin">
              <AdminLoginForm />
            </InteractiveLoginTabsContent>
          </InteractiveLoginTabs>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-8 text-center text-sm text-gray-300"
        >
          Don&apos;t have an account?{' '}
          <Link href="/#contact" className="text-purple-400 hover:text-purple-300 underline underline-offset-4 transition-colors duration-200">
            Apply for Incubation
          </Link>
        </motion.p>
      </div>
    </div>
  );
}
