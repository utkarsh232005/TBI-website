
"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface CampusStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (status: "campus" | "off-campus") => void;
}

export function CampusStatusDialog({ open, onOpenChange, onSelect }: CampusStatusDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Your Applicant Status</AlertDialogTitle>
          <AlertDialogDescription>
            Please let us know if you are applying from a campus or off-campus.
            This helps us tailor our program information for you.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 sm:justify-center pt-4">
          <Button
            variant="default"
            onClick={() => {
              onSelect("campus");
              onOpenChange(false); // Explicitly close
            }}
            className="w-full sm:w-auto"
          >
            Campus Applicant
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              onSelect("off-campus");
              onOpenChange(false); // Explicitly close
            }}
            className="w-full sm:w-auto"
          >
            Off-Campus Applicant
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
