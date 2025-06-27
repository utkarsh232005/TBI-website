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
import { createEmailToken, verifyEmailToken, markTokenAsUsed } from '@/lib/email-tokens';
import type { 
  MentorRequest, 
  MentorRequestFormData, 
  AdminMentorRequestAction, 
  MentorDecisionAction,
  NotificationData
} from '@/types/mentor-request';

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

// Helper function to create HTML email template for mentor notification
function createMentorNotificationHTML(
  mentorName: string,
  userDetails: any,
  requestMessage: string,
  acceptToken: string,
  rejectToken: string,
  reviewToken: string,
  appUrl: string
): string {
  const acceptUrl = `${appUrl}/mentor/requests?token=${acceptToken}`;
  const rejectUrl = `${appUrl}/mentor/requests?token=${rejectToken}`;
  const reviewUrl = `${appUrl}/mentor/requests?token=${reviewToken}`;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Mentorship Request</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .container {
                background: white;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #e9ecef;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #6366f1;
                margin-bottom: 10px;
            }
            .student-card {
                background: #f8f9ff;
                border: 1px solid #e0e7ff;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            .student-name {
                font-size: 20px;
                font-weight: bold;
                color: #4f46e5;
                margin-bottom: 10px;
            }
            .detail-row {
                display: flex;
                margin-bottom: 8px;
                align-items: center;
            }
            .detail-label {
                font-weight: 600;
                color: #6b7280;
                min-width: 120px;
            }
            .detail-value {
                color: #374151;
            }
            .message-section {
                background: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 15px;
                margin: 20px 0;
                border-radius: 0 8px 8px 0;
            }
            .actions {
                text-align: center;
                margin: 30px 0;
            }
            .btn {
                display: inline-block;
                padding: 12px 30px;
                margin: 0 10px;
                border-radius: 6px;
                text-decoration: none;
                font-weight: 600;
                font-size: 16px;
                transition: all 0.3s ease;
            }
            .btn-accept {
                background: #10b981;
                color: white;
            }
            .btn-accept:hover {
                background: #059669;
            }
            .btn-reject {
                background: #ef4444;
                color: white;
            }
            .btn-reject:hover {
                background: #dc2626;
            }
            .btn-review {
                background: #6366f1;
                color: white;
                margin-top: 15px;
                display: block;
            }
            .btn-review:hover {
                background: #4f46e5;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e9ecef;
                color: #6b7280;
                font-size: 14px;
            }
            .skills-list {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                margin-top: 5px;
            }
            .skill-tag {
                background: #ddd6fe;
                color: #5b21b6;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🚀 TBI Platform</div>
                <h1>New Mentorship Request</h1>
                <p>Hello ${mentorName}, you have a new mentorship opportunity!</p>
            </div>

            <div class="student-card">
                <div class="student-name">👨‍🎓 ${userDetails.name}</div>
                
                <div class="detail-row">
                    <span class="detail-label">📧 Email:</span>
                    <span class="detail-value">${userDetails.email}</span>
                </div>
                
                ${userDetails.phone ? `
                <div class="detail-row">
                    <span class="detail-label">📱 Phone:</span>
                    <span class="detail-value">${userDetails.phone}</span>
                </div>
                ` : ''}
                
                ${userDetails.college ? `
                <div class="detail-row">
                    <span class="detail-label">🏫 College:</span>
                    <span class="detail-value">${userDetails.college}</span>
                </div>
                ` : ''}
                
                ${userDetails.course ? `
                <div class="detail-row">
                    <span class="detail-label">📚 Course:</span>
                    <span class="detail-value">${userDetails.course}</span>
                </div>
                ` : ''}
                
                ${userDetails.yearOfStudy ? `
                <div class="detail-row">
                    <span class="detail-label">📅 Year:</span>
                    <span class="detail-value">${userDetails.yearOfStudy}</span>
                </div>
                ` : ''}
                
                ${userDetails.linkedinUrl ? `
                <div class="detail-row">
                    <span class="detail-label">💼 LinkedIn:</span>
                    <span class="detail-value"><a href="${userDetails.linkedinUrl}" style="color: #0066cc;">${userDetails.linkedinUrl}</a></span>
                </div>
                ` : ''}
                
                ${userDetails.portfolioUrl ? `
                <div class="detail-row">
                    <span class="detail-label">🌐 Portfolio:</span>
                    <span class="detail-value"><a href="${userDetails.portfolioUrl}" style="color: #0066cc;">${userDetails.portfolioUrl}</a></span>
                </div>
                ` : ''}
                
                ${userDetails.skills && userDetails.skills.length > 0 ? `
                <div class="detail-row" style="align-items: flex-start;">
                    <span class="detail-label">💡 Skills:</span>
                    <div class="skills-list">
                        ${userDetails.skills.map((skill: string) => `<span class="skill-tag">${skill}</span>`).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${userDetails.bio ? `
                <div style="margin-top: 15px;">
                    <div class="detail-label" style="margin-bottom: 8px;">📖 About:</div>
                    <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">
                        ${userDetails.bio}
                    </div>
                </div>
                ` : ''}
            </div>

            <div class="message-section">
                <strong>💬 Student's Message:</strong>
                <p style="margin: 10px 0 0 0; font-style: italic;">"${requestMessage}"</p>
            </div>

            <div class="actions">
                <p><strong>What would you like to do?</strong></p>
                <a href="${acceptUrl}" class="btn btn-accept">✅ Accept Request</a>
                <a href="${rejectUrl}" class="btn btn-reject">❌ Decline Request</a>
                <br>
                <a href="${reviewUrl}" class="btn btn-review">📝 Review & Respond</a>
            </div>

            <div class="footer">
                <p>This request has been reviewed and approved by our admin team.</p>
                <p>If you have any questions, please contact us at support@tbi.com</p>
                <p>© 2025 TBI Platform - Connecting Mentors with Future Innovators</p>
            </div>
        </div>
    </body>
    </html>
  `;
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
      const rejectionEmailBody = `Dear ${requestData.userName},

Thank you for your interest in connecting with ${requestData.mentorName} through our TBI platform.

After careful review, we regret to inform you that your mentor request cannot be approved at this time.

${action.notes ? `Reason: ${action.notes}` : ''}

We encourage you to explore other mentors available on our platform who might be a better fit for your current needs.

Best regards,
The TBI Team`;

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

    } else {
      // Get detailed user profile information
      const userProfile = await getUserProfileDetails(requestData.userId);
      const userDetails = userProfile || {
        name: requestData.userName,
        email: requestData.userEmail,
      };

      // Generate secure email tokens for mentor actions
      const approveToken = await createEmailToken(action.requestId, requestData.mentorEmail, 'approve');
      const rejectToken = await createEmailToken(action.requestId, requestData.mentorEmail, 'reject');
      const reviewToken = await createEmailToken(action.requestId, requestData.mentorEmail);

      // Send approval email to mentor with detailed HTML template
      const textEmailBody = `Dear ${requestData.mentorName},

You have received a new mentorship request through the TBI platform.

Student Details:
- Name: ${userDetails.name}
- Email: ${userDetails.email}
${userDetails.phone ? `- Phone: ${userDetails.phone}` : ''}
${userDetails.college ? `- College: ${userDetails.college}` : ''}
${userDetails.course ? `- Course: ${userDetails.course}` : ''}
${userDetails.yearOfStudy ? `- Year of Study: ${userDetails.yearOfStudy}` : ''}
${userDetails.linkedinUrl ? `- LinkedIn: ${userDetails.linkedinUrl}` : ''}
${userDetails.portfolioUrl ? `- Portfolio: ${userDetails.portfolioUrl}` : ''}

Student's Message: ${requestData.requestMessage}

${userDetails.bio ? `About the Student: ${userDetails.bio}` : ''}

This request has been reviewed and approved by our admin team. You can now choose to accept or decline this mentorship opportunity.

Quick Actions:
- Accept: ${process.env.NEXT_PUBLIC_APP_URL}/mentor/requests?token=${approveToken}&action=approve
- Decline: ${process.env.NEXT_PUBLIC_APP_URL}/mentor/requests?token=${rejectToken}&action=reject
- Review & Respond: ${process.env.NEXT_PUBLIC_APP_URL}/mentor/requests?token=${reviewToken}

If you accept, we will connect you directly with the student. If you decline, the student will be notified to explore other mentorship options.

Best regards,
The TBI Team`;

      const htmlEmailBody = createMentorNotificationHTML(
        requestData.mentorName,
        userDetails,
        requestData.requestMessage || '',
        approveToken,
        rejectToken,
        reviewToken,
        process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      );

      await sendEmailNotification(
        requestData.mentorEmail,
        "🎓 New Mentorship Request - Action Required",
        textEmailBody,
        htmlEmailBody
      );
    }

    revalidatePath('/admin/mentor-requests');
    
    return { 
      success: true, 
      message: action.action === 'approve' 
        ? "Request approved and forwarded to mentor" 
        : "Request rejected and user notified" 
    };

  } catch (error: any) {
    console.error("Error processing admin mentor request:", error);
    return { success: false, message: "Failed to process request" };
  }
}

// 3. Mentor makes final decision
export async function processMentorDecision(
  action: MentorDecisionAction
): Promise<{ success: boolean; message: string }> {
  try {
    // Validate action data
    const validatedAction = mentorDecisionSchema.safeParse(action);
    if (!validatedAction.success) {
      return { success: false, message: "Invalid action data" };
    }

    // Get the request
    const requestDoc = await getDoc(doc(db, 'mentorRequests', action.requestId));
    if (!requestDoc.exists()) {
      return { success: false, message: "Request not found" };
    }

    const requestData = requestDoc.data() as MentorRequest;

    if (requestData.status !== 'admin_approved') {
      return { success: false, message: "Request is not in a state to be processed by mentor" };
    }

    const newStatus = action.action === 'approve' ? 'mentor_approved' : 'mentor_rejected';

    // Update request status
    await updateDoc(doc(db, 'mentorRequests', action.requestId), {
      status: newStatus,
      mentorNotes: action.notes || '',
      mentorProcessedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    if (action.action === 'approve') {
      // Send success email to user
      const successEmailBody = `Dear ${requestData.userName},

Great news! ${requestData.mentorName} has accepted your mentorship request.

You can now reach out to your mentor directly at: ${requestData.mentorEmail}

${action.notes ? `Mentor's message: ${action.notes}` : ''}

We're excited to see your mentorship journey begin!

Best regards,
The TBI Team`;

      await sendEmailNotification(
        requestData.userEmail,
        "Mentorship Request Approved!",
        successEmailBody
      );

      // Create notification for user
      await createNotification({
        userId: requestData.userId,
        type: 'mentor_request_approved',
        title: 'Mentorship Approved!',
        message: `${requestData.mentorName} has accepted your mentorship request`,
        mentorId: requestData.mentorId,
        mentorName: requestData.mentorName,
        requestId: action.requestId,
        read: false,
      });

    } else {
      // Send rejection email to user
      const rejectionEmailBody = `Dear ${requestData.userName},

Thank you for your interest in connecting with ${requestData.mentorName}.

After consideration, ${requestData.mentorName} is unable to take on new mentees at this time.

${action.notes ? `Mentor's message: ${action.notes}` : ''}

We encourage you to explore other mentors available on our platform.

Best regards,
The TBI Team`;

      await sendEmailNotification(
        requestData.userEmail,
        "Update on Your Mentorship Request",
        rejectionEmailBody
      );

      // Create notification for user
      await createNotification({
        userId: requestData.userId,
        type: 'mentor_request_rejected',
        title: 'Mentorship Request Update',
        message: `${requestData.mentorName} was unable to accept your mentorship request`,
        mentorId: requestData.mentorId,
        mentorName: requestData.mentorName,
        requestId: action.requestId,
        read: false,
      });
    }

    return { 
      success: true, 
      message: action.action === 'approve' 
        ? "Mentorship request approved! User has been notified." 
        : "Mentorship request declined. User has been notified." 
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
        // Convert Firestore Timestamps to Date objects for Next.js compatibility
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        adminProcessedAt: data.adminProcessedAt?.toDate() || undefined,
        mentorProcessedAt: data.mentorProcessedAt?.toDate() || undefined,
        // Ensure required fields exist with defaults
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
    // Handle specific Firestore errors
    if (error.code === 'permission-denied') {
      console.error("Permission denied: Check Firestore rules for mentorRequests collection");
    } else if (error.code === 'failed-precondition') {
      console.error("Failed precondition: mentorRequests collection might not exist or index might be missing");
    }
    return [];
  }
}

// Secure mentor decision using email token
export async function processMentorDecisionWithToken(
  tokenId: string,
  action: 'approve' | 'reject',
  notes?: string
): Promise<{ success: boolean; message: string; requestId?: string }> {
  try {
    // Verify the email token
    const { valid, token: emailToken, error } = await verifyEmailToken(tokenId);
    
    if (!valid || !emailToken) {
      return { success: false, message: error || 'Invalid or expired token' };
    }

    // Check if token action matches requested action (if token has specific action)
    if (emailToken.action && emailToken.action !== action) {
      return { success: false, message: 'Token action mismatch' };
    }

    // Get the request
    const requestDoc = await getDoc(doc(db, 'mentorRequests', emailToken.requestId));
    if (!requestDoc.exists()) {
      return { success: false, message: "Request not found" };
    }

    const requestData = requestDoc.data() as MentorRequest;

    // Verify mentor email matches
    if (requestData.mentorEmail !== emailToken.mentorEmail) {
      return { success: false, message: "Token mentor mismatch" };
    }

    if (requestData.status !== 'admin_approved') {
      return { success: false, message: "Request is not in a state to be processed by mentor" };
    }

    const newStatus = action === 'approve' ? 'mentor_approved' : 'mentor_rejected';

    // Mark token as used
    await markTokenAsUsed(tokenId);

    // Update request status
    await updateDoc(doc(db, 'mentorRequests', emailToken.requestId), {
      status: newStatus,
      mentorNotes: notes || '',
      mentorProcessedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Create notification for user
    await createNotification({
      userId: requestData.userId,
      type: action === 'approve' ? 'mentor_request_approved' : 'mentor_request_rejected',
      title: 'Mentor Response Received',
      message: `${requestData.mentorName} has ${action}d your mentorship request`,
      mentorId: requestData.mentorId,
      mentorName: requestData.mentorName,
      requestId: emailToken.requestId,
      read: false,
    });

    // Send email notification to user
    const userEmailBody = action === 'approve' 
      ? `Great news! ${requestData.mentorName} has accepted your mentorship request.

We will connect you with your mentor shortly via email. You can also reach out to them directly at: ${requestData.mentorEmail}

${notes ? `Mentor's message: ${notes}` : ''}

Welcome to your mentorship journey!

Best regards,
The TBI Team`
      : `Thank you for your interest in connecting with ${requestData.mentorName}.

Unfortunately, they are unable to take on new mentees at this time.

${notes ? `Mentor's message: ${notes}` : ''}

We encourage you to explore other mentors who might be available to guide you on your journey.

Best regards,
The TBI Team`;

    await sendEmailNotification(
      requestData.userEmail,
      action === 'approve' 
        ? "🎉 Your Mentorship Request has been Accepted!" 
        : "Update on Your Mentorship Request",
      userEmailBody
    );

    revalidatePath('/mentor/requests');
    revalidatePath('/user/mentor-requests');
    
    return { 
      success: true, 
      message: action === 'approve' 
        ? "Mentorship request accepted successfully" 
        : "Mentorship request declined",
      requestId: emailToken.requestId
    };

  } catch (error: any) {
    console.error("Error processing mentor decision with token:", error);
    return { success: false, message: "Failed to process decision" };
  }
}

// Get mentor request by token (for display purposes)
export async function getMentorRequestByToken(
  tokenId: string
): Promise<{ success: boolean; request?: MentorRequest; userDetails?: any; error?: string }> {
  try {
    // Verify the email token
    const { valid, token: emailToken, error } = await verifyEmailToken(tokenId);
    
    if (!valid || !emailToken) {
      return { success: false, error: error || 'Invalid or expired token' };
    }

    // Get the request
    const requestDoc = await getDoc(doc(db, 'mentorRequests', emailToken.requestId));
    if (!requestDoc.exists()) {
      return { success: false, error: "Request not found" };
    }

    const data = requestDoc.data();
    const requestData = { 
      id: requestDoc.id, 
      ...data,
      // Convert Firestore Timestamps to Date objects for Next.js compatibility
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      adminProcessedAt: data.adminProcessedAt?.toDate() || undefined,
      mentorProcessedAt: data.mentorProcessedAt?.toDate() || undefined,
    } as MentorRequest;

    // Verify mentor email matches
    if (requestData.mentorEmail !== emailToken.mentorEmail) {
      return { success: false, error: "Token mentor mismatch" };
    }

    if (requestData.status !== 'admin_approved') {
      return { success: false, error: "This request is not available for processing" };
    }

    // Get detailed user information
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
    console.error("Error getting mentor request by token:", error);
    return { success: false, error: "Failed to load request" };
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
        // Convert Firestore Timestamps to Date objects for Next.js compatibility
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        adminProcessedAt: data.adminProcessedAt?.toDate() || undefined,
        mentorProcessedAt: data.mentorProcessedAt?.toDate() || undefined,
        // Ensure required fields exist with defaults
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
    // Handle specific Firestore errors
    if (error.code === 'permission-denied') {
      console.error("Permission denied: Check Firestore rules for mentorRequests collection");
    } else if (error.code === 'failed-precondition') {
      console.error("Failed precondition: mentorRequests collection might not exist or index might be missing");
    }
    return [];
  }
}
