
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ContactForm from "@/components/ui/contact-form"; // Make sure ContactForm styles are also reviewed

interface ApplicationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ApplicationFormDialog({ open, onOpenChange }: ApplicationFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] bg-card">
        <DialogHeader>
          <DialogTitle className="font-montserrat text-2xl text-accent">Incubation Application</DialogTitle> {/* Title to accent */}
          <DialogDescription className="text-muted-foreground">
            Ready to turn your vision into reality? Fill out the form below.
            This form is for campus applicants. Off-campus applicants should use the provided Google Form link.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ContactForm /> {/* Ensure ContactForm's submit button also uses accent */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
