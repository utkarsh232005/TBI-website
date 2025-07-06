
// src/app/actions/mentor-actions.ts
'use server';

import { z } from 'zod';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { createUserWithEmailAndPassword } from 'firebase/auth';

// Schema matches the form validation schema in the page component
const mentorFormSchema = z.object({
  name: z.string().min(3),
  designation: z.string().min(3),
  expertise: z.string().min(3),
  description: z.string().min(10),
  profilePictureUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
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
    
    const { name, designation, expertise, description, profilePictureUrl, linkedinUrl, email, password } = validatedValues.data;

    // Create Firebase Auth user for the mentor
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Data to be stored in 'mentors' collection, now using UID as document ID
    const mentorData = {
      uid: firebaseUser.uid,
      name,
      designation,
      expertise,
      description,
      profilePictureUrl: profilePictureUrl || `https://placehold.co/100x100/7DF9FF/121212.png?text=${encodeURIComponent(name.substring(0,2))}`,
      linkedinUrl: linkedinUrl || null,
      email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Data for the 'users' collection to handle roles
    const userData = {
        uid: firebaseUser.uid,
        email,
        name,
        role: 'mentor',
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    // Use setDoc to specify the document ID as the user's UID
    await setDoc(doc(db, "mentors", firebaseUser.uid), mentorData);
    await setDoc(doc(db, "users", firebaseUser.uid), userData);
    
    revalidatePath('/admin/mentors');
    revalidatePath('/mentors');

    return { success: true, mentorId: firebaseUser.uid, message: "Mentor added and account created successfully." };

  } catch (error: any) {
    console.error("Error in createMentorAction: ", error);
    let errorMessage = "Failed to add mentor.";
    if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already registered. Please use a different email.";
    } else if (error.code === 'permission-denied') {
        errorMessage = "Permission denied. Check Firestore rules for 'mentors' and 'users' collections.";
    } else if (error.message) {
        errorMessage = error.message;
    }
    return { success: false, message: errorMessage };
  }
}
