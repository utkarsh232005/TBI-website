
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
import { verifyUserCredentials, type UserLoginFormValues, type VerifyUserCredentialsResponse } from "@/app/actions/auth-actions";
import { setFirstLoginFlag, setCurrentUser } from "@/lib/client-utils";

const formSchema = z.object({
  identifier: z.string().min(1, { message: "User ID or Email is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export default function UserLoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UserLoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  async function onSubmit(values: UserLoginFormValues) {
    setIsLoading(true);
    try {
      const result: VerifyUserCredentialsResponse = await verifyUserCredentials(values);      if (result.success) {
        // Only set first login flag if onboarding hasn't been completed
        const hasCompletedOnboarding = localStorage.getItem('onboarding_completed') === 'true';
        if (!hasCompletedOnboarding) {
          setFirstLoginFlag();
        }
        
        // Store user data if provided
        if (result.userData) {
          setCurrentUser(result.userData);
        }
        
        toast({
          title: "Login Successful",
          description: result.message || "Redirecting to dashboard...",
        });
        
        // Small delay to ensure localStorage is written before redirect
        if (result.redirectTo) {
          setTimeout(() => {
            router.push(result.redirectTo!);
          }, 100);
        }
      } else {
        toast({
          title: "Login Failed",
          description: result.message || "Invalid credentials or user not found.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error during user login submission: ", error);
      toast({
        title: "Login Error",
        description: error.message || "An unexpected error occurred.",
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
          Sign in with your temporary User ID or Email and Password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">User ID / Email</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Your User ID or Email"
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
              Accepted applicants can log in with their temporary credentials.
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
