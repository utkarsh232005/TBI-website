// src/app/actions/mentor-request-actions.ts
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  getDoc, 
  updateDoc,
  query,
  where,
  getDocs,
  orderBy
} from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';
import type { 
  MentorRequest, 
  MentorRequestFormData, 
  AdminMentorRequestAction, 
  MentorDecisionAction,
  NotificationData
} from '@/types/mentor-request';
import { getUserData } from './user-actions';

// Validation schemas
const mentorRequestSchema = z.object({
  mentorId: z.string().min(1, "Mentor ID is required"),
  requestMessage: z.string().min(10, "Request message must be at least 10 characters"),
});

const adminActionSchema = z.object({
  requestId: z.string().min(1, "Request ID is required"),
  action: z.enum(['approve', 'reject']),
  notes: z.string().optional(),
});

const mentorDecisionSchema = z.object({
  requestId: z.string().min(1, "Request ID is required"),
  action: z.enum(['approve', 'reject']),
  notes: z.string().optional(),
});

// Helper function to send emails via Resend
async function sendEmailNotification(to: string, subject: string, body: string, htmlBody?: string): Promise<{ success: boolean; message: string; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY not found in environment variables.");
    console.log("------ SIMULATING EMAIL SENDING (RESEND_API_KEY missing) ------");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("Body:\n", body);
    if (htmlBody) {
      console.log("HTML Body:\n", htmlBody);
    }
    console.log("-----------------------------------------------------------");
    return { success: false, message: "Email sending disabled: RESEND_API_KEY not found.", error: "RESEND_API_KEY_MISSING" };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'TBI Platform <onboarding@resend.dev>';
    
    console.log("Attempting to send email:");
    console.log("From:", fromEmail);
    console.log("To:", to);
    console.log("Subject:", subject);
    
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

// Helper function to create notifications
async function createNotification(notificationData: Omit<NotificationData, 'createdAt'>): Promise<void> {
  try {
    await addDoc(collection(db, 'notifications'), {
      ...notificationData,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}

// Helper function to get detailed user profile information
async function getUserProfileDetails(userId: string): Promise<{
  name: string;
  email: string;
  phone?: string;
  college?: string;
  course?: string;
  yearOfStudy?: string;
  skills?: string[];
  bio?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
} | null> {
  try {
    // Try to get from users collection first
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        name: userData.name || 'N/A',
        email: userData.email || 'N/A',
        phone: userData.phone,
        college: userData.college,
        course: userData.course,
        yearOfStudy: userData.yearOfStudy,
        skills: userData.skills,
        bio: userData.bio,
        linkedinUrl: userData.linkedinUrl,
        portfolioUrl: userData.portfolioUrl,
      };
    }
    
    // If not found in users collection, try submissions (onboarding data)
    const submissionsQuery = query(
      collection(db, 'submissions'),
      where('uid', '==', userId)
    );
    const submissionsSnapshot = await getDocs(submissionsQuery);
    
    if (!submissionsSnapshot.empty) {
      const submissionData = submissionsSnapshot.docs[0].data();
      return {
        name: submissionData.personalInfo?.fullName || submissionData.name || 'N/A',
        email: submissionData.personalInfo?.email || submissionData.email || 'N/A',
        phone: submissionData.personalInfo?.phoneNumber,
        college: submissionData.personalInfo?.collegeName,
        course: submissionData.personalInfo?.course,
        yearOfStudy: submissionData.personalInfo?.yearOfStudy,
        skills: submissionData.technicalInfo?.technicalSkills,
        bio: submissionData.personalInfo?.aboutYourself,
        linkedinUrl: submissionData.personalInfo?.linkedinProfile,
        portfolioUrl: submissionData.personalInfo?.portfolioWebsite,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user profile details:', error);
    return null;
  }
}

// 1. User submits mentor request
export async function submitMentorRequest(
  userId: string,
  userEmail: string,
  userName: string,
  formData: MentorRequestFormData
): Promise<{ success: boolean; message: string; requestId?: string }> {
  console.log('submitMentorRequest called with:', { userId, userEmail, userName, formData });
  
  try {
    // Validate form data
    const validatedData = mentorRequestSchema.safeParse(formData);
    if (!validatedData.success) {
      console.error('Validation failed:', validatedData.error);
      return { success: false, message: "Invalid request data" };
    }

    console.log('Form data validated successfully');

    // Get mentor details
    const mentorDoc = await getDoc(doc(db, 'mentors', formData.mentorId));
    if (!mentorDoc.exists()) {
      console.error('Mentor not found:', formData.mentorId);
      return { success: false, message: "Mentor not found" };
    }

    const mentorData = mentorDoc.data();
    console.log('Mentor found:', { id: formData.mentorId, name: mentorData.name, email: mentorData.email });

    // Check if user already has a pending request for this mentor
    const existingRequestQuery = query(
      collection(db, 'mentorRequests'),
      where('userId', '==', userId),
      where('mentorId', '==', formData.mentorId),
      where('status', 'in', ['pending', 'admin_approved'])
    );
    
    const existingRequests = await getDocs(existingRequestQuery);
    if (!existingRequests.empty) {
      console.error('Duplicate request found');
      return { success: false, message: "You already have a pending request for this mentor" };
    }

    console.log('No duplicate request found, creating new request');

    // Create mentor request
    const requestData: Omit<MentorRequest, 'id'> = {
      userId,
      userEmail,
      userName,
      mentorId: formData.mentorId,
      mentorEmail: mentorData.email,
      mentorName: mentorData.name,
      status: 'pending',
      requestMessage: formData.requestMessage,
      createdAt: serverTimestamp() as any,
      updatedAt: serverTimestamp() as any,
    };

    console.log('About to add document to Firestore:', requestData);
    const docRef = await addDoc(collection(db, 'mentorRequests'), requestData);
    console.log('Document added successfully with ID:', docRef.id);

    revalidatePath('/admin/mentor-requests');
    
    return { 
      success: true, 
      message: "Mentor request submitted successfully! Admin will review your request.", 
      requestId: docRef.id 
    };

  } catch (error: any) {
    console.error("Error submitting mentor request:", error);
    return { success: false, message: "Failed to submit mentor request" };
  }
}

// 2. Admin processes mentor request
export async function processAdminMentorRequest(
  adminId: string,
  action: AdminMentorRequestAction
): Promise<{ success: boolean; message: string }> {
  try {
    // Validate action data
    const validatedAction = adminActionSchema.safeParse(action);
    if (!validatedAction.success) {
      return { success: false, message: "Invalid action data" };
    }

    // Get the request
    const requestDoc = await getDoc(doc(db, 'mentorRequests', action.requestId));
    if (!requestDoc.exists()) {
      return { success: false, message: "Request not found" };
    }

    const requestData = requestDoc.data() as MentorRequest;

    if (requestData.status !== 'pending') {
      return { success: false, message: "Request has already been processed" };
    }

    const newStatus = action.action === 'approve' ? 'admin_approved' : 'admin_rejected';

    // Update request status
    await updateDoc(doc(db, 'mentorRequests', action.requestId), {
      status: newStatus,
      adminNotes: action.notes || '',
      adminProcessedAt: serverTimestamp(),
      adminProcessedBy: adminId,
      updatedAt: serverTimestamp(),
    });

    if (action.action === 'reject') {
      // Send rejection email to user
      const rejectionEmailBody = `Dear ${requestData.userName},\n\nThank you for your interest in connecting with ${requestData.mentorName} through our TBI platform.\n\nAfter careful review, we regret to inform you that your mentor request cannot be approved at this time.\n\n${action.notes ? `Reason: ${action.notes}` : ''}\n\nWe encourage you to explore other mentors available on our platform who might be a better fit for your current needs.\n\nBest regards,\nThe TBI Team`;

      await sendEmailNotification(
        requestData.userEmail,
        "Update on Your Mentor Request",
        rejectionEmailBody
      );

      // Create notification for user
      await createNotification({
        userId: requestData.userId,
        type: 'mentor_request_rejected',
        title: 'Mentor Request Update',
        message: `Your request to connect with ${requestData.mentorName} was not approved by admin`,
        mentorId: requestData.mentorId,
        mentorName: requestData.mentorName,
        requestId: action.requestId,
        read: false,
      });

    } else { // Admin approves and notifies mentor
      const userDetails = await getUserProfileDetails(requestData.userId);

      const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/login`;
      const requestUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/mentor/requests`;

      const textEmailBody = `Dear ${requestData.mentorName},\n\nYou have a new mentorship request from ${userDetails?.name || requestData.userName}.\n\nPlease log in to your TBI Mentor Dashboard to review the request and respond:\n${requestUrl}\n\nIf you are not logged in, please go to: ${loginUrl}\n\nThank you for your guidance and support.\n\nBest regards,\nThe TBI Team`;

      const htmlEmailBody = `
        <p>Dear ${requestData.mentorName},</p>
        <p>You have a new mentorship request from <strong>${userDetails?.name || requestData.userName}</strong>.</p>
        <p>Please log in to your TBI Mentor Dashboard to review the full request and respond.</p>
        <a href="${requestUrl}">Click here to view your requests</a>
        <p>Thank you for your guidance and support.</p>
        <p>Best regards,<br>The TBI Team</p>
      `;

      await sendEmailNotification(
        requestData.mentorEmail,
        "🎓 You Have a New Mentorship Request",
        textEmailBody,
        htmlEmailBody
      );
    }

    revalidatePath('/admin/mentor-requests');
    
    return { 
      success: true, 
      message: action.action === 'approve' 
        ? "Request approved and mentor has been notified." 
        : "Request rejected and user notified." 
    };

  } catch (error: any) {
    console.error("Error processing admin mentor request:", error);
    return { success: false, message: "Failed to process request" };
  }
}

// 3. Mentor makes final decision
export async function processMentorDecision(
  action: MentorDecisionAction,
  mentorEmail: string // Added for security
): Promise<{ success: boolean; message: string }> {
  try {
    const validatedAction = mentorDecisionSchema.safeParse(action);
    if (!validatedAction.success) {
      return { success: false, message: "Invalid action data" };
    }

    const requestDoc = await getDoc(doc(db, 'mentorRequests', action.requestId));
    if (!requestDoc.exists()) {
      return { success: false, message: "Request not found" };
    }

    const requestData = requestDoc.data() as MentorRequest;

    if (requestData.mentorEmail !== mentorEmail) {
      return { success: false, message: "Unauthorized: You are not the assigned mentor for this request." };
    }

    if (requestData.status !== 'admin_approved') {
      return { success: false, message: "Request is not in a state to be processed by mentor" };
    }

    const newStatus = action.action === 'approve' ? 'mentor_approved' : 'mentor_rejected';

    await updateDoc(doc(db, 'mentorRequests', action.requestId), {
      status: newStatus,
      mentorNotes: action.notes || '',
      mentorProcessedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    if (action.action === 'approve') {
      const successEmailBody = `Dear ${requestData.userName},\n\nGreat news! ${requestData.mentorName} has accepted your mentorship request.\n\nYou can now reach out to your mentor directly at: ${requestData.mentorEmail}\n\n${action.notes ? `Mentor's message: ${action.notes}` : ''}\n\nWe're excited to see your mentorship journey begin!\n\nBest regards,\nThe TBI Team`;
      await sendEmailNotification(requestData.userEmail, "Mentorship Request Approved!", successEmailBody);
      await createNotification({ userId: requestData.userId, type: 'mentor_request_approved', title: 'Mentorship Approved!', message: `${requestData.mentorName} has accepted your mentorship request`, mentorId: requestData.mentorId, mentorName: requestData.mentorName, requestId: action.requestId, read: false });
    } else {
      const rejectionEmailBody = `Dear ${requestData.userName},\n\nThank you for your interest in connecting with ${requestData.mentorName}.\n\nAfter consideration, ${requestData.mentorName} is unable to take on new mentees at this time.\n\n${action.notes ? `Mentor's message: ${action.notes}` : ''}\n\nWe encourage you to explore other mentors available on our platform.\n\nBest regards,\nThe TBI Team`;
      await sendEmailNotification(requestData.userEmail, "Update on Your Mentorship Request", rejectionEmailBody);
      await createNotification({ userId: requestData.userId, type: 'mentor_request_rejected', title: 'Mentorship Request Update', message: `${requestData.mentorName} was unable to accept your mentorship request`, mentorId: requestData.mentorId, mentorName: requestData.mentorName, requestId: action.requestId, read: false });
    }

    revalidatePath('/mentor/requests');
    revalidatePath(`/mentor/requests/${action.requestId}`);
    revalidatePath('/user/mentor-requests');

    return { 
      success: true, 
      message: action.action === 'approve' ? "Mentorship request approved! User has been notified." : "Mentorship request declined. User has been notified." 
    };
  } catch (error: any) {
    console.error("Error processing mentor decision:", error);
    return { success: false, message: "Failed to process mentor decision" };
  }
}

// Get mentor requests for admin
export async function getAdminMentorRequests(): Promise<MentorRequest[]> {
  try {
    const q = query(
      collection(db, 'mentorRequests'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const requests: MentorRequest[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      requests.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        adminProcessedAt: data.adminProcessedAt?.toDate() || undefined,
        mentorProcessedAt: data.mentorProcessedAt?.toDate() || undefined,
        status: data.status || 'pending',
        userId: data.userId || '',
        mentorId: data.mentorId || '',
        mentorName: data.mentorName || 'Unknown Mentor',
        userName: data.userName || 'Unknown User',
        userEmail: data.userEmail || '',
        requestMessage: data.requestMessage || ''
      } as MentorRequest);
    });
    
    return requests;
  } catch (error: any) {
    console.error("Error fetching mentor requests:", error);
    if (error.code === 'permission-denied') {
      console.error("Permission denied: Check Firestore rules for mentorRequests collection");
    } else if (error.code === 'failed-precondition') {
      console.error("Failed precondition: mentorRequests collection might not exist or index might be missing");
    }
    return [];
  }
}

// Get mentor request by ID for a specific mentor
export async function getMentorRequestForMentor(
  requestId: string,
  mentorEmail: string
): Promise<{ success: boolean; request?: MentorRequest; userDetails?: any; error?: string }> {
  try {
    const requestDoc = await getDoc(doc(db, 'mentorRequests', requestId));
    
    if (!requestDoc.exists()) {
      return { success: false, error: "Request not found." };
    }

    const data = requestDoc.data();
    if (data.mentorEmail !== mentorEmail) {
      return { success: false, error: "You are not authorized to view this request." };
    }

    const requestData = { 
      id: requestDoc.id, 
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      adminProcessedAt: data.adminProcessedAt?.toDate(),
      mentorProcessedAt: data.mentorProcessedAt?.toDate(),
    } as MentorRequest;

    const userProfile = await getUserProfileDetails(requestData.userId);
    
    return { 
      success: true, 
      request: requestData,
      userDetails: userProfile || {
        name: requestData.userName,
        email: requestData.userEmail,
      }
    };
  } catch (error: any) {
    console.error("Error fetching request for mentor:", error);
    return { success: false, error: "An unexpected error occurred while fetching the request." };
  }
}


// Get mentor requests for a specific user
export async function getUserMentorRequests(userId: string): Promise<MentorRequest[]> {
  try {
    const q = query(
      collection(db, 'mentorRequests'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const requests: MentorRequest[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      requests.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        adminProcessedAt: data.adminProcessedAt?.toDate() || undefined,
        mentorProcessedAt: data.mentorProcessedAt?.toDate() || undefined,
        status: data.status || 'pending',
        userId: data.userId || userId,
        mentorId: data.mentorId || '',
        mentorName: data.mentorName || 'Unknown Mentor',
        userName: data.userName || 'Unknown User',
        userEmail: data.userEmail || '',
        requestMessage: data.requestMessage || ''
      } as MentorRequest);
    });
    
    return requests;
  } catch (error: any) {
    console.error("Error fetching user mentor requests:", error);
    if (error.code === 'permission-denied') {
      console.error("Permission denied: Check Firestore rules for mentorRequests collection");
    } else if (error.code === 'failed-precondition') {
      console.error("Failed precondition: mentorRequests collection might not exist or index might be missing");
    }
    return [];
  }
}

// Get approved mentees for a mentor
export async function getApprovedMentees(mentorEmail: string): Promise<{ success: boolean; mentees?: MentorRequest[]; error?: string }> {
  try {
    const q = query(
      collection(db, 'mentorRequests'),
      where('mentorEmail', '==', mentorEmail),
      where('status', '==', 'mentor_approved'),
      orderBy('mentorProcessedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const mentees: MentorRequest[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      mentees.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        adminProcessedAt: data.adminProcessedAt?.toDate(),
        mentorProcessedAt: data.mentorProcessedAt?.toDate(),
      } as MentorRequest);
    });
    
    return { success: true, mentees };
  } catch (error: any) {
    console.error("Error fetching approved mentees:", error);
    // Provide a more specific error message for easier debugging
    let errorMessage = "Failed to fetch mentees.";
    if (error.code === 'failed-precondition') {
        errorMessage = "Database query requires a specific index. The link to create it should be in your browser's developer console. You can also deploy it by running 'firebase deploy --only firestore:indexes' in your terminal.";
    } else if (error.code === 'permission-denied') {
        errorMessage = "Permission denied. Please check your Firestore security rules for the 'mentorRequests' collection.";
    }
    return { success: false, error: errorMessage };
  }
}

// Get a specific mentee's profile if the mentor is authorized
export async function getMenteeProfile(menteeUserId: string, mentorEmail: string): Promise<any> {
  try {
    // Security Check: Verify there's an approved mentorship relationship
    const q = query(
      collection(db, 'mentorRequests'),
      where('userId', '==', menteeUserId),
      where('mentorEmail', '==', mentorEmail),
      where('status', '==', 'mentor_approved')
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return { success: false, message: "Unauthorized: You are not the mentor for this user." };
    }

    // If authorized, fetch the user's full profile data
    const userProfileData = await getUserData(menteeUserId);

    if (!userProfileData.success) {
      return { success: false, message: "Could not retrieve mentee profile." };
    }

    return userProfileData;

  } catch (error: any) {
    console.error("Error getting mentee profile:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}
