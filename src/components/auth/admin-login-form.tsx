
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { LogIn, Loader2, Shield } from "lucide-react";
import { useState } from "react";
import { verifyAdminCredentials, type AdminLoginFormValues, type VerifyUserCredentialsResponse } from "@/app/actions/auth-actions";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { group } from "console";
import all from "gsap/all";
import { relative } from "path";
import { text } from "stream/consumers";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};

export default function AdminLoginForm({ onForgotPassword }: { onForgotPassword?: () => void }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: AdminLoginFormValues) {
    setIsLoading(true);
    console.log("[AdminLoginForm] Attempting login with:", values);
    try {
      const result: VerifyUserCredentialsResponse = await verifyAdminCredentials(values);
      console.log("[AdminLoginForm] Verification result:", result);

      if (result.success) {
        toast({
          title: "Admin Login Successful",
          description: "Redirecting to admin dashboard...",
        });
        if (result.redirectTo) {
          console.log("[AdminLoginForm] Credentials correct. Attempting to redirect to", result.redirectTo);
          setTimeout(() => {
            console.log("[AdminLoginForm] router.push('", result.redirectTo, "') was called.");
            router.push(result.redirectTo!);
          }, 0);
        }
      } else {
        toast({
          title: "Login Failed",
          description: result.message || "An unknown error occurred.",
          variant: "warning",
        });
      }
    } catch (error: any) {
      console.error("[AdminLoginForm] Error during login submission: ", error);
      let message = "An unexpected error occurred.";
      if (error.code === 'permission-denied' || (error.message && (error.message.toLowerCase().includes('permission denied') || error.message.toLowerCase().includes('insufficient permissions')))) {
        message = 'Login Failed: Firestore permission denied. Please check your Firestore security rules to allow reading the admin credentials document.';
      } else if (error instanceof Error) {
        message = error.message;
      }
      toast({
        title: "Login Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mx-auto w-full max-w-md rounded-2xl bg-white shadow-lg border border-gray-200 p-6"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-center mb-6"
      >
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 border border-gray-700 mb-3">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Admin Access
        </h2>
        <p className="text-gray-600 text-xs font-medium">
          Enter administrator credentials
        </p>
      </motion.div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <LabelInputContainer>
          <Label htmlFor="admin-email" className="text-gray-900 font-medium">Admin Email</Label>
          <Input
            id="admin-email"
            placeholder="admin@rcoem.edu"
            type="email"
            {...form.register("email")}
            className="bg-gray-50 border border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-gray-600 focus:ring-2 focus:ring-gray-600/20 transition-all duration-200"
            disabled={isLoading}
          />
          {form.formState.errors.email && (
            <p className="text-red-600 text-sm font-medium">{form.formState.errors.email.message}</p>
          )}
        </LabelInputContainer>

        <LabelInputContainer>
          <Label htmlFor="admin-password" className="text-gray-900 font-medium">Password</Label>
          <Input
            id="admin-password"
            placeholder="••••••••"
            type="password"
            {...form.register("password")}
            className="bg-gray-50 border border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-gray-600 focus:ring-2 focus:ring-gray-600/20 transition-all duration-200"
            disabled={isLoading}
          />
          {form.formState.errors.password && (
            <p className="text-red-600 text-sm font-medium">{form.formState.errors.password.message}</p>
          )}
          {/* Forgot Password Link */}
          {onForgotPassword && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm text-gray-700 hover:text-gray-900 transition-colors font-medium"
                disabled={isLoading}
              >
                Forgot your password?
              </button>
            </div>
          )}
        </LabelInputContainer>

        <button
          className="group/btn relative block h-10 w-full rounded-lg bg-gray-800 hover:bg-gray-900 font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={isLoading}
        >
          <div className="flex items-center justify-center">
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Shield className="mr-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
            )}
            {isLoading ? "Signing in..." : "Sign in as Admin"}
          </div>
        </button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-xs text-center text-gray-600 pt-2 font-medium"
        >
          Security Warning: Admin passwords should be stored hashed. This demo stores them in Firestore for simplicity.
        </motion.p>
      </form>
    </motion.div>
  );
}
