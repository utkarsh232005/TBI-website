
'use client';

// This component is now largely a wrapper around OffCampusSubmissionCard as their structure is identical.
// If specific on-campus features are needed, they can be added here.
// For now, it re-uses the more detailed card for consistency.

import { OffCampusSubmissionCard } from './OffCampusSubmissionCard';
import { Submission } from "@/types/Submission";

interface OnCampusSubmissionCardProps {
  submission: Submission;
  processingAction: { id: string; type: 'accept' | 'reject' } | null;
  onProcessAction: (id: string, action: 'accept' | 'reject', name: string, email: string, campusStatus: Submission['campusStatus']) => void;
  onViewDetails: (submission: Submission) => void;
}

export function OnCampusSubmissionCard(props: OnCampusSubmissionCardProps) {
  return <OffCampusSubmissionCard {...props} />;
}
