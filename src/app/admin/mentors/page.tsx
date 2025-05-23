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
import { Users, PlusCircle, Loader2, AlertCircle, Edit, Trash2, Briefcase, Brain, LinkIcon, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase';
import { collection, getDocs, Timestamp, orderBy, query } from 'firebase/firestore';
import { createMentorAction } from '@/app/actions/mentor-actions'; // We will create this
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
      console.error("Error fetching mentors: ", err);
      setError("Failed to load mentors. " + err.message);
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
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-2xl font-orbitron">
              <Users className="mr-3 h-7 w-7 text-primary" />
              Mentors Management
            </CardTitle>
            <CardDescription>
              Add, view, edit, and delete mentor profiles.
            </CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Mentor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px] bg-card">
              <DialogHeader>
                <DialogTitle>Add New Mentor</DialogTitle>
                <DialogDescription>Fill in the details for the new mentor.</DialogDescription>
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
                          <Input placeholder="e.g., Dr. Jane Doe" {...field} disabled={isSubmitting} />
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
                          <Input placeholder="e.g., Lead Innovator, Acme Corp" {...field} disabled={isSubmitting} />
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
                          <Input placeholder="e.g., AI & Machine Learning" {...field} disabled={isSubmitting} />
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
                          <Textarea placeholder="Brief description of the mentor's background and experience..." {...field} rows={4} disabled={isSubmitting} />
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
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="mentor@example.com" {...field} disabled={isSubmitting} />
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
                        <FormLabel>Profile Picture URL (Optional)</FormLabel>
                        <FormControl>
                          <Input type="url" placeholder="https://placehold.co/100x100.png" {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground">Direct upload coming soon. For now, provide a URL.</p>
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
                          <Input type="url" placeholder="https://linkedin.com/in/mentorname" {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Add Mentor
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading mentors...</span>
            </div>
          ) : error ? (
            <div className="text-destructive flex flex-col items-center py-10">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p className="font-semibold">Error loading mentors</p>
              <p>{error}</p>
              <Button onClick={fetchMentors} variant="outline" className="mt-4">Try Again</Button>
            </div>
          ) : mentors.length === 0 ? (
             <div className="text-center py-10">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No mentors found. Get started by adding one!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Avatar</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Expertise</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Added On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mentors.map((mentor) => (
                    <TableRow key={mentor.id}>
                      <TableCell>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={mentor.profilePictureUrl || `https://placehold.co/100x100/121212/7DF9FF.png?text=${mentor.name.substring(0,2)}`} alt={mentor.name} />
                          <AvatarFallback>{mentor.name.substring(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{mentor.name}</TableCell>
                      <TableCell>{mentor.designation}</TableCell>
                      <TableCell>{mentor.expertise}</TableCell>
                      <TableCell>{mentor.email}</TableCell>
                       <TableCell>{mentor.createdAt ? format(mentor.createdAt.toDate(), "PP") : 'N/A'}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" disabled> {/* Placeholder for Edit */}
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled> {/* Placeholder for Delete */}
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
