import { z } from 'zod';
import { EventStatus } from '@/types/events';

export const eventFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  date: z.date({
    required_error: 'Date is required',
  }),
  time: z.string().min(1, 'Time is required'),
  venue: z.string().min(1, 'Venue is required'),
  registrationLink: z.string().url('Invalid URL').optional().or(z.literal('')),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  status: z.enum(['pending', 'approved', 'rejected'] as [EventStatus, ...EventStatus[]]).default('pending'),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;
