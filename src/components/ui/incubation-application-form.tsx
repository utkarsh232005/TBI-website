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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const DOMAIN_OPTIONS = [
  "HealthTech",
  "EdTech",
  "FinTech",
  "AgriTech",
  "E-commerce",
  "AI/ML",
  "CleanTech",
  "Mobility",
  "Enterprise Software",
  "Other",
];
const SECTOR_OPTIONS = [
  "Manufacturing",
  "Services",
  "Retail",
  "Healthcare",
  "Education",
  "Finance",
  "Agriculture",
  "Hospitality",
  "Logistics",
  "Other",
];
const LEGAL_STATUS_OPTIONS = [
  "MSME SSI",
  "LLP",
  "Pvt. Ltd.",
  "Proprietorship",
  "Gumasta",
  "Family Owned Business",
  "Not registered",
];

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  companyName: z.string().optional(),
  idea: z.string().min(10, { message: "Please describe your idea in at least 10 characters." }),
  // New fields
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  inquiryType: z.enum(["Incubation", "Startup Idea", "General Question"], {
    required_error: "Please select the nature of your inquiry",
  }),
  companyEmail: z.string().email({ message: "Please enter a valid company email address" }),
  founderNames: z.string().min(1, { message: "Please enter at least one founder name" }),
  founderBio: z.string().optional(),
  linkedinUrl: z.string().url({ message: "Please enter a valid LinkedIn URL" }),
  teamInfo: z.string().optional(),
  ideaDescription: z.string().min(50, { message: "Please provide a detailed description of your startup idea" }),
  targetAudience: z.string().min(10, { message: "Please describe your target audience" }),
  problemStatement: z.string().optional(),
  uniqueValueProp: z.string().min(50, { message: "Please describe what makes your startup unique" }),
  currentStage: z.enum(["Ideation", "MVP", "Early Revenue", "Scaling"], {
    required_error: "Please select your current stage",
  }).optional(),
  supportingFile: z.any(), // We'll validate the file upload separately
  domain: z.enum([
    "HealthTech",
    "EdTech",
    "FinTech",
    "AgriTech",
    "E-commerce",
    "AI/ML",
    "CleanTech",
    "Mobility",
    "Enterprise Software",
    "Other",
  ], { required_error: "Please select your domain" }),
  sector: z.enum([
    "Manufacturing",
    "Services",
    "Retail",
    "Healthcare",
    "Education",
    "Finance",
    "Agriculture",
    "Hospitality",
    "Logistics",
    "Other",
  ], { required_error: "Please select your sector" }),
  legalStatus: z.enum([
    "MSME SSI",
    "LLP",
    "Pvt. Ltd.",
    "Proprietorship",
    "Gumasta",
    "Family Owned Business",
    "Not registered",
  ], { required_error: "Please select your legal status" }),
});

export type IncubationFormValues = z.infer<typeof formSchema>;

interface FirestoreSubmissionData {
  name: string;
  email: string;
  companyName?: string;
  idea: string;
  phone: string;
  inquiryType: string;
  companyEmail: string;
  founders: string[];
  founderBio?: string;
  linkedinUrl: string;
  teamInfo?: string;
  ideaDescription: string;
  targetAudience: string;
  problemStatement?: string;
  uniqueValueProp: string;
  currentStage?: string;
  supportingFile?: string;
  submittedAt: any;
  campusStatus?: "campus" | "off-campus";
  status: "pending" | "accepted" | "rejected";
  domain: string;
  sector: string;
  legalStatus: string;
}

const DUMMY_GOOGLE_FORM_LINK_FOR_OFF_CAMPUS = 'https://docs.google.com/forms/d/1WNPpTVLahffQ_n3rdDbnsVFjcXrKqslVFyk4Lmib2uo/viewform?edit_requested=true';

export default function IncubationApplicationForm() {
  const { toast } = useToast();
  const form = useForm<IncubationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      companyName: "",
      idea: "",
      phone: "",
      companyEmail: "",
      founderNames: "",
      founderBio: "",
      linkedinUrl: "",
      teamInfo: "",
      ideaDescription: "",
      targetAudience: "",
      problemStatement: "",
      uniqueValueProp: "",
      domain: undefined,
      sector: undefined,
      legalStatus: undefined,
    },
  });

  async function onSubmit(values: IncubationFormValues) {
    try {
      // 1. Read file as base64
      let fileBase64 = "";
      if (values.supportingFile && values.supportingFile.length > 0) {
        const file = values.supportingFile[0];
        fileBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve(reader.result as string);
          };
          reader.onerror = (err) => {
            reject(new Error("Failed to read file as base64"));
          };
          reader.readAsDataURL(file);
        });
      } else {
        throw new Error("Supporting document is required");
      }
      // 2. Firestore write
      const docData = {
        name: values.name,
        email: values.email,
        companyName: values.companyName,
        idea: values.idea,
        phone: values.phone,
        inquiryType: values.inquiryType,
        companyEmail: values.companyEmail,
        founders: values.founderNames, // string or array, as you prefer
        founderBio: values.founderBio,
        linkedinUrl: values.linkedinUrl,
        teamInfo: values.teamInfo,
        ideaDescription: values.ideaDescription,
        targetAudience: values.targetAudience,
        problemStatement: values.problemStatement,
        uniqueValueProp: values.uniqueValueProp,
        currentStage: values.currentStage,
        domain: values.domain,
        sector: values.sector,
        legalStatus: values.legalStatus,
        supportingFileBase64: fileBase64,
        submittedAt: serverTimestamp(),
        status: "new",
        campusStatus: "pending"
      };
      await addDoc(collection(db, "contactSubmissions"), docData);
      toast({
        title: "Application Submitted!",
        description: "Thank you for your interest. We'll be in touch soon.",
        variant: "default",
      });
      form.reset();
    } catch (e: any) {
      let errorMessage = "There was an error submitting your application.";
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
        {/* Full Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Full Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Ada Lovelace"
                  {...field}
                  className="bg-card border-border focus:border-accent focus:ring-accent"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email Address */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Email Address *</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="e.g. ada@example.com"
                  {...field}
                  className="bg-card border-border focus:border-accent focus:ring-accent"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Company Name */}
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Company Name (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Tech Innovators"
                  {...field}
                  className="bg-card border-border focus:border-accent focus:ring-accent"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Initial Idea/Project */}
        <FormField
          control={form.control}
          name="idea"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Your Idea / Project *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Briefly describe your initial idea or project"
                  {...field}
                  className="bg-card border-border focus:border-accent focus:ring-accent min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone Number */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Phone Number *</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="e.g. +91 9876543210"
                  {...field}
                  className="bg-card border-border focus:border-accent focus:ring-accent"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Nature of Inquiry */}
        <FormField
          control={form.control}
          name="inquiryType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Nature of Inquiry *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-card border-border focus:border-accent focus:ring-accent">
                    <SelectValue placeholder="Select the nature of your inquiry" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Incubation">Incubation</SelectItem>
                  <SelectItem value="Startup Idea">Startup Idea</SelectItem>
                  <SelectItem value="General Question">General Question</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Company Email */}
        <FormField
          control={form.control}
          name="companyEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Company Email *</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="e.g. contact@company.com"
                  {...field}
                  className="bg-card border-border focus:border-accent focus:ring-accent"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Founder Names */}
        <FormField
          control={form.control}
          name="founderNames"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Founder Name(s) *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter founder names, separated by commas"
                  {...field}
                  className="bg-card border-border focus:border-accent focus:ring-accent"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Founder Bio */}
        <FormField
          control={form.control}
          name="founderBio"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Founder Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about the founders' background and experience"
                  {...field}
                  className="bg-card border-border focus:border-accent focus:ring-accent min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* LinkedIn URL */}
        <FormField
          control={form.control}
          name="linkedinUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">LinkedIn or Portfolio URL *</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="e.g. https://linkedin.com/in/username"
                  {...field}
                  className="bg-card border-border focus:border-accent focus:ring-accent"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Team Information */}
        <FormField
          control={form.control}
          name="teamInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Team Information</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about your team members and their roles"
                  {...field}
                  className="bg-card border-border focus:border-accent focus:ring-accent min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Startup Idea Description */}
        <FormField
          control={form.control}
          name="ideaDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Describe Your Startup Idea *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide a detailed description of your startup idea"
                  {...field}
                  className="bg-card border-border focus:border-accent focus:ring-accent min-h-[150px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Target Audience */}
        <FormField
          control={form.control}
          name="targetAudience"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Target Audience *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Who are your target users/customers?"
                  {...field}
                  className="bg-card border-border focus:border-accent focus:ring-accent min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Problem Statement */}
        <FormField
          control={form.control}
          name="problemStatement"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">What Problem Are You Solving?</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the problem your startup aims to solve"
                  {...field}
                  className="bg-card border-border focus:border-accent focus:ring-accent min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Unique Value Proposition */}
        <FormField
          control={form.control}
          name="uniqueValueProp"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">What Makes Your Startup Unique? *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your unique value proposition and competitive advantage"
                  {...field}
                  className="bg-card border-border focus:border-accent focus:ring-accent min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Current Stage */}
        <FormField
          control={form.control}
          name="currentStage"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Current Stage of Startup</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-card border-border focus:border-accent focus:ring-accent">
                    <SelectValue placeholder="Select your startup's current stage" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Ideation">Ideation</SelectItem>
                  <SelectItem value="MVP">MVP</SelectItem>
                  <SelectItem value="Early Revenue">Early Revenue</SelectItem>
                  <SelectItem value="Scaling">Scaling</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Supporting File Upload */}
        <FormField
          control={form.control}
          name="supportingFile"
          render={({ field: { value, ...field } }) => (
            <FormItem>
              <FormLabel className="text-foreground">Supporting Document *</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  {...field}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    field.onChange(e.target.files);
                  }}
                  className="bg-card border-border focus:border-accent focus:ring-accent"
                />
              </FormControl>
              <p className="text-sm text-muted-foreground">
                Upload a PDF or Word document (max 10MB)
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Domain */}
        <FormField
          control={form.control}
          name="domain"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Domain *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your domain…" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DOMAIN_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Sector */}
        <FormField
          control={form.control}
          name="sector"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Sector *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your sector…" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SECTOR_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Legal Status */}
        <FormField
          control={form.control}
          name="legalStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Legal Status *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your legal status…" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {LEGAL_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-accent hover:bg-accent/90"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <>
              <Send className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Submit Application
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}