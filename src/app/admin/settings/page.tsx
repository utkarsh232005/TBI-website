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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Loader2, 
  Save, 
  ShieldAlert, 
  Settings, 
  User, 
  Lock, 
  Globe, 
  BellRing, 
  Mail,
  Paintbrush,
  Cog,
  Info,
  AlertCircle
} from "lucide-react";
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <motion.div 
        className="max-w-3xl mx-auto"
        initial="hidden"
        animate="show"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="admin-heading-2 mb-2 flex items-center">
            <Settings className="mr-3 h-7 w-7 text-indigo-600" />
            Settings
          </h1>
          <p className="admin-caption">Manage your account settings and preferences</p>
        </motion.div>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8 bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
            <TabsTrigger value="account" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 rounded-lg transition-colors">
              <User className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 rounded-lg transition-colors">
              <Lock className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 rounded-lg transition-colors">
              <Cog className="h-4 w-4 mr-2" />
              Preferences
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="security" className="space-y-6">
            <motion.div variants={itemVariants}>
              <Card className="bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden">
                <CardHeader className="border-b border-gray-100 bg-gray-50">
                  <CardTitle className="flex items-center admin-heading-3">
                    <ShieldAlert className="mr-3 h-6 w-6 text-indigo-600" />
                    Admin Credentials
                  </CardTitle>
                  <CardDescription className="admin-body-small">
                    Update your administrator email and password.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="admin-body-small admin-font-semibold text-yellow-700">Security Notice</p>
                        <p className="admin-caption text-yellow-700/80 mt-1">
                          Passwords are currently stored in plaintext in Firestore for this demonstration. 
                          This is highly insecure for production environments.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                      <FormField
                        control={form.control}
                        name="newEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">New Admin Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input 
                                  type="email" 
                                  placeholder="admin@example.com" 
                                  {...field} 
                                  disabled={isLoading}
                                  className="bg-gray-50 border border-gray-200 pl-10 focus:border-indigo-500 focus:ring-indigo-100 rounded-lg transition-all"
                                  suppressHydrationWarning
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">New Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input 
                                  type="password" 
                                  placeholder="••••••••" 
                                  {...field} 
                                  disabled={isLoading}
                                  className="bg-gray-50 border border-gray-200 pl-10 focus:border-indigo-500 focus:ring-indigo-100 rounded-lg transition-all"
                                  suppressHydrationWarning
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Confirm New Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input 
                                  type="password" 
                                  placeholder="••••••••" 
                                  {...field} 
                                  disabled={isLoading}
                                  className="bg-gray-50 border border-gray-200 pl-10 focus:border-indigo-500 focus:ring-indigo-100 rounded-lg transition-all"
                                  suppressHydrationWarning
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                      <CardFooter className="flex justify-end px-0 pt-4 pb-0">
                        <Button 
                          type="submit" 
                          disabled={isLoading} 
                          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm px-6 py-2 font-medium transition-all"
                          suppressHydrationWarning
                        >
                          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                          Update Credentials
                        </Button>
                      </CardFooter>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.p variants={itemVariants} className="text-sm text-gray-500 flex items-center">
              <Info className="h-4 w-4 mr-2 text-gray-400" />
              Remember to use strong, unique passwords. After updating, you will need to use the new credentials to log in.
            </motion.p>
          </TabsContent>
          
          <TabsContent value="account" className="space-y-6">
            <motion.div variants={itemVariants}>
              <Card className="bg-white border border-gray-200 shadow-lg rounded-xl">
                <CardHeader className="border-b border-gray-100 bg-gray-50">
                  <CardTitle className="flex items-center">
                    <User className="mr-3 h-5 w-5 text-indigo-600" />
                    Profile Information
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    Update your personal profile details
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-gray-700 text-sm font-medium">Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          placeholder="Your name" 
                          className="bg-gray-50 border border-gray-200 pl-10 focus:border-indigo-500 focus:ring-indigo-100 rounded-lg transition-all"
                          suppressHydrationWarning
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-gray-700 text-sm font-medium">Bio</label>
                      <Textarea 
                        placeholder="Write a short bio about yourself" 
                        className="bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-indigo-100 resize-none h-24 rounded-lg transition-all"
                        suppressHydrationWarning
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t border-gray-100 bg-gray-50">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm px-6 py-2 font-medium transition-all" suppressHydrationWarning>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="preferences" className="space-y-6">
            <motion.div variants={itemVariants}>
              <Card className="bg-white border border-gray-200 shadow-lg rounded-xl">
                <CardHeader className="border-b border-gray-100 bg-gray-50">
                  <CardTitle className="flex items-center">
                    <Paintbrush className="mr-3 h-5 w-5 text-indigo-600" />
                    Interface Settings
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    Customize your interface appearance
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-700">Dark Mode</p>
                        <p className="text-sm text-gray-400">Toggle dark mode on or off</p>
                      </div>
                      <button 
                        type="button" 
                        className="h-6 w-11 bg-indigo-100 rounded-full relative border border-indigo-200 transition-all"
                        aria-label="Toggle dark mode"
                        suppressHydrationWarning
                      >
                        <span className="h-5 w-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow transition-all duration-200"></span>
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-700">Notifications</p>
                        <p className="text-sm text-gray-400">Receive email notifications</p>
                      </div>
                      <button 
                        type="button" 
                        className="h-6 w-11 bg-gray-200 rounded-full relative border border-gray-300 transition-all"
                        aria-label="Toggle notifications"
                        suppressHydrationWarning
                      >
                        <span className="h-5 w-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow transition-all duration-200"></span>
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="font-medium text-gray-700 block">Language</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <select className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-lg h-10 pl-10 pr-3 appearance-none focus:border-indigo-500 focus:ring-indigo-100 transition-all" suppressHydrationWarning>
                          <option>English (US)</option>
                          <option>Hindi</option>
                          <option>French</option>
                          <option>German</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t border-gray-100 bg-gray-50">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm px-6 py-2 font-medium transition-all" suppressHydrationWarning>
                    <Save className="mr-2 h-4 w-4" />
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
