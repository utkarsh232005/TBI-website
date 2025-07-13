
// src/app/actions/mentor-actions.ts
'use server';

import { z } from 'zod';
import { db, auth } from '@/lib/firebase';
import { collection, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Resend } from 'resend';

// Helper function to send emails via Resend
// This is copied from mentor-request-actions.ts for now.
// In a larger app, this would be in a shared lib/email.ts file.
async function sendEmailNotification(to: string, subject: string, body: string, htmlBody?: string): Promise<{ success: boolean; message: string; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.error("**********************************************************************************");
    console.error("ERROR: RESEND_API_KEY not found in environment variables.");
    console.error("Email sending is DISABLED. The email below is a simulation logged to the console.");
    console.error("To enable real email sending, set RESEND_API_KEY in your .env file and restart the server.");
    console.error("**********************************************************************************");
    console.log("------ SIMULATING EMAIL SENDING (RESEND_API_KEY missing) ------");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("Body:\n", body);
    if (htmlBody) {
      console.log("HTML Body:\n", htmlBody);
    }
    console.log("-----------------------------------------------------------");
    return { success: false, message: "Email sending disabled: RESEND_API_KEY not found. Logged to console.", error: "RESEND_API_KEY_MISSING" };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'TBI Platform <onboarding@resend.dev>';
    
    const emailData: any = {
      from: fromEmail, 
      to: [to],
      subject: subject,
      text: body,
    };

    if (htmlBody) {
      emailData.html = htmlBody;
    }

    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error("Resend API Error:", error);
      const errorMessage = error.message || error.name || JSON.stringify(error) || 'Unknown Resend API error';
      return { success: false, message: `Failed to send email via Resend: ${errorMessage}`, error: JSON.stringify(error) };
    }

    console.log("Email sent successfully via Resend. ID:", data?.id);
    return { success: true, message: `Email sent successfully to ${to} via Resend.` };
  } catch (e: any) {
    console.error("Error in sendEmailNotification with Resend:", e);
    return { success: false, message: `Exception during email sending: ${e.message}`, error: e.toString() };
  }
}

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
    
    // Send welcome email with credentials
    const emailSubject = 'Welcome to the RCOEM-TBI Mentor Panel!';
    const emailBody = `Dear ${name},\n\nWelcome! An account has been created for you on the RCOEM-TBI platform.\n\nYou can now log in to the Mentor Panel to view requests and manage your mentorship activities.\n\nHere are your login credentials:\n\nLogin URL: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/login\nEmail: ${email}\nTemporary Password: ${password}\n\nPlease change your password after your first login.\n\nWe are excited to have you on board!\n\nBest regards,\nThe RCOEM-TBI Team`;

    const emailResult = await sendEmailNotification(email, emailSubject, emailBody);

    if (!emailResult.success) {
      console.warn("Mentor account created, but failed to send welcome email:", emailResult.message);
      // Don't fail the whole operation, but return a message indicating the email issue.
      return {
        success: true,
        mentorId: firebaseUser.uid,
        message: "Mentor added, but failed to send welcome email. Please share credentials manually."
      };
    }

    revalidatePath('/admin/mentors');
    revalidatePath('/mentors');

    return { success: true, mentorId: firebaseUser.uid, message: "Mentor added, account created, and welcome email sent successfully." };

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
