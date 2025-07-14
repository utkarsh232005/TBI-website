
import { Timestamp } from 'firebase/firestore';

export type SubmissionStatus = 'pending' | 'accepted' | 'rejected';
export type CampusStatus = 'campus' | 'off-campus' | undefined;

export interface Submission {
  id: string;
  name: string; // From fullName
  email: string; // From companyEmail

  // All possible fields from both forms
  fullName?: string;
  phone?: string;
  natureOfInquiry?: string;
  companyName?: string;
  companyEmail?: string;
  founderNames?: string;
  founderBio?: string;
  portfolioUrl?: string; // Also for LinkedIn
  teamInfo?: string;
  startupIdea?: string;
  problemSolving?: string;
  uniqueness?: string;

  // Dropdown fields
  domain?: string;
  sector?: string;

  // Legacy or simplified fields
  idea?: string; // From startupIdea

  // Metadata
  campusStatus?: CampusStatus;
  submittedAt: Date | Timestamp | string;
  status: SubmissionStatus;

  // Post-processing fields
  temporaryUserId?: string; // For login credentials before user logs in
  temporaryPassword?: string;
  firebaseUid?: string; // The final Firebase Auth UID
  processedByAdminAt?: Date | Timestamp | string;

  // Off-campus import specific fields
  source?: 'campus' | 'off-campus'; // Potentially from import logic
  developmentStage?: string;
  businessCategory?: string;
  contactInfo?: string;
  sourceRow?: number;
  importedAt?: Date | Timestamp | string;
  formSubmittedAt?: string;
  linkedinUrl?: string;

  // Deprecated fields that might still be in old documents
  targetAudience?: string;
  currentStage?: string;
  legalStatus?: string;
  attachmentBase64?: string;
  attachmentName?: string;
  campus?: string;
  yearOfStudy?: string;
  course?: string;
  linkedin?: string;
  startupName?: string;
  message?: string;
}

export interface ProcessingActionState {
  id: string;
  type: 'accept' | 'reject';
}
