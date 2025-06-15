// src/app/admin/startups/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Rocket, PlusCircle, Loader2, AlertCircle, Edit, Trash2, Search, X, RefreshCw, UploadCloud, Info, Globe } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase';
import { collection, getDocs, Timestamp, orderBy, query, doc, deleteDoc } from 'firebase/firestore';
import { createStartupAction } from '@/app/actions/startup-actions'; // Assuming startup-actions.ts exists
import Image from 'next/image';

// Animation variants (assuming these are defined elsewhere or can be simplified)
const container: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 }}};
const item: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 }};

// Schema for the startup creation/edit form
const startupFormSchema = z.object({
  name: z.string().min(3, { message: "Startup name must be at least 3 characters." }),
  logoUrl: z.string().url({ message: "Please enter a valid URL for the logo." }).optional().or(z.literal('')),
  logoFile: z.instanceof(File).optional().refine(file => !file || file.size <= 5 * 1024 * 1024, `Max file size is 5MB.`).refine(file => !file || ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'].includes(file.type), `Only .jpg, .png, .webp, .svg files are accepted.`),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  badgeText: z.string().min(2, { message: "Badge text must be at least 2 characters." }),
  websiteUrl: z.string().url({ message: "Please enter a valid website URL." }).optional().or(z.literal('')),
});

export type StartupFormValues = z.infer<typeof startupFormSchema>;

export interface StartupDocument {
  id: string;
  name: string;
  logoUrl?: string;
  description: string;
  badgeText: string;
  websiteUrl?: string;
  createdAt: Timestamp;
}

export default function AdminStartupsPage() {
  const [startups, setStartups] = useState<StartupDocument[]>([]);
  const [filteredStartups, setFilteredStartups] = useState<StartupDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const form = useForm<StartupFormValues>({
    resolver: zodResolver(startupFormSchema),
    defaultValues: {
      name: "",
      logoUrl: "",
      description: "",
      badgeText: "",
      websiteUrl: "",
    },
  });
  
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const fetchStartups = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const startupsCollection = collection(db, "startups");
      const q = query(startupsCollection, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedStartups: StartupDocument[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedStartups.push({
          id: doc.id,
          name: data.name,
          logoUrl: data.logoUrl,
          description: data.description,
          badgeText: data.badgeText,
          websiteUrl: data.websiteUrl,
          createdAt: data.createdAt,
        });
      });
      
      setStartups(fetchedStartups);
      setFilteredStartups(fetchedStartups);
    } catch (err: any) {
      console.error("Error fetching startups: ", err);
      setError(err.code === 'permission-denied' || (err.message && err.message.toLowerCase().includes('permission-denied')) 
        ? "Failed to load startups: Missing or insufficient Firestore permissions. Please check security rules for the 'startups' collection."
        : "Failed to load startups. " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStartups();
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredStartups(startups);
      return;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    setFilteredStartups(
      startups.filter(startup =>
        startup.name.toLowerCase().includes(lowercasedQuery) ||
        startup.badgeText.toLowerCase().includes(lowercasedQuery) ||
        startup.description.toLowerCase().includes(lowercasedQuery)
      )
    );
  }, [searchQuery, startups]);

  async function onSubmit(values: StartupFormValues) {
    setIsSubmitting(true);
    try {
      const result = await createStartupAction(values); // createStartupAction needs to handle FormData if file is directly passed
      if (result.success) {
        toast({
          title: "Startup Added",
          description: `Startup "${values.name}" has been successfully added.`,
        });
        form.reset();
        setLogoPreview(null);
        setIsCreateDialogOpen(false);
        fetchStartups(); 
      } else {
        toast({
          title: "Creation Failed",
          description: result.message || "Could not add the startup.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('logoFile', file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      form.setValue('logoFile', undefined);
      setLogoPreview(null);
    }
  };


  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E0E0] relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-[#121212] z-0">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-purple-700/10 rounded-full filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-40 w-96 h-96 bg-indigo-700/10 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-20 w-96 h-96 bg-blue-700/10 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      <motion.div 
        className="container mx-auto px-4 py-8 relative z-10"
        initial="hidden"
        animate="show"
        variants={container}
      >
        <Card className="bg-gradient-to-b from-[#1E1E1E] to-[#181818] border-[#333333] shadow-2xl rounded-xl overflow-hidden backdrop-blur-sm bg-opacity-80 border-opacity-30">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <div className="relative">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-indigo-400 bg-clip-text text-transparent bg-size-200 animate-gradient-x">
                    Featured Startups Management
                  </h1>
                  <div className="absolute -bottom-2 left-0 w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                </div>
                <p className="text-gray-400 mt-4 flex items-center">
                  <Rocket className="h-4 w-4 mr-2 text-indigo-400" />
                  Add, view, and manage startups showcased on the landing page.
                </p>
              </div>
              <div className="flex items-center gap-2">
                 <Button 
                  onClick={fetchStartups} 
                  variant="outline" 
                  size="sm" 
                  disabled={isLoading}
                  className="border-[#333333] hover:border-indigo-500 text-gray-300 hover:bg-indigo-500/10 transition-all duration-300 shadow-inner shadow-indigo-500/5"
                  suppressHydrationWarning
                >
                  <RefreshCw className={cn("h-4 w-4 transition-transform", isLoading && "animate-spin")} />
                  <span className="ml-2 hidden sm:inline">Refresh</span>
                </Button>
                <Dialog open={isCreateDialogOpen} onOpenChange={(isOpen) => {
                  setIsCreateDialogOpen(isOpen);
                  if (!isOpen) {
                    form.reset(); // Reset form when dialog closes
                    setLogoPreview(null);
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg text-white group" 
                      suppressHydrationWarning
                    >
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-x-0 origin-left group-hover:scale-x-100"></span>
                      <span className="relative flex items-center">
                        <PlusCircle className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90 duration-300" /> 
                        <span>Add New Startup</span>
                      </span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] bg-gradient-to-b from-[#1E1E1E] to-[#191919] border-[#333333] rounded-xl overflow-hidden shadow-2xl backdrop-filter backdrop-blur-lg border-opacity-40">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-200 to-purple-300 bg-clip-text text-transparent">
                        Add New Startup
                      </DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Fill in the details below to add a new startup.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Startup Name</FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <Input 
                                    placeholder="e.g., Innovatech Solutions" 
                                    {...field} 
                                    disabled={isSubmitting} 
                                    className="bg-[#262626] border-[#333333] focus:border-indigo-500 focus:ring-indigo-500/20 rounded-lg pl-10 transition-all duration-300 group-hover:border-indigo-500/50"
                                    suppressHydrationWarning
                                  />
                                  <div className="absolute left-3 top-2.5 text-gray-500 group-hover:text-indigo-400 transition-colors duration-300">
                                    <Rocket className="h-4 w-4" />
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control}
                          name="logoFile"
                          render={({ field: { onChange, value, ...restField }}) => ( // Destructure field to handle file input
                            <FormItem>
                              <FormLabel>Logo Upload</FormLabel>
                              <FormControl>
                                <div className="flex items-center gap-4">
                                  <Input
                                    type="file"
                                    accept="image/png, image/jpeg, image/webp, image/svg+xml"
                                    onChange={handleLogoFileChange}
                                    disabled={isSubmitting}
                                    className="bg-[#262626] border-[#333333] focus:border-indigo-500 focus:ring-indigo-500/10 rounded-lg flex-grow file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600/10 file:text-indigo-400 hover:file:bg-indigo-600/20"
                                    {...restField} // Pass rest of the field props
                                    suppressHydrationWarning
                                  />
                                  {logoPreview && (
                                    <Avatar className="h-16 w-16 rounded-md">
                                      <AvatarImage src={logoPreview} alt="Logo preview" className="object-contain" />
                                      <AvatarFallback><UploadCloud /></AvatarFallback>
                                    </Avatar>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                               <p className="text-xs text-muted-foreground mt-1">Max 5MB. PNG, JPG, WEBP, SVG. If no file is uploaded, provide Logo URL below.</p>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="logoUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Logo URL (Fallback)</FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <Input 
                                    placeholder="https://example.com/logo.png" 
                                    {...field} 
                                    disabled={isSubmitting} 
                                    className="bg-[#262626] border-[#333333] focus:border-indigo-500 focus:ring-indigo-500/20 rounded-lg pl-10 transition-all duration-300 group-hover:border-indigo-500/50"
                                    suppressHydrationWarning
                                  />
                                  <div className="absolute left-3 top-2.5 text-gray-500 group-hover:text-indigo-400 transition-colors duration-300">
                                    <UploadCloud className="h-4 w-4" />
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <Textarea 
                                    placeholder="Brief description of the startup..." 
                                    {...field} 
                                    rows={3} 
                                    disabled={isSubmitting} 
                                    className="bg-[#262626] border-[#333333] focus:border-indigo-500 focus:ring-indigo-500/20 rounded-lg pl-10 pt-3 transition-all duration-300 group-hover:border-indigo-500/50"
                                    suppressHydrationWarning
                                  />
                                  <div className="absolute left-3 top-3 text-gray-500 group-hover:text-indigo-400 transition-colors duration-300">
                                    <Info className="h-4 w-4" />
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="badgeText"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Badge Text</FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <Input 
                                    placeholder="e.g., Seed Funded, Acquired" 
                                    {...field} 
                                    disabled={isSubmitting} 
                                    className="bg-[#262626] border-[#333333] focus:border-indigo-500 focus:ring-indigo-500/20 rounded-lg pl-10 transition-all duration-300 group-hover:border-indigo-500/50"
                                    suppressHydrationWarning
                                  />
                                  <div className="absolute left-3 top-2.5 text-gray-500 group-hover:text-indigo-400 transition-colors duration-300">
                                    <Badge className="h-4 w-4" />
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="websiteUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Website URL (Optional)</FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <Input 
                                    placeholder="https://startupwebsite.com" 
                                    {...field} 
                                    value={field.value || ''} 
                                    disabled={isSubmitting} 
                                    className="bg-[#262626] border-[#333333] focus:border-indigo-500 focus:ring-indigo-500/20 rounded-lg pl-10 transition-all duration-300 group-hover:border-indigo-500/50"
                                    suppressHydrationWarning
                                  />
                                  <div className="absolute left-3 top-2.5 text-gray-500 group-hover:text-indigo-400 transition-colors duration-300">
                                    <Globe className="h-4 w-4" />
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter className="mt-6">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => { setIsCreateDialogOpen(false); form.reset(); setLogoPreview(null); }} 
                            disabled={isSubmitting} 
                            className="border-[#333333] hover:border-indigo-500 text-gray-300"
                            suppressHydrationWarning
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-600/20 transition-all duration-300"
                            suppressHydrationWarning
                          >
                            <span className="absolute top-0 right-0 px-5 py-1 bg-white/10 transform rotate-45 translate-y-[-25px] translate-x-[25px]"></span>
                            {isSubmitting ? (
                              <span className="flex items-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                <span>Processing...</span>
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                <span>Add Startup</span>
                              </span>
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative mb-6 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-all duration-300 group-focus-within:text-indigo-400">
                <Search className="h-4 w-4 text-gray-500 group-hover:text-indigo-400 transition-colors duration-300" />
              </div>
              <Input
                type="text"
                placeholder="Search startups by name, badge, or description..."
                className="pl-10 bg-[#262626] border-[#333333] focus:border-indigo-500 focus:ring-indigo-500/20 rounded-lg group-hover:border-indigo-500/50 transition-all duration-300 shadow-inner shadow-black/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                suppressHydrationWarning
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {searchQuery ? (
                  <button 
                    type="button" 
                    onClick={() => setSearchQuery('')} 
                    className="text-gray-500 hover:text-red-400 transition-colors duration-300 focus:outline-none" 
                    suppressHydrationWarning
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : (
                  <kbd className="hidden md:flex items-center gap-1 text-[10px] font-mono text-gray-500 bg-[#1A1A1A] px-1.5 py-0.5 rounded border border-[#333333]">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 rounded-lg bg-[#242424] border border-[#333333]">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-md bg-[#2A2A2A]" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-4 w-3/5 bg-[#2A2A2A]" />
                        <Skeleton className="h-3 w-4/5 bg-[#2A2A2A]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
               <div className="bg-gradient-to-r from-red-900/20 to-red-900/10 border border-red-800/50 text-red-300 p-6 rounded-lg flex items-start space-x-4 shadow-lg">
                <div className="bg-red-900/30 p-2 rounded-full">
                  <AlertCircle className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <p className="font-medium">Error Loading Startups</p>
                  <p className="text-sm text-red-400 mt-1">{error}</p>
                   <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3 border-red-800 text-red-300 hover:bg-red-900/30 hover:text-red-200" 
                    onClick={fetchStartups}
                    suppressHydrationWarning
                  >
                    <RefreshCw className="mr-2 h-3 w-3" /> Try Again
                  </Button>
                </div>
              </div>
            ) : (
              <motion.div className="overflow-x-auto" variants={container} initial="hidden" animate="show">
                {filteredStartups.length > 0 ? (
                  <Table className="border-[#333333]">
                    <TableHeader className="bg-gradient-to-r from-[#242424] to-[#1E1E1E]">
                      <TableRow className="border-[#333333] hover:bg-[#2A2A2A]">
                        <TableHead className="w-[80px] text-indigo-300 font-medium">
                          <div className="flex items-center">
                            <UploadCloud className="h-3.5 w-3.5 mr-2" />
                            <span>Logo</span>
                          </div>
                        </TableHead>
                        <TableHead className="text-indigo-300 font-medium">
                          <div className="flex items-center">
                            <Rocket className="h-3.5 w-3.5 mr-2" />
                            <span>Name</span>
                          </div>
                        </TableHead>
                        <TableHead className="text-indigo-300 font-medium">
                          <div className="flex items-center">
                            <Badge className="h-3.5 w-3.5 mr-2" />
                            <span>Badge</span>
                          </div>
                        </TableHead>
                        <TableHead className="text-indigo-300 font-medium">
                          <div className="flex items-center">
                            <Info className="h-3.5 w-3.5 mr-2" />
                            <span>Description</span>
                          </div>
                        </TableHead>
                        <TableHead className="text-right text-indigo-300 font-medium">
                          <div className="flex items-center justify-end">
                            <span>Actions</span>
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {filteredStartups.map((startup) => (
                          <motion.tr 
                            key={startup.id} 
                            variants={item} 
                            initial="hidden" 
                            animate="show" 
                            exit={{ opacity: 0, x: -20 }} 
                            className="hover:bg-gradient-to-r hover:from-[#242424] hover:to-[#1E1E1E] border-[#333333] transition-colors duration-300"
                            whileHover={{ scale: 1.01 }}
                          >
                            <TableCell>
                              <Avatar className="h-10 w-10 rounded-md">
                                {startup.logoUrl ? (
                                  <AvatarImage src={startup.logoUrl} alt={startup.name} className="object-contain" />
                                ) : null}
                                <AvatarFallback className="rounded-md bg-[#2A2A2A] text-indigo-300">
                                  {startup.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </TableCell>
                            <TableCell className="font-medium text-gray-200">{startup.name}</TableCell>
                            <TableCell>
                              <Badge className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 text-indigo-300 hover:from-indigo-900/70 hover:to-purple-900/70 border-none transition-colors duration-300 shadow-inner shadow-black/10">
                                {startup.badgeText}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-400 text-xs max-w-sm truncate">{startup.description}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button variant="ghost" size="icon" disabled className="hover:text-indigo-400 text-gray-500" suppressHydrationWarning>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" disabled className="hover:text-red-400 text-gray-500" suppressHydrationWarning>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                ) : (
                  <motion.div 
                    variants={item} 
                    className="text-center py-12 bg-gradient-to-b from-[#1A1A1A] to-[#161616] rounded-xl border border-dashed border-[#333333] shadow-inner shadow-black/20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="mb-6 relative">
                      <div className="absolute inset-0 bg-indigo-600/20 rounded-full blur-xl opacity-70 animate-pulse"></div>
                      <Rocket className="mx-auto h-16 w-16 text-indigo-300 relative z-10" />
                    </div>
                    <h3 className="text-2xl font-medium text-gray-100 mb-2">
                      {searchQuery ? 'No matching startups found' : 'No startups yet'}
                    </h3>
                    <p className="mt-1 text-base text-gray-400 max-w-sm mx-auto">
                      {searchQuery ? (
                        'Try a different search term or clear the search to see all startups.'
                      ) : (
                        'Get started by adding your first startup to showcase on the landing page.'
                      )}
                    </p>
                    {searchQuery && (
                      <Button 
                        onClick={() => setSearchQuery('')} 
                        variant="outline" 
                        className="mt-6 border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/20"
                        suppressHydrationWarning
                      >
                        <X className="mr-2 h-4 w-4" />
                        Clear Search
                      </Button>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
