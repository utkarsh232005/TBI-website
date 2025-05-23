// src/app/actions/event-actions.ts
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { format } from 'date-fns';

// Schema matches the form validation schema in the page component
const eventFormSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  date: z.date(),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  venue: z.string().min(3),
  applyLink: z.string().url().optional().or(z.literal('')),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;

interface CreateEventResponse {
  success: boolean;
  message?: string;
  eventId?: string;
}

export async function createEventAction(values: EventFormValues): Promise<CreateEventResponse> {
  try {
    // Validate the input values on the server side as well
    const validatedValues = eventFormSchema.safeParse(values);
    if (!validatedValues.success) {
      console.error("Server-side validation failed:", validatedValues.error.flatten().fieldErrors);
      return { success: false, message: "Invalid input data. " + validatedValues.error.flatten().fieldErrors };
    }
    
    const { title, description, date, time, venue, applyLink, imageUrl } = validatedValues.data;

    const eventData = {
      title,
      description,
      date: format(date, "yyyy-MM-dd"), // Store date as a consistent string format
      time,
      venue,
      applyLink: applyLink || null, // Store as null if empty
      imageUrl: imageUrl || null,   // Store as null if empty
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "events"), eventData);
    
    // Revalidate paths
    revalidatePath('/admin/events');
    revalidatePath('/events');

    return { success: true, eventId: docRef.id, message: "Event created successfully." };

  } catch (error: any) {
    console.error("Error in createEventAction: ", error);
    let errorMessage = "Failed to create event.";
    if (error.code === 'permission-denied') {
        errorMessage = "Permission denied. Check Firestore rules for 'events' collection.";
    } else if (error.message) {
        errorMessage = error.message;
    }
    return { success: false, message: errorMessage };
  }
}

// Placeholder for future actions
// export async function updateEventAction(eventId: string, values: Partial<EventFormValues>): Promise<any> {}
// export async function deleteEventAction(eventId: string): Promise<any> {}
