
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
import { verifyAdminCredentials, type AdminLoginFormValues } from "@/app/actions/auth-actions";


const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});


export default function AdminLoginForm() {
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
      const result = await verifyAdminCredentials(values);
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
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("[AdminLoginForm] Error during login submission: ", error);
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
        <CardTitle className="font-montserrat text-2xl">Admin Portal</CardTitle> {/* Changed to Montserrat */}
        <CardDescription>
          Enter your administrator credentials to access the RCEOM-TBI admin panel.
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
                  <FormLabel className="text-foreground">Admin Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="admin@example.com"
                      {...field}
                      className="bg-card border-border focus:border-primary focus:ring-primary"
                      disabled={isLoading}
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
                      className="bg-card border-border focus:border-primary focus:ring-primary"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" size="lg" className="w-full font-poppins font-semibold group" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              )}
              Login as Admin
            </Button>
          </form>
        </Form>
         <p className="mt-4 text-xs text-center text-muted-foreground">
          Security Warning: Admin passwords should be stored hashed. This demo stores them in plaintext in Firestore for simplicity. Do not use this approach in production.
        </p>
      </CardContent>
    </Card>
  );
}
