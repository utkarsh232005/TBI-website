"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CampusApplicationForm from "@/components/CampusApplicationForm";

interface ApplicationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ApplicationFormDialog({ open, onOpenChange }: ApplicationFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-montserrat text-2xl text-accent">
            Campus Incubation Application
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Ready to turn your vision into reality? Please fill out all required fields marked with *. 
            This form is for campus applicants with detailed startup information and file uploads.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <CampusApplicationForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}
