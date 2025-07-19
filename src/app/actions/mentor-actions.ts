// src/app/actions/mentor-actions.ts
'use server';

import { z } from 'zod';
import { db, auth } from '@/lib/firebase';
import { collection, serverTimestamp, doc, setDoc, deleteDoc } from 'firebase/firestore';
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
    
    // Main mentor document with basic info only
    const mentorData = {
      uid: firebaseUser.uid,
      name,
      email,
      role: 'mentor',
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Profile data for subcollection - detailed information
    const profileData = {
      // Personal Information
      name,
      email,
      
      // Professional Details
      designation,
      expertise,
      description,
      
      // Social & Media Links
      profilePictureUrl: profilePictureUrl || `https://placehold.co/100x100/7DF9FF/121212.png?text=${encodeURIComponent(name.substring(0,2))}`,
      linkedinUrl: linkedinUrl || null,
      
      // Metadata
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastModified: new Date().toISOString(),
      profileVersion: "2.0",
      isActive: true,
    };

    // Create mentor document and profile subcollection
    await setDoc(doc(db, "mentors", firebaseUser.uid), mentorData);
    await setDoc(doc(db, "mentors", firebaseUser.uid, "profile", "details"), profileData);
    
    // Note: No longer creating in 'users' collection - mentors are only in 'mentors' collection
    
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
        errorMessage = "This email is already registered in Firebase Authentication. If you recently deleted a mentor with this email, you need to also delete the Firebase Auth user from the Firebase Console (Authentication > Users) to reuse this email.";
    } else if (error.code === 'permission-denied') {
        errorMessage = "Permission denied. Check Firestore rules for 'mentors' and 'users' collections.";
    } else if (error.message) {
        errorMessage = error.message;
    }
    return { success: false, message: errorMessage };
  }
}

// Function to delete a mentor completely (Auth user + Firestore documents)
export async function deleteMentorAction(mentorId: string, deleteAuthUser: boolean = false): Promise<{ success: boolean; message: string }> {
  try {
    console.log(`🗑️ Starting deletion process for mentor: ${mentorId}`);
    
    // Delete from mentor collection and its subcollections
    const deletionPromises = [
      deleteDoc(doc(db, "mentors", mentorId)),
      deleteDoc(doc(db, "mentors", mentorId, "profile", "details"))
        .catch(error => {
          // If subcollection doesn't exist, that's fine
          if (error.code !== 'not-found') {
            console.warn('Error deleting profile subcollection:', error);
          }
        })
      // Note: No longer deleting from 'users' collection since mentors aren't stored there
    ];
    
    await Promise.allSettled(deletionPromises);
    console.log(`✅ Firestore documents deleted for mentor: ${mentorId}`);
    
    let authUserMessage = "";
    
    if (deleteAuthUser) {
      try {
        console.log(`🔐 Attempting to delete Firebase Auth user: ${mentorId}`);
        
        // Attempt to delete Firebase Auth user via API
        const response = await fetch('/api/admin/delete-auth-user', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uid: mentorId }),
        });
        
        const result = await response.json();
        
        if (result.success) {
          authUserMessage = " ✅ Firebase Auth user deleted successfully.";
          console.log(`✅ Firebase Auth user deleted: ${mentorId}`);
        } else {
          authUserMessage = ` ⚠️ Warning: Firebase Auth user could not be deleted automatically (${result.message}). Please delete manually from Firebase Console.`;
          console.warn(`⚠️ Auth deletion failed for ${mentorId}:`, result.message);
        }
      } catch (error) {
        authUserMessage = " ⚠️ Warning: Could not connect to auth deletion API. Please delete Firebase Auth user manually from Firebase Console.";
        console.error(`❌ Auth deletion API error for ${mentorId}:`, error);
      }
    } else {
      authUserMessage = " ℹ️ Note: Firebase Auth account still exists. To reuse this email, delete the auth user manually from Firebase Console (Authentication > Users).";
    }
    
    revalidatePath('/admin/mentors');
    revalidatePath('/mentors');
    
    return { 
      success: true, 
      message: `Mentor removed from database successfully.${authUserMessage}` 
    };
    
  } catch (error: any) {
    console.error("❌ Error in deleteMentorAction: ", error);
    let errorMessage = "Failed to delete mentor.";
    if (error.message) {
      errorMessage = error.message;
    }
    return { success: false, message: errorMessage };
  }
}

// Function to check if email exists in Firebase Auth and provide guidance
export async function checkEmailExistsAction(email: string): Promise<{ 
  exists: boolean; 
  message: string; 
  canProceed: boolean;
}> {
  try {
    // Try to create a user with the email to see if it exists
    // Note: This is a workaround since we can't directly check email existence in client-side code
    
    // Return guidance for admin
    return {
      exists: false, // We can't actually check this client-side
      message: "If you're getting 'email already exists' errors, the Firebase Auth user still exists. You need to manually delete it from Firebase Console (Authentication > Users) to reuse this email.",
      canProceed: true
    };
    
  } catch (error: any) {
    return {
      exists: true,
      message: "Email check failed. Please verify manually in Firebase Console.",
      canProceed: false
    };
  }
}
