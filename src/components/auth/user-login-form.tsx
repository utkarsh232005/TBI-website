
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { LogIn, Loader2 } from "lucide-react";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserData } from "@/app/actions/user-actions";
import { setCurrentUser } from "@/lib/client-utils";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type FormValues = z.infer<typeof formSchema>;

export default function UserLoginForm() {
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
      
      // Handle specific Firebase Auth errors
      let errorMessage = "An unexpected error occurred.";
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Invalid email or password.";
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = "This account has been disabled.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed login attempts. Please try again later.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-montserrat text-2xl text-accent">User Login</CardTitle>
        <CardDescription>
          Sign in with your email address and password provided after acceptance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      {...field}
                      className="bg-card border-border focus:border-accent focus:ring-accent"
                      // Removed disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      className="bg-card border-border focus:border-accent focus:ring-accent"
                      // Removed disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" size="lg" className="w-full font-poppins font-semibold group bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              )}
              Login
            </Button>
            <p className="text-xs text-center text-muted-foreground pt-2">
              Accepted applicants can log in with their email and temporary password.
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
