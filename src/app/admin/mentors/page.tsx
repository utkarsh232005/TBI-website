
// src/app/admin/mentors/page.tsx
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
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <motion.div
        className="container mx-auto px-4 py-8"
        initial="hidden"
        animate="show"
        variants={container}
      >
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                  Mentors Management
                </h1>
                <p className="text-gray-400">
                  Manage and organize your team of expert mentors
                </p>
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
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-colors shadow-lg" suppressHydrationWarning>
                      <PlusCircle className="mr-2 h-4 w-4" /> Add New Mentor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] bg-gray-800 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-200 to-purple-300 bg-clip-text text-transparent">
                        Add New Mentor
                      </DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Fill in the details below to add a new mentor and create their login account.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
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
          </CardHeader>
          <CardContent>
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search mentors by name, email, or expertise..."
                className="pl-10 bg-gray-750 border-gray-700 focus:border-indigo-500 focus:ring-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                suppressHydrationWarning
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  suppressHydrationWarning
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-300" />
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-900/20 border border-red-800 text-red-200 p-4 rounded-lg flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Error loading mentors</p>
                  <p className="text-sm text-red-300 mt-1">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 border-red-800 text-red-200 hover:bg-red-900/30 hover:text-white"
                    onClick={fetchMentors}
                    suppressHydrationWarning
                  >
                    <RefreshCw className="mr-2 h-3 w-3" /> Try Again
                  </Button>
                </div>
              </div>
            ) : (
              <motion.div
                className="space-y-4"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {filteredMentors.length > 0 ? (
                  filteredMentors.map((mentor) => (
                    <motion.div
                      key={mentor.id}
                      variants={item}
                      className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden transition-all duration-200 hover:border-indigo-500/50"
                    >
                      <div
                        className="p-4 cursor-pointer flex items-center justify-between"
                        onClick={() => toggleMentorExpansion(mentor.id)}
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            {mentor.profilePictureUrl ? (
                              <AvatarImage src={mentor.profilePictureUrl} alt={mentor.name} />
                            ) : null}
                            <AvatarFallback className="bg-indigo-900/50 text-indigo-300">
                              {getInitials(mentor.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium text-gray-100">{mentor.name}</h3>
                            <p className="text-sm text-gray-400">{mentor.designation}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="border-indigo-500/50 text-indigo-300">
                            {mentor.expertise}
                          </Badge>
                          {expandedMentor === mentor.id ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedMentor === mentor.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-2 border-t border-gray-700">
                              <p className="text-gray-300 text-sm mb-4">{mentor.description}</p>

                              <div className="flex flex-wrap gap-3 text-sm">
                                <a
                                  href={`mailto:${mentor.email}`}
                                  className="inline-flex items-center text-indigo-400 hover:text-indigo-300 transition-colors"
                                >
                                  <Mail className="h-4 w-4 mr-1.5" />
                                  {mentor.email}
                                </a>

                                {mentor.linkedinUrl && (
                                  <a
                                    href={mentor.linkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                                  >
                                    <Linkedin className="h-4 w-4 mr-1.5" />
                                    LinkedIn
                                  </a>
                                )}

                                <span className="text-gray-500 text-xs flex items-center">
                                  <span className="w-1 h-1 rounded-full bg-gray-500 mr-1.5"></span>
                                  Added {format(mentor.createdAt?.toDate() || new Date(), 'MMM d, yyyy')}
                                </span>
                              </div>

                              <div className="mt-4 flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-amber-400 border-amber-500/30 hover:bg-amber-900/20 hover:text-amber-300"
                                  onClick={() => {
                                    // TODO: Implement edit functionality
                                    toast({
                                      title: "Edit functionality coming soon",
                                      description: "The ability to edit mentors will be available in the next update.",
                                    });
                                  }}
                                  suppressHydrationWarning
                                >
                                  <Edit className="h-3.5 w-3.5 mr-1.5" />
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-400 border-red-500/30 hover:bg-red-900/20 hover:text-red-300"
                                  onClick={() => handleDeleteMentor(mentor.id, mentor.name)}
                                  suppressHydrationWarning
                                >
                                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    variants={item}
                    className="text-center py-12 bg-gray-800/50 rounded-xl border border-dashed border-gray-700"
                  >
                    <Users className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-300">No mentors found</h3>
                    <p className="mt-1 text-sm text-gray-400">
                      {searchQuery ? 'Try a different search term' : 'Get started by adding a new mentor'}
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
