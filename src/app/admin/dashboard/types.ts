import { Timestamp } from 'firebase/firestore';

export type SubmissionStatus = 'pending' | 'accepted' | 'rejected';
export type CampusStatus = 'campus' | 'off-campus' | undefined;

export interface Submission {
  id: string;
  name: string;
  email: string;
  companyName?: string;
  idea: string;
  campusStatus?: CampusStatus;
  submittedAt: Date | Timestamp | string;
  status: SubmissionStatus;
  temporaryUserId?: string;
  temporaryPassword?: string;
  processedByAdminAt?: Date | Timestamp | string;
}

export interface ChartDataItem {
  name: string;
  value: number;
  fill: string;
}

export interface ProcessingActionState {
  id: string;
  type: 'accept' | 'reject';
}

export interface KpiData {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
}

export interface SubmissionTableProps {
  submissions: Submission[];
  processingAction: ProcessingActionState | null;
  onProcessAction: (id: string, action: 'accept' | 'reject', name: string, email: string) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry: () => void;
}
