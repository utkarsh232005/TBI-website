// src/components/ui/mentor-request-dialog.tsx
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Send, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { submitMentorRequest } from '@/app/actions/mentor-request-actions';
import type { Mentor } from './mentor-card';

const mentorRequestSchema = z.object({
  requestMessage: z.string().min(10, {
    message: "Please provide at least 10 characters explaining why you'd like this mentor."
  }).max(500, {
    message: "Request message must be less than 500 characters."
  }),
});

type MentorRequestFormValues = z.infer<typeof mentorRequestSchema>;

interface MentorRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mentor: Mentor | null;
  userId: string;
  userEmail: string;
  userName: string;
}

export default function MentorRequestDialog({
  isOpen,
  onClose,
  mentor,
  userId,
  userEmail,
  userName,
}: MentorRequestDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<MentorRequestFormValues>({
    resolver: zodResolver(mentorRequestSchema),
    defaultValues: {
      requestMessage: "",
    },
  });

  const onSubmit = async (values: MentorRequestFormValues) => {
    if (!mentor) return;

    setIsSubmitting(true);
    console.log('Submitting mentor request with data:', {
      userId,
      userEmail, 
      userName,
      mentorId: mentor.id,
      requestMessage: values.requestMessage
    });
    
    try {
      const result = await submitMentorRequest(
        userId,
        userEmail,
        userName,
        {
          mentorId: mentor.id,
          requestMessage: values.requestMessage,
        }
      );

      console.log('Mentor request result:', result);

      if (result.success) {
        toast({
          title: "Request Submitted!",
          description: result.message,
        });
        form.reset();
        onClose();
      } else {
        console.error('Mentor request failed:', result.message);
        toast({
          title: "Failed to Submit Request",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Mentor request error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      onClose();
    }
  };

  if (!mentor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={mentor.avatarUrl} />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-lg font-semibold">{mentor.name}</div>
              <div className="text-sm text-muted-foreground">{mentor.designation}</div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Submit a request to connect with {mentor.name} as your mentor. 
            Your request will be reviewed by our admin team before being forwarded to the mentor.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Mentor's Expertise</h4>
              <p className="text-sm text-muted-foreground">{mentor.areaOfMentorship}</p>
            </div>

            <FormField
              control={form.control}
              name="requestMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Why would you like this mentor? *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please explain your goals, what you hope to learn, and why you think this mentor would be a good fit for you..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <div className="text-xs text-muted-foreground text-right">
                    {field.value?.length || 0}/500 characters
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Request
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
