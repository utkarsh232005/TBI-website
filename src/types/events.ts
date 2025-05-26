import { DocumentData, Timestamp } from 'firebase/firestore';

export type EventStatus = 'pending' | 'approved' | 'rejected';

export interface EventDocument extends DocumentData {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  registrationLink?: string;
  imageUrl?: string;
  status: EventStatus;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface EventFormValues {
  title: string;
  description: string;
  date: Date;
  time: string;
  venue: string;
  registrationLink?: string;
  imageUrl?: string;
  status: EventStatus;
}
