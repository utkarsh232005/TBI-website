"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import IncubationApplicationForm from "@/components/ui/incubation-application-form";

interface ApplicationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ApplicationFormDialog({ open, onOpenChange }: ApplicationFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-montserrat text-2xl text-accent">Incubation Application</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Ready to turn your vision into reality? Please fill out all required fields marked with *. Off-campus applicants should use the provided Google Form link instead.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <IncubationApplicationForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}
