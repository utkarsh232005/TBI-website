
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ContactForm from "@/components/ui/contact-form";

interface ApplicationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ApplicationFormDialog({ open, onOpenChange }: ApplicationFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] bg-card">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-2xl text-primary">Incubation Application</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Ready to turn your vision into reality? Fill out the form below.
            This form is for campus applicants. Off-campus applicants should use the provided Google Form link.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ContactForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}
