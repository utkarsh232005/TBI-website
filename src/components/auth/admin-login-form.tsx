
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
import { useRouter } from "next/navigation"; // Corrected import
import { LogIn } from "lucide-react";

// IMPORTANT: These are hardcoded for demonstration purposes ONLY.
// In a production environment, this is highly insecure.
const ADMIN_EMAIL = "admin@innnexus.com";
const ADMIN_PASSWORD = "secureadminpassword"; // Please change this if you deploy this anywhere

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export type AdminLoginFormValues = z.infer<typeof formSchema>;

export default function AdminLoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: AdminLoginFormValues) {
    if (values.email === ADMIN_EMAIL && values.password === ADMIN_PASSWORD) {
      toast({
        title: "Admin Login Successful",
        description: "Redirecting to admin dashboard...",
      });
      // In a real app, you would set some kind of session/token here
      router.push("/admin/dashboard");
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid admin email or password.",
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-orbitron text-2xl">Admin Portal</CardTitle>
        <CardDescription>
          Enter your administrator credentials to access the admin panel.
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" size="lg" className="w-full font-poppins font-semibold group">
              Login as Admin
              <LogIn className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
