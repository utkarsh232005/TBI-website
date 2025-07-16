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
import { Rocket, PlusCircle, Loader2, AlertCircle, Edit, Trash2, Search, X, RefreshCw, UploadCloud, Info, Globe, ExternalLink, Settings, Calendar as CalendarIcon, Mail, Phone, Image as ImageIcon, CheckCircle2, Link as LinkIcon } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { uploadImage } from "@/lib/image-upload";
import { db } from '@/lib/firebase';
import { collection, getDocs, Timestamp, orderBy, query, doc, deleteDoc } from 'firebase/firestore';
import { createStartupAction, updateStartupAction, deleteStartupAction, importStartupsFromTable } from '@/app/actions/startup-actions';
import Image from 'next/image';
import ImageUploadComponent from '@/components/ui/image-upload';

const container: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants: Variants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const startupFormSchema = z.object({
  name: z.string().min(3, { message: "Startup name must be at least 3 characters." }),
  logoUrl: z.string().optional().or(z.literal(''))
    .refine((val) => {
      if (!val || val === '') return true; // Allow empty
      return val.startsWith('http') || val.startsWith('data:image/'); // Allow URLs or base64
    }, {
      message: 'Logo URL must be a valid URL or base64 image data'
    }),
  logoFile: z.any().optional(),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
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
    resolver: zodResolver(startupFormSchema), defaultValues: {
      name: "",
      logoUrl: "",
      logoFile: undefined,
      description: "",
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
    const lowercasedQuery = searchQuery.toLowerCase(); setFilteredStartups(
      startups.filter(startup =>
        startup.name.toLowerCase().includes(lowercasedQuery) ||
        startup.description.toLowerCase().includes(lowercasedQuery) ||
        (startup.status && startup.status.toLowerCase().includes(lowercasedQuery)) ||
        (startup.legalStatus && startup.legalStatus.toLowerCase().includes(lowercasedQuery)) ||
        (startup.session && startup.session.toLowerCase().includes(lowercasedQuery)) ||
        (startup.emailId && startup.emailId.toLowerCase().includes(lowercasedQuery)) ||
        (startup.funnelSource && startup.funnelSource.toLowerCase().includes(lowercasedQuery))
      )
    );
  }, [searchQuery, startups]); 
  
  const handleLogoFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
          toast({
            title: "Invalid File Type",
            description: "Please upload an image file (JPG, PNG, GIF, WebP, or SVG)",
            variant: "destructive"
          });
          return;
        }
        
        // Validate file size (5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
          toast({
            title: "File Too Large",
            description: "Please upload an image smaller than 5MB",
            variant: "destructive"
          });
          return;
        }
        
        // Convert file to base64 using the image upload utility
        const result = await uploadImage(file);

        if (result.success && result.url) {
          // Store the base64 string in the logoUrl field instead of logoFile
          form.setValue('logoUrl', result.url, { shouldValidate: true });
          form.setValue('logoFile', undefined); // Clear logoFile since we're using logoUrl
          setLogoPreview(result.url);
        } else {
          toast({
            title: "Upload Error",
            description: result.error || "Failed to process image",
            variant: "destructive"
          });
          form.setValue('logoFile', undefined);
          setLogoPreview(editingStartupData?.logoUrl || null);
        }
      } catch (error: any) {
        toast({
          title: "Upload Error",
          description: error.message || "Failed to process image",
          variant: "destructive"
        });
        form.setValue('logoFile', undefined);
        setLogoPreview(editingStartupData?.logoUrl || null);
      }
    } else {
      form.setValue('logoFile', undefined);
      form.setValue('logoUrl', editingStartupData?.logoUrl || ''); // Revert to original logoUrl
      setLogoPreview(editingStartupData?.logoUrl || null);
    }
  };
  const handleOpenFormDialog = (startup: StartupDocument | null = null) => {
    setEditingStartupData(startup);
    if (startup) {
      form.reset({
        name: startup.name,
        logoUrl: startup.logoUrl || "",
        logoFile: undefined, // Reset logoFile for edit
        description: startup.description,
        websiteUrl: startup.websiteUrl || "",
        funnelSource: startup.funnelSource || "",
        session: startup.session || "",
        monthYearOfIncubation: startup.monthYearOfIncubation || "",
        status: startup.status || "",
        legalStatus: startup.legalStatus || "",
        rknecEmailId: startup.rknecEmailId || "",
        emailId: startup.emailId || "",
        mobileNumber: startup.mobileNumber || "",
      });
      setLogoPreview(startup.logoUrl || null);
    } else {
      form.reset({
        name: "",
        logoUrl: "",
        logoFile: undefined,
        description: "",
        websiteUrl: "",
        funnelSource: "",
        session: "",
        monthYearOfIncubation: "",
        status: "",
        legalStatus: "",
        rknecEmailId: "",
        emailId: "",
        mobileNumber: "",
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
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-blue-100 text-blue-700 border border-blue-200 rounded-lg w-12 h-12 flex items-center justify-center">
                    <Rocket className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                      Featured Startups Management
                    </h1>
                  </div>
                </div>
                <p className="text-lg text-gray-600 font-medium mb-4 leading-relaxed">
                  Add, view, and manage startups showcased on the landing page.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={fetchStartups}
                  variant="outline" 
                  size="sm"
                  disabled={isLoading}
                  className="border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 transition-colors"
                  suppressHydrationWarning
                >
                  <RefreshCw className={cn("h-4 w-4 transition-transform", isLoading && "animate-spin")} />
                  <span className="ml-2 hidden sm:inline">Refresh</span>
                </Button>
                <Dialog open={isFormDialogOpen} onOpenChange={(isOpen) => {
                  setIsFormDialogOpen(isOpen);
                  if (!isOpen) {
                    form.reset(); // Reset form when dialog closes
                    setLogoPreview(null);
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
                      suppressHydrationWarning
                    >
                      <PlusCircle className="mr-2 h-5 w-5" />
                      <span>Add New Startup</span>
                    </Button>
                  </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px] bg-white border border-gray-200 rounded-xl shadow-lg">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
              <div className="bg-blue-100 text-blue-700 border border-blue-200 rounded-lg w-10 h-10 flex items-center justify-center">
                {editingStartupData ? <Edit className="h-5 w-5" /> : <Rocket className="h-5 w-5" />}
              </div>
              <span>
                {editingStartupData ? "Edit Startup" : "Add New Startup"}
              </span>
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {editingStartupData
                ? "Update the details below to modify the startup information."
                : "Fill in the details below to add a new startup."
              }
            </DialogDescription>
          </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-2 max-h-[65vh] overflow-y-auto px-1">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Startup Name</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    placeholder="e.g., Innovatech Solutions"
                                    {...field}
                                    disabled={isSubmitting}
                                    className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-200 rounded-lg pl-10 h-11 transition-colors"
                                    suppressHydrationWarning
                                  />
                                  <div className="absolute left-3 top-3 text-blue-500">
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
                          name="logoUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-1.5">
                                <span>Startup Logo</span>
                                <span className="text-xs text-blue-500 font-normal bg-blue-50 px-2 py-0.5 rounded-full">Required</span>
                              </FormLabel>
                              <FormControl>
                                <div className="space-y-3">
                                  {field.value ? (
                                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
                                      <div className="relative">
                                        <div className="h-20 w-20 rounded-lg border border-blue-200 overflow-hidden bg-white p-1 grid place-items-center">
                                          <img src={field.value} alt="Logo preview" className="max-h-full max-w-full object-contain" />
                                        </div>
                                        <div className="absolute -top-2 -right-2">
                                          <Button 
                                            type="button" 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-6 w-6 rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 border border-red-200"
                                            onClick={() => {
                                              field.onChange("");
                                              setLogoPreview(null);
                                            }}
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="sm" 
                                            className="text-xs h-8 bg-white border-gray-200 hover:bg-blue-50"
                                            onClick={() => {
                                              const input = document.createElement('input');
                                              input.type = 'file';
                                              input.accept = 'image/*';
                                              input.onchange = (e) => handleLogoFileChange(e as any);
                                              input.click();
                                            }}
                                          >
                                            <RefreshCw className="h-3 w-3 mr-1.5" /> Change
                                          </Button>
                                          <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="sm" 
                                            className="text-xs h-8 bg-white border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                                            onClick={() => {
                                              field.onChange("");
                                              setLogoPreview(null);
                                            }}
                                          >
                                            <Trash2 className="h-3 w-3 mr-1.5" /> Remove
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div 
                                      className="relative cursor-pointer border-2 border-dashed border-gray-200 hover:border-blue-300 rounded-lg p-6 text-center transition-colors hover:bg-blue-50"
                                      onClick={() => {
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.accept = 'image/*';
                                        input.onchange = (e) => handleLogoFileChange(e as any);
                                        input.click();
                                      }}
                                      onDragOver={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        (e.currentTarget).classList.add('ring-2', 'ring-blue-400', 'border-blue-300');
                                      }}
                                      onDragLeave={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        (e.currentTarget).classList.remove('ring-2', 'ring-blue-400', 'border-blue-300');
                                      }}
                                      onDrop={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        (e.currentTarget).classList.remove('ring-2', 'ring-blue-400', 'border-blue-300');
                                        
                                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                          handleLogoFileChange({ target: { files: e.dataTransfer.files }} as any);
                                        }
                                      }}
                                    >
                                      <div className="flex flex-col items-center justify-center gap-1">
                                        <div className="mb-2 bg-blue-50 p-3 rounded-full border border-blue-200">
                                          <UploadCloud className="h-6 w-6 text-blue-500" />
                                        </div>
                                        <p className="text-sm font-medium">Drag and drop your logo here</p>
                                        <p className="text-xs text-gray-500">or click to browse files</p>
                                        <p className="mt-2 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                          <ImageIcon className="h-3 w-3" /> PNG, JPG, GIF up to 5MB
                                        </p>
                                      </div>
                                    </div>
                                  )}
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
                                <div className="relative">
                                  <Textarea
                                    placeholder="Brief description of the startup..."
                                    {...field}
                                    rows={3}
                                    disabled={isSubmitting}
                                    className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-200 rounded-lg pl-10 pt-3 transition-colors resize-none"
                                    suppressHydrationWarning
                                  />
                                  <div className="absolute left-3 top-3 text-blue-500">
                                    <Info className="h-4 w-4" />
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>)}
                        />
                        <FormField
                          control={form.control}
                          name="websiteUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Website URL (Optional)</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    placeholder="https://startupwebsite.com"
                                    {...field}
                                    value={field.value || ''}
                                    disabled={isSubmitting}
                                    className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-200 rounded-lg pl-10 h-11 transition-colors"
                                    suppressHydrationWarning
                                  />
                                  <div className="absolute left-3 top-3 text-blue-500">
                                    <Globe className="h-4 w-4" />
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter className="mt-8 border-t border-gray-200 pt-5">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => { setIsFormDialogOpen(false); form.reset(); setLogoPreview(null); }}
                            disabled={isSubmitting}
                            className="border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 transition-colors"
                            suppressHydrationWarning
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
                            suppressHydrationWarning
                          >
                            {isSubmitting ? (
                              <span className="flex items-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                <span>Processing...</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5">
                                {editingStartupData ? (
                                  <>
                                    <Edit className="h-4 w-4" />
                                    <span>Update Startup</span>
                                  </>
                                ) : (
                                  <>
                                    <PlusCircle className="h-4 w-4" />
                                    <span>Add Startup</span>
                                  </>
                                )}
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
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-blue-500" />
              </div>
              <Input
                type="text"
                placeholder="Search startups by name, badge, or description..."
                className="pl-10 h-12 text-base border-gray-200 focus:border-blue-400 focus:ring-blue-200 rounded-lg bg-white transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                suppressHydrationWarning
              />
              {searchQuery && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors focus:outline-none h-6 w-6 rounded-full flex items-center justify-center"
                    suppressHydrationWarning
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 rounded-lg bg-gray-50 border border-gray-200 shadow-sm mb-4">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded-md bg-gray-200" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/5 bg-gray-200" />
                        <Skeleton className="h-3 w-4/5 bg-gray-200" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="border border-red-200 bg-red-50 rounded-xl">
                <div className="flex items-start space-x-4 p-6">
                  <div className="bg-red-100 text-red-700 border border-red-200 rounded-lg w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Startups</h3>
                    <p className="text-red-600 mb-4 break-words">{error}</p>
                    <Button
                      onClick={fetchStartups}
                      className="bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
                      suppressHydrationWarning
                    >
                      <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {filteredStartups.length > 0 ? (
                                      <Table className="border-gray-200 bg-white rounded-lg shadow-sm overflow-hidden">
                                          <TableHeader className="bg-gray-50">
                        <TableRow className="border-gray-200 hover:bg-gray-100">
                        <TableHead className="w-[80px] text-gray-700 font-semibold">
                          <div className="flex items-center px-2 py-1 rounded-lg bg-blue-50/50 border border-blue-100/50 inline-flex">
                            <UploadCloud className="h-3.5 w-3.5 mr-2 text-blue-600" />
                            <span>Logo</span>
                          </div>
                        </TableHead>
                        <TableHead className="text-gray-700 font-semibold">
                          <div className="flex items-center px-2 py-1 rounded-lg bg-blue-50/50 border border-blue-100/50 inline-flex">
                            <Rocket className="h-3.5 w-3.5 mr-2 text-blue-600" />
                            <span>Name</span>
                          </div>
                        </TableHead>
                        <TableHead className="text-gray-700 font-semibold">
                          <div className="flex items-center px-2 py-1 rounded-lg bg-blue-50/50 border border-blue-100/50 inline-flex">
                            <Info className="h-3.5 w-3.5 mr-2 text-blue-600" />
                            <span>Description</span>
                          </div>
                        </TableHead>
                        <TableHead className="text-right text-gray-700 font-semibold">
                          <div className="flex items-center justify-end px-2 py-1 rounded-lg bg-blue-50/50 border border-blue-100/50 inline-flex ml-auto">
                            <Settings className="h-3.5 w-3.5 mr-2 text-blue-600" />
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
                            variants={itemVariants}
                            initial="hidden"
                            animate="show"
                            exit={{ opacity: 0, x: -20 }}
                            className="hover:bg-gradient-to-r hover:from-blue-50/70 hover:to-indigo-50/70 border-gray-200/50 transition-all duration-300 group"
                            whileHover={{ scale: 1.005, y: -2 }}
                          >
                            <TableCell>
                              <Avatar className="h-10 w-10 rounded-md shadow-sm">
                                {startup.logoUrl ? (
                                  <AvatarImage src={startup.logoUrl} alt={startup.name} className="object-contain" />
                                ) : null}
                                <AvatarFallback className="rounded-md bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-600">
                                  {startup.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </TableCell>
                            <TableCell className="font-medium text-gray-900">
                              {startup.name}
                            </TableCell>
                            <TableCell className="text-gray-600 text-sm max-w-sm truncate">
                              {startup.description}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenFormDialog(startup)}
                                  className="text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                                  suppressHydrationWarning
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteClick(startup)}
                                  className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                                  suppressHydrationWarning
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                {startup.websiteUrl && (
                                  <a href={startup.websiteUrl} target="_blank" rel="noopener noreferrer">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
                                    >
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
                  <div className="bg-white border border-gray-200 rounded-xl text-center py-16">
                    <div className="max-w-md mx-auto">
                      <div className="bg-blue-100 text-blue-700 border border-blue-200 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                        <Rocket className="h-10 w-10" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {searchQuery ? 'No matching startups found' : 'No startups yet'}
                      </h3>
                      <p className="text-lg text-gray-600 max-w-sm mx-auto mb-6">
                        {searchQuery ? (
                          'Try a different search term or clear the search to see all startups.'
                        ) : (
                          'Get started by adding your first startup to showcase on the landing page.'
                        )}
                      </p>
                      {searchQuery && (
                        <Button
                          onClick={() => setSearchQuery('')}
                          className="mt-4 border border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-colors rounded-lg font-medium"
                          variant="outline"
                          suppressHydrationWarning
                        >
                          <X className="mr-2 h-4 w-4" />
                          Clear Search
                        </Button>
                      )}
                      {!searchQuery && (
                        <Button
                          onClick={() => setIsFormDialogOpen(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm rounded-lg"
                          suppressHydrationWarning
                        >
                          <PlusCircle className="mr-2 h-5 w-5" />
                          Add Your First Startup
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isFormDialogOpen} onOpenChange={(isOpen) => {
        setIsFormDialogOpen(isOpen);
        if (!isOpen) { form.reset(); setLogoPreview(null); setEditingStartupData(null); }
      }}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] bg-white border border-gray-200 rounded-xl shadow-lg">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
              <div className="bg-blue-100 text-blue-700 border border-blue-200 rounded-lg w-10 h-10 flex items-center justify-center">
                {editingStartupData ? <Edit className="h-5 w-5" /> : <Rocket className="h-5 w-5" />}
              </div>
              <span>
                {editingStartupData ? "Edit Startup" : "Add New Startup"}
              </span>
            </DialogTitle>
            <DialogDescription className="text-gray-600">{editingStartupData ? "Update the details of the startup." : "Fill in the details to add a new startup."}</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-2 max-h-[60vh] overflow-y-auto pr-2">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Startup Company Name</FormLabel><FormControl><Input placeholder="e.g., Innovatech" {...field} disabled={isSubmitting} className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-200 rounded-lg" /></FormControl><FormMessage /></FormItem>
              )} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="funnelSource" render={({ field }) => (
                  <FormItem><FormLabel>Funnel Source</FormLabel><FormControl>
                    <div className="relative">
                      <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                        <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-200 rounded-lg h-11 pl-10 transition-colors">
                          <SelectValue placeholder="Select funnel source" />
                        </SelectTrigger>
                        <SelectContent className="border-gray-200 shadow-md bg-white">
                          <SelectItem value="Website">Website</SelectItem>
                          <SelectItem value="Social Media">Social Media</SelectItem>
                          <SelectItem value="Referral">Referral</SelectItem>
                          <SelectItem value="Event">Event</SelectItem>
                          <SelectItem value="Direct Application">Direct Application</SelectItem>
                          <SelectItem value="College Network">College Network</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="absolute left-3 top-3 text-blue-500 pointer-events-none transition-colors duration-300">
                        <ExternalLink className="h-4 w-4" />
                      </div>
                    </div>
                  </FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="session" render={({ field }) => (
                  <FormItem><FormLabel>Session</FormLabel><FormControl>
                    <div className="relative">
                      <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                        <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-200 rounded-lg h-11 pl-10 transition-colors">
                          <SelectValue placeholder="Select session" />
                        </SelectTrigger>
                        <SelectContent className="border-gray-200 shadow-md bg-white">
                          <SelectItem value="2023-24">2023-24</SelectItem>
                          <SelectItem value="2024-25">2024-25</SelectItem>
                          <SelectItem value="2025-26">2025-26</SelectItem>
                          <SelectItem value="2026-27">2026-27</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="absolute left-3 top-3 text-blue-500 pointer-events-none transition-colors duration-300">
                        <CalendarIcon className="h-4 w-4" />
                      </div>
                    </div>
                  </FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="monthYearOfIncubation" render={({ field }) => (
                  <FormItem><FormLabel>Month Year of Incubation</FormLabel><FormControl>
                    <div className="relative group">
                      <Input 
                        placeholder="e.g., January 2024" 
                        {...field} 
                        disabled={isSubmitting} 
                        className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-200 rounded-lg h-11 pl-10 transition-colors" 
                      />
                      <div className="absolute left-3 top-3 text-blue-500">
                        <CalendarIcon className="h-4 w-4" />
                      </div>
                    </div>
                  </FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem><FormLabel>Status</FormLabel><FormControl>
                    <div className="relative">
                      <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                        <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-200 rounded-lg h-11 pl-10 transition-colors">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="border-gray-200 shadow-md bg-white">
                          <SelectItem value="Active" className="focus:bg-blue-50 focus:text-blue-700">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-green-500"></span>Active
                            </span>
                          </SelectItem>
                          <SelectItem value="Incubating" className="focus:bg-blue-50 focus:text-blue-700">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-blue-500"></span>Incubating
                            </span>
                          </SelectItem>
                          <SelectItem value="Graduated" className="focus:bg-blue-50 focus:text-blue-700">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-purple-500"></span>Graduated
                            </span>
                          </SelectItem>
                          <SelectItem value="Pre-Incubation" className="focus:bg-blue-50 focus:text-blue-700">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-yellow-500"></span>Pre-Incubation
                            </span>
                          </SelectItem>
                          <SelectItem value="Alumni" className="focus:bg-blue-50 focus:text-blue-700">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-indigo-500"></span>Alumni
                            </span>
                          </SelectItem>
                          <SelectItem value="Suspended" className="focus:bg-blue-50 focus:text-blue-700">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-red-500"></span>Suspended
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="absolute left-3 top-3 text-blue-500 pointer-events-none transition-colors duration-300">
                        <Info className="h-4 w-4" />
                      </div>
                    </div>
                  </FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <FormField control={form.control} name="legalStatus" render={({ field }) => (
                <FormItem><FormLabel>Legal Status</FormLabel><FormControl>
                  <div className="relative">
                    <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                                              <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-200 rounded-lg h-11 pl-10 transition-colors">
                          <SelectValue placeholder="Select legal status" />
                        </SelectTrigger>
                        <SelectContent className="border-gray-200 shadow-md bg-white">
                        <SelectItem value="Private Limited Company" className="focus:bg-blue-50 focus:text-blue-700">Private Limited Company</SelectItem>
                        <SelectItem value="Limited Liability Partnership (LLP)" className="focus:bg-blue-50 focus:text-blue-700">Limited Liability Partnership (LLP)</SelectItem>
                        <SelectItem value="Partnership Firm" className="focus:bg-blue-50 focus:text-blue-700">Partnership Firm</SelectItem>
                        <SelectItem value="Sole Proprietorship" className="focus:bg-blue-50 focus:text-blue-700">Sole Proprietorship</SelectItem>
                        <SelectItem value="MSME SSI" className="focus:bg-blue-50 focus:text-blue-700">MSME SSI</SelectItem>
                        <SelectItem value="Not Registered" className="focus:bg-blue-50 focus:text-blue-700">Not Registered</SelectItem>
                        <SelectItem value="Other" className="focus:bg-blue-50 focus:text-blue-700">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="absolute left-3 top-3 text-blue-500 pointer-events-none transition-colors duration-300">
                      <Settings className="h-4 w-4" />
                    </div>
                  </div>
                </FormControl><FormMessage /></FormItem>
              )} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="rknecEmailId" render={({ field }) => (
                  <FormItem><FormLabel>RKNEC Email ID</FormLabel><FormControl>
                    <div className="relative group">
                      <Input 
                        placeholder="example@rknec.edu" 
                        {...field} 
                        disabled={isSubmitting} 
                        className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-200 rounded-lg h-11 pl-10 transition-colors" 
                      />
                      <div className="absolute left-3 top-3 text-blue-500">
                        <Mail className="h-4 w-4" />
                      </div>
                    </div>
                  </FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="emailId" render={({ field }) => (
                  <FormItem><FormLabel>Email ID</FormLabel><FormControl>
                    <div className="relative group">
                      <Input 
                        placeholder="example@company.com" 
                        {...field} 
                        disabled={isSubmitting} 
                        className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-200 rounded-lg h-11 pl-10 transition-colors" 
                      />
                      <div className="absolute left-3 top-3 text-blue-500">
                        <Mail className="h-4 w-4" />
                      </div>
                    </div>
                  </FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="mobileNumber" render={({ field }) => (
                  <FormItem><FormLabel>Mobile Number</FormLabel><FormControl>
                    <div className="relative group">
                      <Input 
                        placeholder="+91 9876543210" 
                        {...field} 
                        disabled={isSubmitting} 
                        className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-200 rounded-lg h-11 pl-10 transition-colors" 
                      />
                      <div className="absolute left-3 top-3 text-blue-500">
                        <Phone className="h-4 w-4" />
                      </div>
                    </div>
                  </FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="websiteUrl" render={({ field }) => (
                  <FormItem><FormLabel>Website URL (Optional)</FormLabel><FormControl>
                    <div className="relative group">
                      <Input 
                        placeholder="https://startup.com" 
                        {...field} 
                        value={field.value || ''} 
                        disabled={isSubmitting} 
                        className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-200 rounded-lg h-11 pl-10 transition-colors" 
                      />
                      <div className="absolute left-3 top-3 text-blue-500">
                        <Globe className="h-4 w-4" />
                      </div>
                    </div>
                  </FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <FormField control={form.control} name="logoFile" render={({ field }) => (
                <FormItem><FormLabel>
                  <span className="flex items-center gap-2">
                    Logo Upload <span className="text-xs text-blue-500 font-normal bg-blue-50 px-2 py-0.5 rounded-full">Recommended</span>
                  </span>
                </FormLabel>
                  <FormControl>
                                            <div className="flex flex-col gap-4">
                          {logoPreview ? (
                            <div className="flex flex-col sm:flex-row items-center gap-4 bg-blue-50 rounded-lg p-5 border border-blue-200">
                                                      <div className="relative">
                              <div className="h-28 w-28 rounded-lg border-2 border-blue-200 overflow-hidden bg-white p-2 grid place-items-center">
                                <img src={logoPreview} alt="Logo preview" className="max-h-full max-w-full object-contain" />
                              </div>
                            <div className="absolute -top-2 -right-2">
                                                              <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 border border-red-200"
                                onClick={() => {
                                  setLogoPreview(null);
                                  form.setValue("logoFile", undefined);
                                  form.setValue("logoUrl", "");
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex-1 text-center sm:text-left">
                            <h4 className="text-sm font-medium text-blue-700 mb-1 flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 
                              Logo Preview
                            </h4>
                            <p className="text-xs text-gray-600 mb-3">Your logo has been uploaded successfully and is ready for use.</p>
                            <div className="flex gap-2 justify-center sm:justify-start">
                                                              <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-xs h-8 bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-colors"
                                onClick={() => {
                                  // Open a file picker to replace the current logo
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.accept = 'image/*';
                                  input.onchange = (e) => handleLogoFileChange(e as any);
                                  input.click();
                                }}
                              >
                                <RefreshCw className="h-3 w-3 mr-1.5" /> Replace
                              </Button>
                                                              <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-xs h-8 bg-white border-gray-200 hover:border-red-200 hover:bg-red-50 text-gray-700 hover:text-red-700 transition-colors"
                                onClick={() => {
                                  setLogoPreview(null);
                                  form.setValue("logoFile", undefined);
                                  form.setValue("logoUrl", "");
                                }}
                              >
                                <Trash2 className="h-3 w-3 mr-1.5" /> Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="relative group cursor-pointer transition-all duration-300 hover:scale-[1.01]" 
                          onClick={() => {
                            const input = document.querySelector('input[type="file"][accept="image/*"]');
                            if (input) {
                              (input as HTMLInputElement).click();
                            }
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            (e.target as HTMLDivElement).classList.add('ring-2', 'ring-blue-400');
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            (e.target as HTMLDivElement).classList.remove('ring-2', 'ring-blue-400');
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            (e.target as HTMLDivElement).classList.remove('ring-2', 'ring-blue-400');
                            
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                              const file = e.dataTransfer.files[0];
                              handleLogoFileChange({ target: { files: e.dataTransfer.files }} as any);
                            }
                          }}
                        >
                          <div className="border-2 border-dashed border-gray-200 hover:border-blue-300 rounded-lg p-8 text-center transition-colors group-hover:bg-blue-50">
                            <div className="mb-4">
                              <div className="mx-auto bg-blue-50 rounded-full h-16 w-16 flex items-center justify-center border border-blue-200">
                                <UploadCloud className="h-8 w-8 text-blue-500" />
                              </div>
                            </div>
                            <p className="text-sm font-medium mb-1 text-gray-800">Drag and drop your logo here</p>
                            <p className="text-xs text-gray-500 mb-4">or click anywhere in this area to browse files</p>
                            <Input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleLogoFileChange} 
                              disabled={isSubmitting}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                              aria-label="Upload logo"
                            />
                            <div className="inline-flex items-center justify-center">
                              <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-200 flex items-center gap-1.5">
                                <ImageIcon className="h-3 w-3" />
                                Recommended: Square image (1:1 ratio)
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5 pl-1">
                    <Info className="h-3 w-3 text-blue-500" /> 
                    Max 5MB. Supported formats: JPG, PNG, GIF, WebP, SVG
                  </p>
                </FormItem>
              )} />

              <FormField control={form.control} name="logoUrl" render={({ field }) => (
                <FormItem><FormLabel>
                  <span className="flex items-center gap-1.5">
                    <span>Logo URL</span> 
                    {logoPreview ? 
                      <span className="text-xs text-emerald-500 font-normal bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Set from upload
                      </span> 
                      : 
                      <span className="text-xs text-blue-500 font-normal bg-blue-50 px-2 py-0.5 rounded-full">Alternative to upload</span>
                    }
                  </span>
                </FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Input 
                      placeholder="https://example.com/logo.png" 
                      {...field} 
                      disabled={isSubmitting} 
                      className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-200 rounded-lg h-11 pl-10 transition-colors" 
                    />
                    <div className="absolute left-3 top-3 text-blue-500">
                      <Globe className="h-4 w-4" />
                    </div>
                    {field.value && !logoPreview && (
                      <div className="absolute right-3 top-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-gray-400 hover:text-gray-600"
                          onClick={() => {
                            form.setValue("logoUrl", "");
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
                {!logoPreview && (
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5 pl-1">
                    <LinkIcon className="h-3 w-3 text-blue-500" /> 
                    Enter a direct URL to an image if you can't upload a file
                  </p>
                )}
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl>
                  <div className="relative">
                    <Textarea 
                      placeholder="Brief description of the startup..." 
                      {...field} 
                      rows={3} 
                      disabled={isSubmitting} 
                      className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-200 rounded-lg pl-10 pt-3 transition-colors resize-none" 
                    />
                    <div className="absolute left-3 top-3 text-blue-500">
                      <Info className="h-4 w-4" />
                    </div>
                  </div>
                </FormControl><FormMessage /></FormItem>
              )} />

              <DialogFooter className="mt-8 border-t border-gray-200 pt-5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormDialogOpen(false)} 
                  disabled={isSubmitting} 
                  className="border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      {editingStartupData ? <Edit className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
                      <span>{editingStartupData ? "Update Startup" : "Add Startup"}</span>
                    </span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!startupToDelete} onOpenChange={(isOpen) => !isOpen && setStartupToDelete(null)}>
        <AlertDialogContent className="bg-white border border-gray-200 rounded-xl shadow-lg">
          <AlertDialogHeader className="pb-2">
            <AlertDialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
              <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg w-10 h-10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5" />
              </div>
              <span>Delete Confirmation</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 mt-2 text-base">
              This action cannot be undone. This will permanently delete the startup <span className="font-medium text-red-600">"{startupToDelete?.name}"</span> from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 border-t border-gray-200 pt-5">
            <AlertDialogCancel 
              onClick={() => setStartupToDelete(null)} 
              disabled={isDeleting}
              className="border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              disabled={isDeleting} 
              className="bg-red-600 hover:bg-red-700 text-white transition-colors shadow-sm"
            >
              <span className="flex items-center gap-1.5">
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                <span>Delete Startup</span>
              </span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
