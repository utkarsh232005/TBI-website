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
    <div className="w-full py-6 px-4 sm:px-6 relative">
      <Card className="bg-[#121212] border border-[#2A2A2A] shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-2xl overflow-hidden">
        <CardHeader className="bg-[#1A1A1A] border-b border-[#2A2A2A] p-6">
          <div className="flex flex-col">
            <CardTitle className="text-[#E0E0E0] text-2xl font-bold tracking-tight">ADMIN CREDENTIALS</CardTitle>
            <CardDescription className="text-[#9CA3AF] mt-1">
              Update the administrator email and password.
              <div className="flex items-center mt-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl hover:bg-rose-500/15 transition-colors duration-200">
                <ShieldAlert className="h-5 w-5 text-rose-500 mr-2 flex-shrink-0" />
                <span className="text-xs text-rose-400">
                  Warning: Passwords are currently stored in plaintext in Firestore for this demonstration. This is highly insecure for production.
                </span>
              </div>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="bg-[#151515] p-6 rounded-2xl border border-[#2A2A2A] shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.3)] transition-all duration-200">
                <h3 className="text-[#E0E0E0] font-medium mb-4">Authentication Details</h3>
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="newEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#E0E0E0] font-medium">New Admin Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="email" 
                              placeholder="newadmin@example.com" 
                              {...field} 
                              disabled={isLoading}
                              className="bg-[#252525] border-[#3A3A3A] text-[#E0E0E0] focus:border-[#4F46E5] focus:ring-[#4F46E5]/20 rounded-xl h-11 pl-4 pr-4 shadow-sm placeholder:text-[#6B7280] transition-all duration-200 hover:border-[#4F46E5]/50 focus:shadow-[0_0_0_2px_rgba(79,70,229,0.2)]"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-rose-400 text-sm mt-1.5" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#E0E0E0] font-medium">New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="password" 
                              placeholder="••••••••" 
                              {...field} 
                              disabled={isLoading}
                              className="bg-[#252525] border-[#3A3A3A] text-[#E0E0E0] focus:border-[#4F46E5] focus:ring-[#4F46E5]/20 rounded-xl h-11 pl-4 pr-4 shadow-sm placeholder:text-[#6B7280] transition-all duration-200 hover:border-[#4F46E5]/50 focus:shadow-[0_0_0_2px_rgba(79,70,229,0.2)]"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-rose-400 text-sm mt-1.5" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#E0E0E0] font-medium">Confirm New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="password" 
                              placeholder="••••••••" 
                              {...field} 
                              disabled={isLoading}
                              className="bg-[#252525] border-[#3A3A3A] text-[#E0E0E0] focus:border-[#4F46E5] focus:ring-[#4F46E5]/20 rounded-xl h-11 pl-4 pr-4 shadow-sm placeholder:text-[#6B7280] transition-all duration-200 hover:border-[#4F46E5]/50 focus:shadow-[0_0_0_2px_rgba(79,70,229,0.2)]"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-rose-400 text-sm mt-1.5" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl px-8 py-2.5 shadow-[0_4px_15px_rgba(79,70,229,0.4)] transform transition-all duration-200 hover:scale-105 hover:shadow-[0_6px_20px_rgba(79,70,229,0.6)] font-medium disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Update Credentials
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <p className="text-sm text-[#9CA3AF] mt-4 text-center">
        Remember to use strong, unique passwords. After updating, you will need to use the new credentials to log in.
      </p>
    </div>
  );
}
