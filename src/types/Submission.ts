import { Timestamp } from 'firebase/firestore';

export type SubmissionStatus = 'pending' | 'accepted' | 'rejected';
export type CampusStatus = 'campus' | 'off-campus' | undefined;

export interface Submission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  linkedin?: string;
  course?: string;
  yearOfStudy?: string;
  campus?: string;
  companyName?: string;
  startupName?: string;
  idea?: string;
  startupIdea?: string;
  message?: string;
  campusStatus?: CampusStatus;
  submittedAt: Date | Timestamp | string;
  status: SubmissionStatus;
  temporaryUserId?: string;
  temporaryPassword?: string;
  processedByAdminAt?: Date | Timestamp | string;
  source?: 'campus' | 'off-campus';
  
  // New fields from CampusApplicationForm
  fullName?: string;
  natureOfInquiry?: string;
  companyEmail?: string;
  founderNames?: string;
  founderBio?: string;
  portfolioUrl?: string;
  teamInfo?: string;
  targetAudience?: string;
  problemSolving?: string;
  uniqueness?: string;
  currentStage?: string;
  
  // New dropdown fields
  domain?: string;
  sector?: string;
  legalStatus?: string;
  
  attachmentBase64?: string;
  attachmentName?: string;
}

export interface ProcessingActionState {
  id: string;
  type: 'accept' | 'reject';
}
