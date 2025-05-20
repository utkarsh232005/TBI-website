
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

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  companyName: z.string().optional(),
  idea: z.string().min(10, { message: "Please describe your idea in at least 10 characters." }),
  campusStatus: z.string().optional(), // Remains in schema for type consistency if needed elsewhere
});

export type ContactFormValues = z.infer<typeof formSchema>;

// Interface for the actual data structure sent to Firestore
interface FirestoreSubmissionData {
  name: string;
  email: string;
  companyName?: string;
  idea: string;
  submittedAt: any; // For serverTimestamp
  campusStatus?: string;
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
      campusStatus: undefined, 
    },
  });

  async function onSubmit(values: ContactFormValues) {
    try {
      const campusStatusFromStorage = typeof window !== "undefined" ? localStorage.getItem('applicantCampusStatus') : null;
      
      const dataForFirestore: FirestoreSubmissionData = {
        name: values.name,
        email: values.email,
        idea: values.idea,
        submittedAt: serverTimestamp(),
      };

      if (values.companyName) {
        dataForFirestore.companyName = values.companyName;
      }

      if (campusStatusFromStorage) {
        dataForFirestore.campusStatus = campusStatusFromStorage;
      }

      // console.log("Data being sent to Firestore:", dataForFirestore);

      const docRef = await addDoc(collection(db, "contactSubmissions"), dataForFirestore);
      // console.log("Document written with ID: ", docRef.id); 
      toast({
        title: "Application Submitted!",
        description: "Thank you for your interest. We'll be in touch soon.",
        variant: "default", 
      });
      form.reset(); 
      if (campusStatusFromStorage && typeof window !== "undefined") {
        localStorage.removeItem('applicantCampusStatus'); 
      }
    } catch (e) {
      console.error("Error adding document to Firestore: ", e); // More detailed error logging
      let errorMessage = "There was an error submitting your application. Please try again.";
      if (e instanceof Error) {
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
