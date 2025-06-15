'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Submission, CampusStatus } from "@/app/admin/dashboard/types";
import { format } from 'date-fns';
import { FileTextIcon, UserCircle, KeyRound, Mail, CalendarDays, FlaskConical, Building, Landmark, Phone, ExternalLink, GraduationCap, User, Info } from "lucide-react";
import { SubmissionActions } from "@/app/admin/dashboard/components/SubmissionActions";
import { useState } from "react";

interface OnCampusSubmissionCardProps {
  submission: Submission;
  processingAction: { id: string; type: 'accept' | 'reject' } | null;
  onProcessAction: (id: string, action: 'accept' | 'reject', name: string, email: string) => void;
  onViewDetails: (submission: Submission) => void;
}

const formatDate = (date: Date | string | undefined) => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), "PPpp");
  } catch {
    return 'Invalid Date';
  }
};

export function OnCampusSubmissionCard({
  submission,
  processingAction,
  onProcessAction,
  onViewDetails,
}: OnCampusSubmissionCardProps) {
  const getStatusBadgeClasses = (status: Submission['status']) =>
    status === 'accepted'
      ? 'bg-teal-500/10 text-teal-400'
      : status === 'rejected'
        ? 'bg-rose-500/10 text-rose-400'
        : 'bg-amber-500/10 text-amber-400';

  const getCampusBadgeClasses = (status?: CampusStatus) =>
    status === 'campus'
      ? 'bg-blue-500/10 text-blue-400'
      : status === 'off-campus'
        ? 'bg-purple-500/10 text-purple-400'
        : 'bg-neutral-500/10 text-neutral-400';

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-lg">{submission.name}</CardTitle>
        <CardDescription className="text-sm">
          {submission.email}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <div className="grid gap-2 text-sm mb-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span>{submission.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span>{submission.email}</span>
          </div>
          {submission.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{submission.phone}</span>
            </div>
          )}
          {submission.campus && (
            <div className="flex items-center gap-2">
              <Landmark className="h-4 w-4 text-gray-500" />
              <Badge variant="secondary">{submission.campus}</Badge>
            </div>
          )}
        </div>
        <Button onClick={() => onViewDetails(submission)} className="w-full">
          View Details
        </Button>
      </CardContent>
    </Card>
  );
} 