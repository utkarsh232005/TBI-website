// src/types/mentor-request.ts
import { Timestamp } from 'firebase/firestore';

export type MentorRequestStatus = 'pending' | 'admin_approved' | 'admin_rejected' | 'mentor_approved' | 'mentor_rejected';

// Base interface for data as stored in Firestore
export interface MentorRequestFirestore {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  mentorId: string;
  mentorEmail: string;
  mentorName: string;
  status: MentorRequestStatus;
  requestMessage?: string;
  adminNotes?: string;
  mentorNotes?: string;
  createdAt: Timestamp;
  adminProcessedAt?: Timestamp;
  adminProcessedBy?: string;
  mentorProcessedAt?: Timestamp;
  updatedAt: Timestamp;
}

// Interface for data as used in React components (after timestamp conversion)
export interface MentorRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  mentorId: string;
  mentorEmail: string;
  mentorName: string;
  status: MentorRequestStatus;
  requestMessage?: string;
  adminNotes?: string;
  mentorNotes?: string;
  createdAt: Date; // Always converted to Date in our functions
  adminProcessedAt?: Date; // Optional, converted to Date when present
  adminProcessedBy?: string;
  mentorProcessedAt?: Date; // Optional, converted to Date when present
  updatedAt: Date; // Always converted to Date in our functions
}

export interface MentorRequestFormData {
  mentorId: string;
  requestMessage: string;
}

export interface AdminMentorRequestAction {
  requestId: string;
  action: 'approve' | 'reject';
  notes?: string;
}

export interface MentorDecisionAction {
  requestId: string;
  action: 'approve' | 'reject';
  notes?: string;
}

// Email template data types
export interface UserRejectionEmailData {
  userName: string;
  userEmail: string;
  mentorName: string;
  reason?: string;
}

export interface MentorRequestEmailData {
  mentorName: string;
  mentorEmail: string;
  userName: string;
  userEmail: string;
  requestMessage: string;
  requestId: string;
}

export interface NotificationData {
  userId: string;
  type: 'mentor_request_approved' | 'mentor_request_rejected' | 'mentor_decision';
  title: string;
  message: string;
  mentorId?: string;
  mentorName?: string;
  requestId: string;
  createdAt: Timestamp;
  read: boolean;
}
