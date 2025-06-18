// src/types/startup.ts
import { Timestamp } from 'firebase/firestore';

export interface Startup {
  id: string;
  name: string;
  logoUrl: string;
  description: string;
  websiteUrl?: string;
  funnelSource: string;
  session: string;
  monthYearOfIncubation: string;
  status: string;
  legalStatus: string;
  rknecEmailId: string;
  emailId: string;
  mobileNumber: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  dataAiHint?: string;
}

export interface StartupModalProps {
  startup: Startup | null;
  isOpen: boolean;
  onClose: () => void;
}
