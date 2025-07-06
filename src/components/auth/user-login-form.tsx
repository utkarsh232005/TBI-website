
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { LogIn, Loader2, Users } from "lucide-react";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserData } from "@/app/actions/user-actions";
import { setCurrentUser } from "@/lib/client-utils";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type FormValues = z.infer<typeof formSchema>;

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

export default function UserLoginForm({ onForgotPassword }: { onForgotPassword?: () => void }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      console.log('Attempting login with:', { email: values.email });

      // Authenticate with Firebase Auth (client-side)
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const firebaseUser = userCredential.user;

      console.log('Firebase Auth successful:', { uid: firebaseUser.uid, email: firebaseUser.email });

      // Get user data from Firestore
      const userDataResult = await getUserData(firebaseUser.uid);

      if (!userDataResult.success || !userDataResult.data) {
        // If user document doesn't exist, sign out and show error
        await auth.signOut();
        toast({
          title: "Login Failed",
          description: "User profile not found. Please contact support.",
          variant: "destructive",
        });
        return;
      }

      const userData = userDataResult.data;

      // Check if user is active
      if (userData.status !== 'active') {
        // If user is not active, sign out and show error
        await auth.signOut();
        toast({
          title: "Login Failed",
          description: "Your account is not active. Please contact support.",
          variant: "destructive",
        });
        return;
      }

      // Store user data for the context
      const userForContext = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || values.email,
        name: userData.name || 'User',
      };
      setCurrentUser(userForContext);

      console.log('Login successful, user data stored:', userForContext);

      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });

      // Navigate to dashboard
      router.push('/user/dashboard');

    } catch (error: any) {
      console.error("Error during user login:", error);

      let errorMessage = "An unexpected error occurred. Please try again.";
      let toastVariant: 'warning' | 'destructive' = "destructive";

      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password. Please check your credentials and try again.";
        toastVariant = "warning";
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = "This account has been disabled. Please contact support.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed login attempts. Please try again later.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: toastVariant,
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
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 border border-gray-200 mb-3">
          <Users className="h-6 w-6 text-gray-700" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          User Access
        </h2>
        <p className="text-gray-600 text-xs font-medium">
          Sign in with your credentials
        </p>
      </motion.div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <LabelInputContainer>
          <Label htmlFor="user-email" className="text-gray-900 font-medium">Email Address</Label>
          <Input
            id="user-email"
            placeholder="your.email@example.com"
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
          <Label htmlFor="user-password" className="text-gray-900 font-medium">Password</Label>
          <Input
            id="user-password"
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
          className="group/btn relative block h-10 w-full rounded-lg bg-gray-900 hover:bg-gray-800 font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={isLoading}
        >
          <div className="flex items-center justify-center">
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <LogIn className="mr-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
            )}
            {isLoading ? "Signing in..." : "Sign in"}
          </div>
        </button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-xs text-center text-gray-600 pt-2 font-medium"
        >
          Accepted applicants can log in with their email and temporary password
        </motion.p>
      </form>
    </motion.div>
  );
}
