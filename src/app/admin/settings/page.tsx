// src/app/admin/settings/page.tsx
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
import { useState } from "react";
import { Loader2, Save, ShieldAlert } from "lucide-react";
import { performUpdateAdminCredentials } from "@/app/actions/settings-actions";

const settingsFormSchema = z.object({
  newEmail: z.string().email({ message: "Please enter a valid email address." }),
  newPassword: z.string().min(8, { message: "New password must be at least 8 characters." }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      newEmail: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: SettingsFormValues) {
    setIsLoading(true);
    try {
      const result = await performUpdateAdminCredentials(values.newEmail, values.newPassword);
      if (result.success) {
        toast({
          title: "Credentials Updated",
          description: result.message,
        });
        form.reset();
      } else {
        toast({
          title: "Update Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error updating admin credentials:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-orbitron">
            <ShieldAlert className="mr-3 h-7 w-7 text-primary" />
            Admin Credentials
          </CardTitle>
          <CardDescription>
            Update the administrator email and password.
            <br />
            <span className="text-xs text-destructive">
              Warning: Passwords are currently stored in plaintext in Firestore for this demonstration. This is highly insecure for production.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="newEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Admin Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="newadmin@example.com" 
                        {...field} 
                        disabled={isLoading}
                        className="bg-card border-border focus:border-primary focus:ring-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                        disabled={isLoading}
                        className="bg-card border-border focus:border-primary focus:ring-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                        disabled={isLoading}
                        className="bg-card border-border focus:border-primary focus:ring-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Update Credentials
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">
        Remember to use strong, unique passwords. After updating, you will need to use the new credentials to log in.
      </p>
    </div>
  );
}
