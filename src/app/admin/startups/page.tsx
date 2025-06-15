// src/app/admin/startups/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
<<<<<<< HEAD
import { Rocket, PlusCircle, Loader2, AlertCircle, Edit, Trash2, Search, X, RefreshCw, UploadCloud, Info, Globe } from "lucide-react";
=======
import { Rocket, PlusCircle, Loader2, AlertCircle, Edit, Trash2, Search, X, RefreshCw, UploadCloud, ExternalLink } from "lucide-react";
>>>>>>> d7a0f6bf394223ef6df6c0e132df66210c33bf39
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
import { createStartupAction, updateStartupAction, deleteStartupAction, importStartupsFromTable } from '@/app/actions/startup-actions';
import Image from 'next/image';

const container: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 }}};
const itemVariants: Variants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: {duration: 0.3}}};

const startupFormSchema = z.object({
  name: z.string().min(3, { message: "Startup name must be at least 3 characters." }),
  logoUrl: z.string().url({ message: "Please enter a valid URL for the logo." }).optional().or(z.literal('')),
  logoFile: z.any().optional().refine(file => !file || file.size <= 5 * 1024 * 1024, `Max file size is 5MB.`).refine(file => !file || ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'].includes(file.type), `Only .jpg, .png, .webp, .svg files are accepted.`),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  badgeText: z.string().min(2, { message: "Badge text must be at least 2 characters." }),
  websiteUrl: z.string().url({ message: "Please enter a valid website URL." }).optional().or(z.literal('')),
  funnelSource: z.string().min(1, { message: "Funnel source is required." }),
  session: z.string().min(1, { message: "Session is required." }),
  monthYearOfIncubation: z.string().min(1, { message: "Month year of incubation is required." }),
  status: z.string().min(1, { message: "Status is required." }),
  legalStatus: z.string().min(1, { message: "Legal status is required." }),
  rknecEmailId: z.string().email({ message: "Please enter a valid RKNEC email address." }),
  emailId: z.string().email({ message: "Please enter a valid email address." }),
  mobileNumber: z.string().min(10, { message: "Mobile number must be at least 10 digits." }).max(15, { message: "Mobile number must not exceed 15 digits." }),
});

export type StartupFormValues = z.infer<typeof startupFormSchema>;

export interface StartupDocument {
  id: string;
  name: string;
  logoUrl?: string;
  description: string;
  badgeText: string;
  websiteUrl?: string;
  funnelSource: string;
  session: string;
  monthYearOfIncubation: string;
  status: string;
  legalStatus: string;
  rknecEmailId: string;
  emailId: string;
  mobileNumber: string;
  createdAt: Timestamp;
}

export default function AdminStartupsPage() {
  const [startups, setStartups] = useState<StartupDocument[]>([]);
  const [filteredStartups, setFilteredStartups] = useState<StartupDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingStartupData, setEditingStartupData] = useState<StartupDocument | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [startupToDelete, setStartupToDelete] = useState<StartupDocument | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const form = useForm<StartupFormValues>({
    resolver: zodResolver(startupFormSchema),
    defaultValues: {
      name: "", 
      logoUrl: "", 
      description: "", 
      badgeText: "", 
      websiteUrl: "",
      funnelSource: "",
      session: "",
      monthYearOfIncubation: "",
      status: "",
      legalStatus: "",
      rknecEmailId: "",
      emailId: "",
      mobileNumber: "",
    },
  });

  const fetchStartups = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const startupsCollection = collection(db, "startups");
      const q = query(startupsCollection, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedStartups: StartupDocument[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StartupDocument));
      setStartups(fetchedStartups);
      setFilteredStartups(fetchedStartups);
    } catch (err: any) {
      console.error("Error fetching startups: ", err);
      setError(err.code === 'permission-denied' || (err.message && err.message.toLowerCase().includes('permission-denied')) 
        ? "Failed to load startups: Missing Firestore permissions for 'startups' collection."
        : "Failed to load startups. " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchStartups(); }, [fetchStartups]);
  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    setFilteredStartups(
      startups.filter(startup =>
        startup.name.toLowerCase().includes(lowercasedQuery) ||
        startup.badgeText.toLowerCase().includes(lowercasedQuery) ||
        startup.description.toLowerCase().includes(lowercasedQuery) ||
        (startup.status && startup.status.toLowerCase().includes(lowercasedQuery)) ||
        (startup.legalStatus && startup.legalStatus.toLowerCase().includes(lowercasedQuery)) ||
        (startup.session && startup.session.toLowerCase().includes(lowercasedQuery)) ||
        (startup.emailId && startup.emailId.toLowerCase().includes(lowercasedQuery)) ||
        (startup.funnelSource && startup.funnelSource.toLowerCase().includes(lowercasedQuery))
      )
    );
  }, [searchQuery, startups]);

  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('logoFile', file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      form.setValue('logoFile', undefined);
      setLogoPreview(editingStartupData?.logoUrl || null); // Revert to original/empty on file removal
    }
  };
  const handleOpenFormDialog = (startup: StartupDocument | null = null) => {
    setEditingStartupData(startup);
    if (startup) {
      form.reset({
        name: startup.name,
        logoUrl: startup.logoUrl || "",
        description: startup.description,
        badgeText: startup.badgeText,
        websiteUrl: startup.websiteUrl || "",
        funnelSource: startup.funnelSource || "",
        session: startup.session || "",
        monthYearOfIncubation: startup.monthYearOfIncubation || "",
        status: startup.status || "",
        legalStatus: startup.legalStatus || "",
        rknecEmailId: startup.rknecEmailId || "",
        emailId: startup.emailId || "",
        mobileNumber: startup.mobileNumber || "",
        logoFile: undefined, // Reset logoFile for edit
      });
      setLogoPreview(startup.logoUrl || null);
    } else {
      form.reset({ 
        name: "", 
        logoUrl: "", 
        description: "", 
        badgeText: "", 
        websiteUrl: "", 
        funnelSource: "",
        session: "",
        monthYearOfIncubation: "",
        status: "",
        legalStatus: "",
        rknecEmailId: "",
        emailId: "",
        mobileNumber: "",
        logoFile: undefined 
      });
      setLogoPreview(null);
    }
    setIsFormDialogOpen(true);
  };

  async function onSubmit(values: StartupFormValues) {
    setIsSubmitting(true);
    try {
      let result;
      if (editingStartupData?.id) {
        result = await updateStartupAction(editingStartupData.id, values);
      } else {
        result = await createStartupAction(values);
      }

      if (result.success) {
        toast({ title: editingStartupData ? "Startup Updated" : "Startup Added", description: result.message });
        setIsFormDialogOpen(false);
        fetchStartups();
      } else {
        toast({ title: "Operation Failed", description: result.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDeleteClick = (startup: StartupDocument) => {
    setStartupToDelete(startup);
  };

  const confirmDelete = async () => {
    if (!startupToDelete) return;
    setIsDeleting(true);
    try {
      const result = await deleteStartupAction(startupToDelete.id);
      if (result.success) {
        toast({ title: "Startup Deleted", description: result.message });
        fetchStartups();
      } else {
        toast({ title: "Deletion Failed", description: result.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setStartupToDelete(null);
    }
  };
  
  const handleImportStartups = async () => {
    setIsImporting(true);
    // This is a predefined list for now. In a real app, this would come from a file upload or API.
    const startupDataToImport = [
      { "Startup Name": "Ira Industries", "Founder Details": "Akshay Shirpurkar (BE Civil 18)", "Incubation Stage": "Revenue Generation", "Legal Registration Type": "MSME SSI", "Funding Support": "₹5,69,723", "Recognition": "DPIIT Recognized", "Business Category & Industry": "Manufacturing", "Contact Information": "akshay.2995@gmail.com" },
      { "Startup Name": "The Imperial Lubricants", "Founder Details": "Apurv Sanjay Dey (B.E. Electronics-2020)", "Incubation Stage": "Revenue Generation", "Legal Registration Type": "MSME SSI", "Funding Support": "₹5,12,997", "Recognition": "DPIIT Recognized", "Business Category & Industry": "Eco-friendly Lubricants", "Contact Information": "apurvdey4@gmail.com" },
      { "Startup Name": "Gear to Care", "Founder Details": "Suraj Birthariya (B.E. Electronics - 2019)", "Incubation Stage": "Revenue Generation", "Legal Registration Type": "MSME SSI", "Funding Support": "₹3,00,000", "Recognition": "DPIIT Recognized", "Business Category & Industry": "Automobile Services", "Contact Information": "surajbirthariya@gmail.com" },
      { "Startup Name": "Alentar Electric", "Founder Details": "Ayush Mishra (B.E. Electronics-2018), Sajal Sahu (B.E. Electrical -2018)", "Incubation Stage": "Product Development", "Legal Registration Type": "LLP", "Funding Support": "₹5,00,000", "Recognition": "DPIIT Recognized", "Business Category & Industry": "Electric Vehicles", "Contact Information": "aayush9xm@gmail.com, sajalsahu1996@gmail.com" },
      { "Startup Name": "Somebuddy Technologies", "Founder Details": "Tarun Rawat, Vaibhav Kaushik, Akshans Gupta (B.E. Electronics-2016)", "Incubation Stage": "Revenue Generation", "Legal Registration Type": "LLP", "Funding Support": "₹5,00,000", "Recognition": "DPIIT Recognized", "Business Category & Industry": "SaaS Marketplace", "Contact Information": "Vaibhav3521@gmail.com, Tarunrawatwu@gmail.com, akshansgupta@gmail.com" },
      { "Startup Name": "FoodForU", "Founder Details": "Piyush Chhawsaria (VII Sem ETC), Aniket Rawat (V Sem CSE)", "Incubation Stage": "Revenue Generation", "Legal Registration Type": "Pvt. Ltd.", "Funding Support": "₹4,00,000", "Recognition": "DPIIT Recognized", "Business Category & Industry": "Food Tech", "Contact Information": "chhawsariapiyush@gmail.com, aniketrawat7890@gmail.com" },
      { "Startup Name": "Mr. Soya", "Founder Details": "Atul Pandit (B.E. VII Sem IT)", "Incubation Stage": "Revenue Generation", "Legal Registration Type": "MSME SSI", "Funding Support": "₹2,50,000", "Recognition": "DPIIT Recognized", "Business Category & Industry": "Food & Sustainability", "Contact Information": "atul.pandit211@gmail.com" },
      { "Startup Name": "Happico India", "Founder Details": "Yash Pande (VII Sem), Sonal Bahilani (VII Sem)", "Incubation Stage": "Revenue Generation", "Legal Registration Type": "Pvt. Ltd.", "Funding Support": "₹5,00,000", "Recognition": "DPIIT Recognized", "Business Category & Industry": "Chocolate Manufacturing", "Contact Information": "yashpande7@gmail.com, sonalbahilani30@gmail.com" },
      { "Startup Name": "Sigmatronics", "Founder Details": "Siddharth Satish Mishra (EDT 2016)", "Incubation Stage": "Product Development", "Legal Registration Type": "Pvt. Ltd.", "Funding Support": "₹5,00,000", "Recognition": "DPIIT Recognized", "Business Category & Industry": "IoT & Electronics", "Contact Information": "siddharth@sigmatronics.co.in" },
      { "Startup Name": "Foster Reads", "Founder Details": "Varun Chopra (BE Ind Engg 2020)", "Incubation Stage": "Revenue Generation", "Legal Registration Type": "Pvt. Ltd.", "Funding Support": "₹5,00,000", "Recognition": "DPIIT Recognized", "Business Category & Industry": "EdTech", "Contact Information": "varun@fostrreads.com" },
    ];

    try {
      const result = await importStartupsFromTable(startupDataToImport);
      if (result.success) {
        toast({ title: "Import Successful", description: result.message, });
        fetchStartups(); 
      } else {
        toast({ title: "Import Failed", description: result.message || "An unknown error occurred during import.", variant: "destructive", });
      }
    } catch (error: any) {
      toast({ title: "Error", description: `Failed to import startup data: ${error.message || 'Unknown error'}`, variant: "destructive", });
    } finally {
      setIsImporting(false);
    }
  };

  return (
<<<<<<< HEAD
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
=======
    <div className="min-h-screen bg-background text-foreground">
      <motion.div className="container mx-auto px-4 py-8" initial="hidden" animate="show" variants={container}>
        <Card className="bg-card border-border shadow-xl">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold font-montserrat text-accent flex items-center">
                  <Rocket className="mr-3 h-7 w-7" /> Startups Management
                </h1>
                <p className="text-muted-foreground">Manage featured startups for the landing page.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={fetchStartups} variant="outline" size="sm" disabled={isLoading}>
                  <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                  <span className="ml-2 hidden sm:inline">Refresh</span>
                </Button>
                <Button onClick={handleImportStartups} variant="secondary" size="sm" disabled={isImporting}>
                  {isImporting ? <Loader2 className="animate-spin mr-2"/> : <UploadCloud className="mr-2"/>}
                  <span className="hidden sm:inline">Import Data</span>
                </Button>
                <Button onClick={() => handleOpenFormDialog(null)} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add New Startup
                </Button>
>>>>>>> d7a0f6bf394223ef6df6c0e132df66210c33bf39
              </div>
            </div>
          </CardHeader>
          <CardContent>
<<<<<<< HEAD
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
=======
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="text" placeholder="Search startups..." className="pl-10 bg-background border-border focus:border-accent" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              {searchQuery && <X onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer" />}
>>>>>>> d7a0f6bf394223ef6df6c0e132df66210c33bf39
            </div>

            {isLoading ? (
              <div className="space-y-3">
<<<<<<< HEAD
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
=======
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg bg-muted" />)}
              </div>
            ) : error ? (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-lg flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Error Loading Startups</p>
                  <p className="text-sm text-destructive/80 mt-1">{error}</p>
                  <Button variant="outline" size="sm" className="mt-3 border-destructive/30 text-destructive hover:bg-destructive/20" onClick={fetchStartups}>
>>>>>>> d7a0f6bf394223ef6df6c0e132df66210c33bf39
                    <RefreshCw className="mr-2 h-3 w-3" /> Try Again
                  </Button>
                </div>
              </div>
            ) : (
              <motion.div className="overflow-x-auto" variants={container} initial="hidden" animate="show">
                {filteredStartups.length > 0 ? (
<<<<<<< HEAD
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
=======
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Logo</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Legal Status</TableHead>
                        <TableHead>Session</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
>>>>>>> d7a0f6bf394223ef6df6c0e132df66210c33bf39
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {filteredStartups.map((startup) => (
<<<<<<< HEAD
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
=======
                          <motion.tr key={startup.id} variants={itemVariants} initial="hidden" animate="show" exit={{ opacity: 0, x: -20 }} className="hover:bg-muted/50">
                            <TableCell>
                              <Avatar className="h-10 w-10 rounded-md">
                                <AvatarImage src={startup.logoUrl} alt={startup.name} className="object-contain" />
                                <AvatarFallback className="rounded-md bg-muted">{startup.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                            </TableCell>
                            <TableCell className="font-medium text-foreground">{startup.name}</TableCell>
                            <TableCell><Badge variant="secondary">{startup.status || 'N/A'}</Badge></TableCell>
                            <TableCell className="text-muted-foreground text-sm">{startup.legalStatus || 'N/A'}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">{startup.session || 'N/A'}</TableCell>
                            <TableCell className="text-muted-foreground text-xs">{startup.emailId || 'N/A'}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button variant="ghost" size="icon" className="hover:text-accent" onClick={() => handleOpenFormDialog(startup)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="hover:text-destructive" onClick={() => handleDeleteClick(startup)}>
>>>>>>> d7a0f6bf394223ef6df6c0e132df66210c33bf39
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                {startup.websiteUrl && (
                                  <a href={startup.websiteUrl} target="_blank" rel="noopener noreferrer">
                                    <Button variant="ghost" size="icon" className="hover:text-primary">
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                  </a>
                                )}
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                ) : (
<<<<<<< HEAD
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
=======
                  <motion.div variants={itemVariants} className="text-center py-12 bg-muted/20 rounded-xl border border-dashed border-border">
                    <Rocket className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground">No startups found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{searchQuery ? 'Try a different search term' : 'Get started by adding a new startup'}</p>
>>>>>>> d7a0f6bf394223ef6df6c0e132df66210c33bf39
                  </motion.div>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isFormDialogOpen} onOpenChange={(isOpen) => {
        setIsFormDialogOpen(isOpen);
        if (!isOpen) { form.reset(); setLogoPreview(null); setEditingStartupData(null); }
      }}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-montserrat text-2xl text-accent">{editingStartupData ? "Edit Startup" : "Add New Startup"}</DialogTitle>
            <DialogDescription className="text-muted-foreground">{editingStartupData ? "Update the details of the startup." : "Fill in the details to add a new startup."}</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-2">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Startup Company Name</FormLabel><FormControl><Input placeholder="e.g., Innovatech" {...field} disabled={isSubmitting} className="bg-background focus:border-accent"/></FormControl><FormMessage /></FormItem>
              )}/>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="funnelSource" render={({ field }) => (
                  <FormItem><FormLabel>Funnel Source</FormLabel><FormControl>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                      <SelectTrigger className="bg-background focus:border-accent">
                        <SelectValue placeholder="Select funnel source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Website">Website</SelectItem>
                        <SelectItem value="Social Media">Social Media</SelectItem>
                        <SelectItem value="Referral">Referral</SelectItem>
                        <SelectItem value="Event">Event</SelectItem>
                        <SelectItem value="Direct Application">Direct Application</SelectItem>
                        <SelectItem value="College Network">College Network</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl><FormMessage /></FormItem>
                )}/>
                
                <FormField control={form.control} name="session" render={({ field }) => (
                  <FormItem><FormLabel>Session</FormLabel><FormControl>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                      <SelectTrigger className="bg-background focus:border-accent">
                        <SelectValue placeholder="Select session" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2023-24">2023-24</SelectItem>
                        <SelectItem value="2024-25">2024-25</SelectItem>
                        <SelectItem value="2025-26">2025-26</SelectItem>
                        <SelectItem value="2026-27">2026-27</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl><FormMessage /></FormItem>
                )}/>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="monthYearOfIncubation" render={({ field }) => (
                  <FormItem><FormLabel>Month Year of Incubation</FormLabel><FormControl><Input placeholder="e.g., January 2024" {...field} disabled={isSubmitting} className="bg-background focus:border-accent"/></FormControl><FormMessage /></FormItem>
                )}/>
                
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem><FormLabel>Status</FormLabel><FormControl>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                      <SelectTrigger className="bg-background focus:border-accent">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Incubating">Incubating</SelectItem>
                        <SelectItem value="Graduated">Graduated</SelectItem>
                        <SelectItem value="Pre-Incubation">Pre-Incubation</SelectItem>
                        <SelectItem value="Alumni">Alumni</SelectItem>
                        <SelectItem value="Suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl><FormMessage /></FormItem>
                )}/>
              </div>

              <FormField control={form.control} name="legalStatus" render={({ field }) => (
                <FormItem><FormLabel>Legal Status</FormLabel><FormControl>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                    <SelectTrigger className="bg-background focus:border-accent">
                      <SelectValue placeholder="Select legal status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Private Limited Company">Private Limited Company</SelectItem>
                      <SelectItem value="Limited Liability Partnership (LLP)">Limited Liability Partnership (LLP)</SelectItem>
                      <SelectItem value="Partnership Firm">Partnership Firm</SelectItem>
                      <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                      <SelectItem value="MSME SSI">MSME SSI</SelectItem>
                      <SelectItem value="Not Registered">Not Registered</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl><FormMessage /></FormItem>
              )}/>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="rknecEmailId" render={({ field }) => (
                  <FormItem><FormLabel>RKNEC Email ID</FormLabel><FormControl><Input placeholder="example@rknec.edu" {...field} disabled={isSubmitting} className="bg-background focus:border-accent"/></FormControl><FormMessage /></FormItem>
                )}/>
                
                <FormField control={form.control} name="emailId" render={({ field }) => (
                  <FormItem><FormLabel>Email ID</FormLabel><FormControl><Input placeholder="example@company.com" {...field} disabled={isSubmitting} className="bg-background focus:border-accent"/></FormControl><FormMessage /></FormItem>
                )}/>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="mobileNumber" render={({ field }) => (
                  <FormItem><FormLabel>Mobile Number</FormLabel><FormControl><Input placeholder="+91 9876543210" {...field} disabled={isSubmitting} className="bg-background focus:border-accent"/></FormControl><FormMessage /></FormItem>
                )}/>
                
                <FormField control={form.control} name="websiteUrl" render={({ field }) => (
                  <FormItem><FormLabel>Website URL (Optional)</FormLabel><FormControl><Input placeholder="https://startup.com" {...field} value={field.value || ''} disabled={isSubmitting} className="bg-background focus:border-accent"/></FormControl><FormMessage /></FormItem>
                )}/>
              </div>
              
              <FormField control={form.control} name="logoFile" render={({ field }) => (
                <FormItem><FormLabel>Logo Upload (Optional)</FormLabel>
                  <FormControl><div className="flex items-center gap-4">
                    <Input type="file" accept="image/*" onChange={handleLogoFileChange} disabled={isSubmitting} className="bg-background focus:border-accent file:text-accent file:font-semibold"/>
                    {logoPreview && <Avatar className="h-16 w-16 rounded-md"><AvatarImage src={logoPreview} alt="Logo preview" className="object-contain" /><AvatarFallback><UploadCloud /></AvatarFallback></Avatar>}
                  </div></FormControl><FormMessage /><p className="text-xs text-muted-foreground mt-1">Max 5MB. If no file, provide Logo URL below.</p>
                </FormItem>
              )}/>
              
              <FormField control={form.control} name="logoUrl" render={({ field }) => (
                <FormItem><FormLabel>Logo URL {form.getValues('logoFile') ? '(Fallback if upload fails)' : ''}</FormLabel><FormControl><Input placeholder="https://example.com/logo.png" {...field} disabled={isSubmitting} className="bg-background focus:border-accent"/></FormControl><FormMessage /></FormItem>
              )}/>
              
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Brief description of the startup..." {...field} rows={3} disabled={isSubmitting} className="bg-background focus:border-accent"/></FormControl><FormMessage /></FormItem>
              )}/>
              
              <FormField control={form.control} name="badgeText" render={({ field }) => (
                <FormItem><FormLabel>Badge Text</FormLabel><FormControl><Input placeholder="e.g., Seed Funded, Revenue Generation" {...field} disabled={isSubmitting} className="bg-background focus:border-accent"/></FormControl><FormMessage /></FormItem>
              )}/>
              
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsFormDialogOpen(false)} disabled={isSubmitting} className="hover:border-accent">Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (editingStartupData ? <Edit className="mr-2 h-4 w-4"/> : <PlusCircle className="mr-2 h-4 w-4" />)}
                  {editingStartupData ? "Update Startup" : "Add Startup"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!startupToDelete} onOpenChange={(isOpen) => !isOpen && setStartupToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the startup "{startupToDelete?.name}".</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setStartupToDelete(null)} disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />} Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
