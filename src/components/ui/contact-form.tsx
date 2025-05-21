
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
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// DUMMY_GOOGLE_FORM_LINK: This is a placeholder. Replace with your actual Google Form link for off-campus applicants.
// Ensure this link is the same as the one in hero-section.tsx
const DUMMY_GOOGLE_FORM_LINK_FOR_OFF_CAMPUS = 'https://docs.google.com/forms/d/e/YOUR_FORM_ID_HERE/viewform?usp=sf_link';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  companyName: z.string().optional(),
  idea: z.string().min(10, { message: "Please describe your idea in at least 10 characters." }),
  // campusStatus is handled by localStorage and added programmatically
});

export type ContactFormValues = z.infer<typeof formSchema>;

interface FirestoreSubmissionData {
  name: string;
  email: string;
  companyName?: string;
  idea: string;
  submittedAt: any; 
  campusStatus?: "campus" | "off-campus"; // Explicitly type this
  status: "pending" | "accepted" | "rejected";
}


export default function ContactForm() {
  const { toast } = useToast();
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      companyName: "",
      idea: "",
    },
  });

  async function onSubmit(values: ContactFormValues) {
    const campusStatusFromStorage = typeof window !== "undefined" ? localStorage.getItem('applicantCampusStatus') as "campus" | "off-campus" | null : null;

    if (campusStatusFromStorage === "off-campus") {
      toast({
        title: "Off-Campus Applications",
        description: "Off-campus applications should be submitted via the Google Form. Redirecting you now...",
        variant: "default",
        duration: 5000, // Give user time to read before redirect
      });
      // Redirect to the Google Form if an off-campus user tries to submit here
      setTimeout(() => {
        window.location.href = DUMMY_GOOGLE_FORM_LINK_FOR_OFF_CAMPUS;
      }, 3000); // Delay redirect slightly
      return; // Prevent submission to Firestore
    }

    // Proceed with Firestore submission only for campus users or if status is not 'off-campus'
    try {
      const dataForFirestore: FirestoreSubmissionData = {
        name: values.name,
        email: values.email,
        idea: values.idea,
        submittedAt: serverTimestamp(),
        status: "pending",
      };

      if (values.companyName) {
        dataForFirestore.companyName = values.companyName;
      }

      // Only set campusStatus if it's "campus" and came from localStorage for this form.
      // If campusStatusFromStorage is null, it means they came directly to the contact form.
      if (campusStatusFromStorage === "campus") {
        dataForFirestore.campusStatus = campusStatusFromStorage;
      } else if (!campusStatusFromStorage) {
        // If no status from localStorage (e.g. direct navigation to #contact),
        // you might want to default it or leave it undefined.
        // For now, we'll leave it undefined if not explicitly "campus".
      }
      
      // console.log("Data being sent to Firestore:", dataForFirestore); // For debugging
      const docRef = await addDoc(collection(db, "contactSubmissions"), dataForFirestore);
      
      toast({
        title: "Application Submitted!",
        description: "Thank you for your interest. We'll be in touch soon.",
        variant: "default", 
      });
      form.reset(); 
      // Clear the localStorage only if it was a 'campus' submission through this form
      if (campusStatusFromStorage === "campus" && typeof window !== "undefined") {
        localStorage.removeItem('applicantCampusStatus'); 
      }
    } catch (e: any) {
      console.error("Error adding document to Firestore: ", e);
      let errorMessage = "There was an error submitting your application. Please try again.";
      if (e instanceof Error && e.message) {
        errorMessage += ` Details: ${e.message}`;
      }
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Full Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g. Ada Lovelace" {...field} 
                  className="bg-card border-border focus:border-primary focus:ring-primary"
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
              <FormLabel className="text-foreground">Email Address</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="e.g. ada@example.com" {...field} 
                  className="bg-card border-border focus:border-primary focus:ring-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Company Name (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g. Tech Innovations Inc." {...field} 
                  className="bg-card border-border focus:border-primary focus:ring-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="idea"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Your Idea / Project</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Briefly describe your innovative idea or project..."
                  {...field}
                  className="min-h-[120px] bg-card border-border focus:border-primary focus:ring-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="lg" className="w-full font-poppins font-semibold group bg-primary hover:bg-primary/90">
          Let's Build the Future Together
          <Send className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Button>
      </form>
    </Form>
  );
}
