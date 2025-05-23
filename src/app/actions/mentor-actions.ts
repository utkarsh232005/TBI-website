// src/app/actions/mentor-actions.ts
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

// Schema matches the form validation schema in the page component
const mentorFormSchema = z.object({
  name: z.string().min(3),
  designation: z.string().min(3),
  expertise: z.string().min(3),
  description: z.string().min(10),
  profilePictureUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  email: z.string().email(),
});

export type MentorFormValues = z.infer<typeof mentorFormSchema>;

interface CreateMentorResponse {
  success: boolean;
  message?: string;
  mentorId?: string;
}

export async function createMentorAction(values: MentorFormValues): Promise<CreateMentorResponse> {
  try {
    const validatedValues = mentorFormSchema.safeParse(values);
    if (!validatedValues.success) {
      console.error("Server-side validation failed for mentor:", validatedValues.error.flatten().fieldErrors);
      return { success: false, message: "Invalid input data for mentor. " + JSON.stringify(validatedValues.error.flatten().fieldErrors) };
    }
    
    const { name, designation, expertise, description, profilePictureUrl, linkedinUrl, email } = validatedValues.data;

    const mentorData = {
      name,
      designation,
      expertise,
      description,
      profilePictureUrl: profilePictureUrl || `https://placehold.co/100x100/7DF9FF/121212.png?text=${encodeURIComponent(name.substring(0,2))}`, // Default placeholder if empty
      linkedinUrl: linkedinUrl || null,
      email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "mentors"), mentorData);
    
    revalidatePath('/admin/mentors');
    revalidatePath('/mentors'); // Revalidate public mentors page

    return { success: true, mentorId: docRef.id, message: "Mentor added successfully." };

  } catch (error: any) {
    console.error("Error in createMentorAction: ", error);
    let errorMessage = "Failed to add mentor.";
    if (error.code === 'permission-denied') {
        errorMessage = "Permission denied. Check Firestore rules for 'mentors' collection.";
    } else if (error.message) {
        errorMessage = error.message;
    }
    return { success: false, message: errorMessage };
  }
}

// Placeholder for future actions
// export async function updateMentorAction(mentorId: string, values: Partial<MentorFormValues>): Promise<any> {}
// export async function deleteMentorAction(mentorId: string): Promise<any> {}
