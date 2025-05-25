// src/app/admin/mentors/page.tsx
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
import { Users, PlusCircle, Loader2, AlertCircle, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase';
import { collection, getDocs, Timestamp, orderBy, query } from 'firebase/firestore';
import { createMentorAction } from '@/app/actions/mentor-actions';
import { format } from 'date-fns';

// Schema for the mentor creation/edit form
const mentorFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  designation: z.string().min(3, { message: "Designation must be at least 3 characters." }),
  expertise: z.string().min(3, { message: "Expertise area must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  profilePictureUrl: z.string().url({ message: "Please enter a valid image URL." }).optional().or(z.literal('')),
  linkedinUrl: z.string().url({ message: "Please enter a valid LinkedIn URL." }).optional().or(z.literal('')),
  email: z.string().email({ message: "Please enter a valid email address." }),
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

export default function AdminMentorsPage() {
  const [mentors, setMentors] = useState<MentorDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
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
    },
  });

  const fetchMentors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const mentorsCollection = collection(db, "mentors");
      const q = query(mentorsCollection, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedMentors: MentorDocument[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedMentors.push({
          id: doc.id,
          name: data.name,
          designation: data.designation,
          expertise: data.expertise,
          description: data.description,
          profilePictureUrl: data.profilePictureUrl,
          linkedinUrl: data.linkedinUrl,
          email: data.email,
          createdAt: data.createdAt,
        });
      });
      setMentors(fetchedMentors);
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

  useEffect(() => {
    fetchMentors();
  }, []);

  async function onSubmit(values: MentorFormValues) {
    setIsSubmitting(true);
    try {
      const result = await createMentorAction(values);
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

  return (
    <div className="w-full py-6 px-4 sm:px-6">
      <Card className="bg-[#121212] border border-[#2A2A2A] shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-2xl overflow-hidden">
        <CardHeader className="bg-[#1A1A1A] border-b border-[#2A2A2A] p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-[#E0E0E0] text-2xl font-bold tracking-tight">MENTOR MANAGEMENT</CardTitle>
              <CardDescription className="text-[#9CA3AF] mt-1">Create and manage mentors for TBI</CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl px-6 py-2.5 shadow-[0_4px_15px_rgba(79,70,229,0.4)] transform transition-all duration-200 hover:scale-105 hover:shadow-[0_6px_20px_rgba(79,70,229,0.6)] font-medium">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Mentor
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] bg-[#1A1A1A] border border-[#2A2A2A] text-[#E0E0E0] shadow-[0_8px_30px_rgba(0,0,0,0.4)] rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-[#E0E0E0] text-xl font-semibold">Add New Mentor</DialogTitle>
                  <DialogDescription className="text-[#9CA3AF]">
                    Fill out the form below to add a new mentor to the TBI network.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#E0E0E0]">Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Dr. Jane Smith" {...field} disabled={isSubmitting}
                              className="bg-[#252525] border-[#3A3A3A] text-[#E0E0E0] focus:border-[#4F46E5] rounded-lg placeholder:text-[#6B7280]" />
                          </FormControl>
                          <FormMessage className="text-rose-400" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="designation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#E0E0E0]">Designation</FormLabel>
                          <FormControl>
                            <Input placeholder="Chief Technology Officer" {...field} disabled={isSubmitting}
                              className="bg-[#252525] border-[#3A3A3A] text-[#E0E0E0] focus:border-[#4F46E5] rounded-lg placeholder:text-[#6B7280]" />
                          </FormControl>
                          <FormMessage className="text-rose-400" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="expertise"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#E0E0E0]">Area of Expertise</FormLabel>
                          <FormControl>
                            <Input placeholder="DevOps engineering" {...field} disabled={isSubmitting}
                              className="bg-[#252525] border-[#3A3A3A] text-[#E0E0E0] focus:border-[#4F46E5] rounded-lg placeholder:text-[#6B7280]" />
                          </FormControl>
                          <FormMessage className="text-rose-400" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#E0E0E0]">Short Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Brief introduction of the mentor..." {...field} disabled={isSubmitting}
                              className="min-h-[120px] bg-[#252525] border-[#3A3A3A] text-[#E0E0E0] focus:border-[#4F46E5] rounded-lg placeholder:text-[#6B7280]" />
                          </FormControl>
                          <FormMessage className="text-rose-400" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="profilePictureUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#E0E0E0]">Profile Picture URL (Optional)</FormLabel>
                          <FormControl>
                            <Input type="url" placeholder="https://example.com/profile-pic.jpg" {...field} disabled={isSubmitting}
                              className="bg-[#252525] border-[#3A3A3A] text-[#E0E0E0] focus:border-[#4F46E5] rounded-lg placeholder:text-[#6B7280]" />
                          </FormControl>
                          <FormMessage className="text-rose-400" />
                          <p className="text-xs text-[#9CA3AF]">For now, please provide a URL. Direct upload coming soon.</p>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="linkedinUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#E0E0E0]">LinkedIn URL (Optional)</FormLabel>
                          <FormControl>
                            <Input type="url" placeholder="https://linkedin.com/in/username" {...field} disabled={isSubmitting}
                              className="bg-[#252525] border-[#3A3A3A] text-[#E0E0E0] focus:border-[#4F46E5] rounded-lg placeholder:text-[#6B7280]" />
                          </FormControl>
                          <FormMessage className="text-rose-400" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#E0E0E0]">Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="mentor@example.com" {...field} disabled={isSubmitting}
                              className="bg-[#252525] border-[#3A3A3A] text-[#E0E0E0] focus:border-[#4F46E5] rounded-lg placeholder:text-[#6B7280]" />
                          </FormControl>
                          <FormMessage className="text-rose-400" />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isSubmitting}
                        className="border-[#3A3A3A] text-[#E0E0E0] hover:bg-[#252525] rounded-lg">
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}
                        className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg shadow-[0_4px_10px_rgba(79,70,229,0.3)] transform transition-transform hover:scale-105">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Mentor
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-[#4F46E5]" />
              <span className="ml-2 text-[#9CA3AF]">Loading mentors...</span>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-10">
              <AlertCircle className="h-8 w-8 text-rose-500" />
              <span className="ml-2 text-[#9CA3AF]">{error}</span>
            </div>
          ) : mentors.length === 0 ? (
            <div className="text-center py-16 bg-[#151515] rounded-2xl border border-[#2A2A2A] shadow-inner">
              <Users className="mx-auto h-16 w-16 text-[#4F46E5] opacity-70 mb-4" />
              <p className="text-[#9CA3AF] text-lg">No mentors found. Get started by adding one!</p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-6 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl px-6 py-2.5 shadow-[0_4px_15px_rgba(79,70,229,0.4)] transform transition-all duration-200 hover:scale-105 hover:shadow-[0_6px_20px_rgba(79,70,229,0.6)] font-medium">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add First Mentor
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#2A2A2A] shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader className="bg-[#1A1A1A]">
                    <TableRow>
                      <TableHead className="text-[#E0E0E0] font-semibold uppercase text-xs tracking-wider py-5 px-6 border-b border-[#2A2A2A]">Avatar</TableHead>
                      <TableHead className="text-[#E0E0E0] font-semibold uppercase text-xs tracking-wider py-5 px-6 border-b border-[#2A2A2A]">Name</TableHead>
                      <TableHead className="text-[#E0E0E0] font-semibold uppercase text-xs tracking-wider py-5 px-6 border-b border-[#2A2A2A]">Designation</TableHead>
                      <TableHead className="text-[#E0E0E0] font-semibold uppercase text-xs tracking-wider py-5 px-6 border-b border-[#2A2A2A]">Expertise</TableHead>
                      <TableHead className="text-[#E0E0E0] font-semibold uppercase text-xs tracking-wider py-5 px-6 border-b border-[#2A2A2A]">Email</TableHead>
                      <TableHead className="text-[#E0E0E0] font-semibold uppercase text-xs tracking-wider py-5 px-6 border-b border-[#2A2A2A]">Added On</TableHead>
                      <TableHead className="text-[#E0E0E0] font-semibold uppercase text-xs tracking-wider py-5 px-6 border-b border-[#2A2A2A] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mentors.map((mentor, index) => (
                      <TableRow 
                        key={mentor.id} 
                        className={`${index % 2 === 0 ? 'bg-[#121212]' : 'bg-[#1E1E1E]'} hover:bg-[#252525] transition-all duration-200`}
                      >
                        <TableCell className="py-5 px-6 border-b border-[#2A2A2A]">
                          <Avatar className="h-12 w-12 ring-2 ring-[#4F46E5]/30 shadow-lg">
                            <AvatarImage src={mentor.profilePictureUrl || `https://placehold.co/100x100/1E1E1E/4F46E5.png?text=${mentor.name.substring(0,2)}`} alt={mentor.name} />
                            <AvatarFallback className="bg-[#4F46E5]/10 text-[#4F46E5] font-medium">{mentor.name.substring(0,2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="py-5 px-6 border-b border-[#2A2A2A] text-[#E0E0E0]">
                          <div className="flex flex-col">
                            <span className="font-medium">{mentor.name}</span>
                            <span className="text-xs text-[#9CA3AF] mt-1">{mentor.linkedinUrl && '✓ LinkedIn Profile'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-5 px-6 border-b border-[#2A2A2A] text-[#E0E0E0]">
                          <span className="text-sm">{mentor.designation}</span>
                        </TableCell>
                        <TableCell className="py-5 px-6 border-b border-[#2A2A2A] text-[#E0E0E0]">
                          <span className="px-3 py-1.5 bg-[#1A1A1A] rounded-full text-sm inline-block shadow-inner">
                            {mentor.expertise}
                          </span>
                        </TableCell>
                        <TableCell className="py-5 px-6 border-b border-[#2A2A2A] text-[#E0E0E0]">
                          <span className="text-sm">{mentor.email}</span>
                        </TableCell>
                        <TableCell className="py-5 px-6 border-b border-[#2A2A2A] text-[#E0E0E0]">
                          <span className="text-sm">{mentor.createdAt ? format(mentor.createdAt.toDate(), "PP") : 'N/A'}</span>
                        </TableCell>
                        <TableCell className="py-5 px-6 border-b border-[#2A2A2A] text-right">
                          <div className="flex items-center justify-end space-x-3">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-full h-9 w-9 text-[#E0E0E0] hover:text-[#4F46E5] hover:bg-[#4F46E5]/10 transition-all duration-200 shadow-sm hover:shadow-[0_4px_12px_rgba(79,70,229,0.3)] hover:scale-110" 
                              disabled
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-full h-9 w-9 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 shadow-sm hover:shadow-[0_4px_12px_rgba(239,68,68,0.3)] hover:scale-110" 
                              disabled
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
