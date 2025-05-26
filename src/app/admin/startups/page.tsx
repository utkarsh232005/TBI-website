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
import { Rocket, PlusCircle, Loader2, AlertCircle, Edit, Trash2, Search, X, RefreshCw, UploadCloud } from "lucide-react";
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
    <div className="min-h-screen bg-background text-foreground">
      <motion.div 
        className="container mx-auto px-4 py-8"
        initial="hidden"
        animate="show"
        variants={container}
      >
        <Card className="bg-card border-border shadow-xl">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold font-montserrat text-accent">
                  Featured Startups Management
                </h1>
                <p className="text-muted-foreground">
                  Add, view, and manage startups showcased on the landing page.
                </p>
              </div>
              <div className="flex items-center gap-2">
                 <Button onClick={fetchStartups} variant="outline" size="sm" disabled={isLoading}>
                  <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
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
                    <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" suppressHydrationWarning>
                      <PlusCircle className="mr-2 h-4 w-4" /> Add New Startup
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] bg-card border-border">
                    <DialogHeader>
                      <DialogTitle className="font-montserrat text-2xl text-accent">
                        Add New Startup
                      </DialogTitle>
                      <DialogDescription className="text-muted-foreground">
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
                                <Input placeholder="e.g., Innovatech Solutions" {...field} disabled={isSubmitting} className="bg-background focus:border-accent"/>
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
                                    className="bg-background focus:border-accent flex-grow file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent/10 file:text-accent hover:file:bg-accent/20"
                                    {...restField} // Pass rest of the field props
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
                                <Input placeholder="https://example.com/logo.png" {...field} disabled={isSubmitting} className="bg-background focus:border-accent"/>
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
                                <Textarea placeholder="Brief description of the startup..." {...field} rows={3} disabled={isSubmitting} className="bg-background focus:border-accent"/>
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
                                <Input placeholder="e.g., Seed Funded, Acquired" {...field} disabled={isSubmitting} className="bg-background focus:border-accent"/>
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
                                <Input placeholder="https://startupwebsite.com" {...field} value={field.value || ''} disabled={isSubmitting} className="bg-background focus:border-accent"/>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter className="mt-6">
                          <Button type="button" variant="outline" onClick={() => { setIsCreateDialogOpen(false); form.reset(); setLogoPreview(null); }} disabled={isSubmitting} className="hover:border-accent">
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isSubmitting} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                            Add Startup
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
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                type="text"
                placeholder="Search startups by name, badge, or description..."
                className="pl-10 bg-background border-border focus:border-accent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 rounded-lg bg-card-foreground/5 border border-border">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-md" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-4 w-3/5" />
                        <Skeleton className="h-3 w-4/5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
               <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-lg flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Error Loading Startups</p>
                  <p className="text-sm text-destructive/80 mt-1">{error}</p>
                   <Button variant="outline" size="sm" className="mt-3 border-destructive/30 text-destructive hover:bg-destructive/20" onClick={fetchStartups}>
                    <RefreshCw className="mr-2 h-3 w-3" /> Try Again
                  </Button>
                </div>
              </div>
            ) : (
              <motion.div className="overflow-x-auto" variants={container} initial="hidden" animate="show">
                {filteredStartups.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Logo</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Badge</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {filteredStartups.map((startup) => (
                          <motion.tr key={startup.id} variants={item} initial="hidden" animate="show" exit={{ opacity: 0, x: -20 }} className="hover:bg-card-foreground/5">
                            <TableCell>
                              <Avatar className="h-10 w-10 rounded-md">
                                {startup.logoUrl ? (
                                  <AvatarImage src={startup.logoUrl} alt={startup.name} className="object-contain" />
                                ) : null}
                                <AvatarFallback className="rounded-md bg-muted">
                                  {startup.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </TableCell>
                            <TableCell className="font-medium text-foreground">{startup.name}</TableCell>
                            <TableCell><Badge variant="secondary">{startup.badgeText}</Badge></TableCell>
                            <TableCell className="text-muted-foreground text-xs max-w-sm truncate">{startup.description}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button variant="ghost" size="icon" disabled className="hover:text-accent">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" disabled className="hover:text-destructive">
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
                  <motion.div variants={item} className="text-center py-12 bg-card-foreground/5 rounded-xl border border-dashed border-border">
                    <Rocket className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground">No startups found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {searchQuery ? 'Try a different search term' : 'Get started by adding a new startup'}
                    </p>
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
