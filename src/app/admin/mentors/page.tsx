
// src/app/admin/mentors/page.tsx
"use client";

// Complete React import to ensure proper JSX transformation
import * as React from 'react';
import { useState, useEffect, Fragment } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, PlusCircle, Loader2, AlertCircle, Edit, Trash2, Search, X, ChevronDown, ChevronUp, Mail, Linkedin, Briefcase, ExternalLink, RefreshCw, Lock } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase';
import { collection, getDocs, Timestamp, orderBy, query, doc, getDoc } from 'firebase/firestore';
import { createMentorAction, deleteMentorAction } from '@/app/actions/mentor-actions';
import { runMigration } from '@/lib/migrate-mentors';
import { format } from 'date-fns';
import ImageUploadComponent from '@/components/ui/image-upload';

// Animation variants
const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  }
};

// Schema for the mentor creation/edit form
const mentorFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  designation: z.string().min(3, { message: "Designation must be at least 3 characters." }),
  expertise: z.string().min(3, { message: "Expertise area must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  profilePictureUrl: z.string().optional(),
  linkedinUrl: z.string().url({ message: "Please enter a valid LinkedIn URL." }).optional().or(z.literal('')),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export type MentorFormValues = z.infer<typeof mentorFormSchema>;

export interface MentorDocument {
  id: string;
  name: string;
  designation: string;
  expertise: string;
  description: string;
  profilePictureUrl?: string;
  linkedinUrl?: string;
  email: string;
  createdAt: Timestamp; // For ordering if needed
}

// Get initials for avatar fallback
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
};

export default function AdminMentorsPage() {
  const [mentors, setMentors] = useState<MentorDocument[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<MentorDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMentor, setExpandedMentor] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<MentorFormValues>({
    resolver: zodResolver(mentorFormSchema),
    defaultValues: {
      name: "",
      designation: "",
      expertise: "",
      description: "",
      profilePictureUrl: "",
      linkedinUrl: "",
      email: "",
      password: "",
    },
  });

  // Filter mentors based on search query
  const filterMentors = (mentorsList: MentorDocument[], query: string) => {
    if (!query) return mentorsList;

    const lowercasedQuery = query.toLowerCase();
    return mentorsList.filter(mentor =>
      mentor.name.toLowerCase().includes(lowercasedQuery) ||
      mentor.designation.toLowerCase().includes(lowercasedQuery) ||
      mentor.expertise.toLowerCase().includes(lowercasedQuery) ||
      mentor.email.toLowerCase().includes(lowercasedQuery)
    );
  };

  // Update filtered mentors when search query or mentors list changes
  useEffect(() => {
    setFilteredMentors(filterMentors(mentors, searchQuery));
  }, [searchQuery, mentors]);

  const fetchMentors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const mentorsCollection = collection(db, "mentors");
      const q = query(mentorsCollection, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedMentors: MentorDocument[] = [];

      // Fetch each mentor's profile details from subcollection
      for (const mentorDoc of querySnapshot.docs) {
        const mentorData = mentorDoc.data();
        
        // Get profile details from subcollection
        const profileRef = doc(db, "mentors", mentorDoc.id, "profile", "details");
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          const profileData = profileSnap.data();
          fetchedMentors.push({
            id: mentorDoc.id,
            name: profileData.name || mentorData.name || "",
            designation: profileData.designation || "",
            expertise: profileData.expertise || "",
            description: profileData.description || profileData.bio || "",
            profilePictureUrl: profileData.profilePictureUrl || profileData.profilePicture || "",
            linkedinUrl: profileData.linkedinUrl || profileData.linkedin || "",
            email: mentorData.email || profileData.email || "",
            createdAt: mentorData.createdAt || profileData.createdAt,
          });
        } else {
          // Fallback for mentors without profile subcollection (legacy data)
          fetchedMentors.push({
            id: mentorDoc.id,
            name: mentorData.name || "",
            designation: mentorData.designation || "",
            expertise: mentorData.expertise || "",
            description: mentorData.description || "",
            profilePictureUrl: mentorData.profilePictureUrl || "",
            linkedinUrl: mentorData.linkedinUrl || "",
            email: mentorData.email || "",
            createdAt: mentorData.createdAt,
          });
        }
      }

      setMentors(fetchedMentors);
      setFilteredMentors(filterMentors(fetchedMentors, searchQuery));
    } catch (err: any) {
      console.error("Error fetching mentors for admin page: ", err);
      let detailedError = "Failed to load mentors.";
      if (err.code === 'permission-denied' || (err.message && (err.message.toLowerCase().includes('permission-denied') || err.message.toLowerCase().includes('insufficient permissions')))) {
        detailedError = "Failed to load mentors: Missing or insufficient Firestore permissions. Please check your Firestore security rules for the 'mentors' collection to allow reads.";
      } else if (err.message) {
        detailedError += ` ${err.message}`;
      }
      setError(detailedError);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete mentor handler
  const handleDeleteMentor = async (mentorId: string, mentorName: string) => {
    const confirmMessage = `⚠️ PERMANENT DELETION WARNING ⚠️

Are you sure you want to delete "${mentorName}"?

This will:
✗ Remove all mentor data from the database
✗ Delete their Firebase Authentication account
✗ Remove their profile and subcollections
✗ Make their email address available for new registrations

This action CANNOT be undone!

Type "DELETE" to confirm:`;

    const userConfirmation = prompt(confirmMessage);
    
    if (userConfirmation !== "DELETE") {
      if (userConfirmation !== null) {
        toast({
          title: "Deletion Cancelled",
          description: "You must type 'DELETE' exactly to confirm deletion.",
          variant: "destructive",
        });
      }
      return;
    }

    try {
      // Pass true to delete both Firestore data AND Firebase Auth user
      const result = await deleteMentorAction(mentorId, true);
      
      if (result.success) {
        toast({
          title: "Mentor Completely Deleted",
          description: result.message,
        });
        fetchMentors();
      } else {
        toast({
          title: "Deletion Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting mentor: ", error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete mentor completely. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  async function onSubmit(values: MentorFormValues) {
    setIsSubmitting(true);
    try {
      // Pass both admin and mapped mentor profile fields to the action
      const mentorData = {
        // Admin fields for mentor document
        email: values.email,
        password: values.password,
        createdAt: new Date(),
        // Mentor profile fields for subcollection
        name: values.name,
        description: values.description,
        designation: values.designation,
        expertise: values.expertise,
        profilePictureUrl: values.profilePictureUrl || "",
        linkedinUrl: values.linkedinUrl || "",
      };
      const result = await createMentorAction(mentorData);
      if (result.success) {
        toast({
          title: "Mentor Added",
          description: `Mentor "${values.name}" has been successfully added.`,
        });
        form.reset();
        setIsCreateDialogOpen(false);
        fetchMentors(); // Refresh the list
      } else {
        toast({
          title: "Creation Failed",
          description: result.message || "Could not add the mentor.",
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

  // Toggle mentor details expansion
  const toggleMentorExpansion = (mentorId: string) => {
    setExpandedMentor(expandedMentor === mentorId ? null : mentorId);
  };

  // Handle mentor migration to new structure
  const handleMigration = async () => {
    if (!confirm('This will migrate all existing mentors to the new subcollection structure. Continue?')) {
      return;
    }

    setIsMigrating(true);
    try {
      const result = await runMigration();
      
      if (result.success) {
        toast({
          title: "Migration Successful",
          description: `Migrated: ${result.migrated} mentors, Skipped: ${result.skipped} mentors`,
        });
        fetchMentors(); // Refresh the list
      } else {
        toast({
          title: "Migration Failed",
          description: result.error || "Migration failed",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Migration Error",
        description: error.message || "An unexpected error occurred during migration",
        variant: "destructive",
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 w-full flex flex-col items-center py-10 px-2">
        <div className="w-full max-w-6xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
            <div className="px-8 pt-8 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 rounded-full p-3 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="admin-heading-2 mb-1">Mentors Management</h1>
                  <p className="admin-caption">Manage and organize your team of expert mentors</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleMigration}
                  disabled={isMigrating}
                  variant="outline"
                  className="border-amber-600 text-amber-400 hover:bg-amber-600/10 hover:text-amber-300" 
                  suppressHydrationWarning
                >
                  {isMigrating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Migrating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Migrate DB
                    </>
                  )}
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:flex-shrink-0">
                <Button 
                  variant="outline" 
                  onClick={fetchMentors}
                  className="bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-lg shadow-sm px-5 py-2 font-medium transition"
                  suppressHydrationWarning
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow px-5 py-2 font-medium transition w-full sm:w-auto" suppressHydrationWarning>
                      <PlusCircle className="mr-2 h-5 w-5" /> Add New Mentor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-xl border border-gray-200/50 shadow-lg rounded-2xl">
                    <DialogHeader>
                      <DialogTitle className="admin-heading-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200 rounded-lg w-10 h-10 flex items-center justify-center shadow-sm">
                          👨‍🏫
                        </div>
                        Add New Mentor
                      </DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Fill in the details below to add a new mentor and create their login account.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2 pl-3">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Dr. Jane Doe" {...field} disabled={isSubmitting} suppressHydrationWarning />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="designation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Designation</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Lead Innovator, Acme Corp" {...field} disabled={isSubmitting} suppressHydrationWarning />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="expertise"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Area of Expertise/Mentorship</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., AI & Machine Learning" {...field} disabled={isSubmitting} suppressHydrationWarning />
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
                              <FormLabel>Description / Bio</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Brief description of the mentor's background and experience..."
                                  {...field}
                                  rows={4}
                                  disabled={isSubmitting}
                                  suppressHydrationWarning
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address (for login)</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="mentor@example.com"
                                  {...field}
                                  disabled={isSubmitting}
                                  suppressHydrationWarning
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
                              <FormLabel>Set Temporary Password</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Enter a secure temporary password"
                                  {...field}
                                  disabled={isSubmitting}
                                  suppressHydrationWarning
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="profilePictureUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Profile Picture</FormLabel>
                              <FormControl>
                                <ImageUploadComponent
                                  value={field.value}
                                  onChange={(imageUrl) => {
                                    field.onChange(imageUrl || '');
                                  }}
                                  placeholder="Upload profile picture or enter URL"
                                  options={{
                                    maxSizeBytes: 3 * 1024 * 1024, // 3MB
                                    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
                                    quality: 0.8,
                                    maxWidth: 500,
                                    maxHeight: 500,
                                  }}
                                  onUploadComplete={(result) => {
                                    if (result.success) {
                                      console.log('Profile picture uploaded successfully:', result.metadata);
                                    }
                                  }}
                                  previewClassName="w-24 h-24 rounded-full"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="linkedinUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>LinkedIn Profile URL (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://linkedin.com/in/username"
                                  {...field}
                                  value={field.value || ''}
                                  disabled={isSubmitting}
                                  suppressHydrationWarning
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter className="mt-6">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsCreateDialogOpen(false)}
                            disabled={isSubmitting}
                            suppressHydrationWarning
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                            suppressHydrationWarning
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding...
                              </>
                            ) : (
                              'Add Mentor'
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-2xl shadow border border-gray-200">
            <div className="p-6">
              <div className="relative max-w-md mx-auto md:mx-0">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-blue-500" />
                </div>
                <Input
                  type="text"
                  placeholder="Search mentors by name, email, or expertise..."
                  className="pl-12 h-12 text-base border-gray-200 focus:border-blue-400 focus:ring-blue-300 shadow-sm rounded-xl bg-white focus:bg-white transition-all duration-300 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  suppressHydrationWarning
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-100 rounded-r-xl transition-colors"
                    suppressHydrationWarning
                  >
                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="p-6">
              {isLoading ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-blue-100/80 text-blue-700 border border-blue-200 rounded-lg w-10 h-10 flex items-center justify-center shadow-sm">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                    <span className="text-lg font-semibold text-gray-600">Loading mentors...</span>
                  </div>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 rounded-lg bg-gray-50/80 border border-gray-200/50 backdrop-blur-sm shadow-sm mb-4">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-16 w-16 rounded-full bg-blue-100/70 flex-shrink-0" />
                        <div className="space-y-3 flex-1 min-w-0">
                          <Skeleton className="h-6 w-3/4 bg-blue-100/70" />
                          <Skeleton className="h-4 w-1/2 bg-gray-100/70" />
                          <Skeleton className="h-4 w-2/3 bg-gray-100/70" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="border-2 border-red-200 bg-red-50/50 rounded-xl">
                  <div className="flex items-start space-x-4 p-6">
                    <div className="bg-red-100/80 text-red-700 border border-red-200 rounded-lg w-10 h-10 flex items-center justify-center shadow-sm flex-shrink-0">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-red-800 mb-2">Error loading mentors</h3>
                      <p className="text-red-600 mb-4 break-words">{error}</p>
                      <Button
                        onClick={fetchMentors}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 shadow-md hover:shadow-lg border-0"
                        suppressHydrationWarning
                      >
                        <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <motion.div
                  className="space-y-6"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {filteredMentors.length > 0 ? (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                          {searchQuery ? (
                            <>
                              <Search className="h-5 w-5 text-blue-600" />
                              <span>Search Results</span>
                            </>
                          ) : (
                            <>
                              <Users className="h-5 w-5 text-blue-600" />
                              <span>All Mentors</span>
                            </>
                          )}
                        </h2>
                        <div className="bg-green-100/80 text-green-700 border border-green-200/50 hover:bg-green-200/70 px-3 py-1.5 rounded-full font-semibold text-sm flex items-center">
                          <span className="mr-1">✨</span>
                          {filteredMentors.length} {filteredMentors.length === 1 ? 'Result' : 'Results'}
                        </div>
                      </div>
                      <div className="grid gap-6">
                        {filteredMentors.map((mentor, index) => (
                          <motion.div
                            key={mentor.id}
                            variants={item}
                            className="bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                          >
                            <div
                              className="p-6 cursor-pointer"
                              role="button"
                              tabIndex={0}
                              onClick={() => toggleMentorExpansion(mentor.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  toggleMentorExpansion(mentor.id);
                                }
                              }}
                            >
                              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div className="flex items-center space-x-4 min-w-0 flex-1">
                                  <div className="relative flex-shrink-0">
                                    <Avatar className="h-16 w-16 ring-2 ring-blue-100 shadow-md">
                                      {mentor.profilePictureUrl ? (
                                        <AvatarImage src={mentor.profilePictureUrl} alt={mentor.name} />
                                      ) : null}
                                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-bold">
                                        {getInitials(mentor.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-1 -right-1 bg-green-100/80 text-green-700 border border-green-200/50 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-sm">
                                      ✓
                                    </div>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h3 className="text-xl font-bold text-gray-800 truncate">{mentor.name}</h3>
                                    <p className="text-base text-gray-600 font-medium truncate">{mentor.designation}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <div className="bg-blue-100/80 text-blue-700 border border-blue-200/50 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">
                                        🎯
                                      </div>
                                      <span className="text-sm text-gray-500 truncate">{mentor.expertise}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-4 flex-shrink-0">
                                  <div className="bg-blue-100/80 text-blue-700 border border-blue-200/50 hover:bg-blue-200/70 px-3 py-1.5 rounded-full font-medium text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-32">
                                    {mentor.expertise}
                                  </div>
                                  <div className="bg-blue-100/80 text-blue-700 border border-blue-200 rounded-lg w-8 h-8 flex items-center justify-center shadow-sm flex-shrink-0">
                                    {expandedMentor === mentor.id ? (
                                      <ChevronUp className="h-5 w-5" />
                                    ) : (
                                      <ChevronDown className="h-5 w-5" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <AnimatePresence>
                              {expandedMentor === mentor.id && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-6 pb-6 pt-2 border-t border-gray-200/50 bg-gradient-to-r from-blue-50/30 to-indigo-50/30">
                                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 space-y-6 shadow-sm">
                                      <div>
                                        <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                          <div className="bg-blue-100/80 text-blue-700 border border-blue-200 rounded-lg w-7 h-7 flex items-center justify-center text-xs flex-shrink-0">
                                            📝
                                          </div>
                                          About
                                        </h4>
                                        <p className="text-gray-700 leading-relaxed break-words">{mentor.description}</p>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-white border border-gray-200/50 shadow-sm rounded-lg p-4 hover:border-blue-300/70 transition-colors">
                                          <div className="flex items-center gap-3">
                                            <div className="bg-blue-100/80 text-blue-700 border border-blue-200 rounded-lg w-9 h-9 flex items-center justify-center flex-shrink-0">
                                              <Mail className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                              <p className="text-sm font-semibold text-gray-600">Email</p>
                                              <a
                                                href={`mailto:${mentor.email}`}
                                                className="text-blue-600 hover:text-blue-700 font-medium transition-colors break-all"
                                              >
                                                {mentor.email}
                                              </a>
                                            </div>
                                          </div>
                                        </div>

                                        {mentor.linkedinUrl && (
                                          <div className="bg-white border border-gray-200/50 shadow-sm rounded-lg p-4 hover:border-blue-300/70 transition-colors">
                                            <div className="flex items-center gap-3">
                                              <div className="bg-blue-100/80 text-blue-700 border border-blue-200 rounded-lg w-9 h-9 flex items-center justify-center flex-shrink-0">
                                                <Linkedin className="h-4 w-4" />
                                              </div>
                                              <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-gray-600">LinkedIn</p>
                                                <a
                                                  href={mentor.linkedinUrl}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors inline-flex items-center gap-1"
                                                >
                                                  View Profile
                                                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                                </a>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-200/50">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                          <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0"></div>
                                          <span>Added {format(mentor.createdAt?.toDate() || new Date(), 'MMM d, yyyy')}</span>
                                        </div>

                                        <div className="flex gap-3">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="hover:text-amber-600 text-gray-500 hover:bg-amber-100/60 transition-all duration-200 rounded-full border border-gray-200 hover:border-amber-300"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                          
                                              toast({
                                                title: "Edit functionality coming soon",
                                                description: "The ability to edit mentors will be available in the next update.",
                                              });
                                            }}
                                            suppressHydrationWarning
                                          >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="hover:text-red-600 text-gray-500 hover:bg-red-100/60 transition-all duration-200 rounded-full border border-gray-200 hover:border-red-300"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteMentor(mentor.id, mentor.name);
                                            }}
                                            suppressHydrationWarning
                                          >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <motion.div
                      variants={item}
                      className="bg-white/90 backdrop-blur-xl border-2 border-dashed border-gray-300/50 rounded-2xl text-center py-16"
                    >
                      <div className="max-w-md mx-auto">
                        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-md">
                          <Users className="h-10 w-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-700 mb-2">No mentors found</h3>
                        <p className="text-lg text-gray-500 mb-6">
                          {searchQuery ? 'Try a different search term' : 'Get started by adding a new mentor'}
                        </p>
                        {!searchQuery && (
                          <Button
                            onClick={() => setIsCreateDialogOpen(true)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 shadow-md hover:shadow-lg border-0"
                            suppressHydrationWarning
                          >
                            <PlusCircle className="mr-2 h-5 w-5" />
                            Add Your First Mentor
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
