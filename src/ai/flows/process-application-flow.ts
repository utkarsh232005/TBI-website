
'use server';
/**
 * @fileOverview Flow to process application submissions (accept or reject).
 *
 * - processApplication - Handles accepting or rejecting an application,
 *   updating Firestore, and preparing a notification email.
 * - ProcessApplicationInput - Input type for the flow.
 * - ProcessApplicationOutput - Output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { Resend } from 'resend';

// Helper function to generate a simple random string
const generateRandomString = (length: number = 8) => {
  return Math.random().toString(36).substring(2, 2 + length);
};

const ProcessApplicationInputSchema = z.object({
  submissionId: z.string().describe('The ID of the contact submission document in Firestore.'),
  action: z.enum(['accept', 'reject']).describe('The action to take: "accept" or "reject".'),
  applicantName: z.string().describe("The name of the applicant."),
  applicantEmail: z.string().email().describe("The email of the applicant to send notification to."),
});
export type ProcessApplicationInput = z.infer<typeof ProcessApplicationInputSchema>;

const ProcessApplicationOutputSchema = z.object({
  status: z.enum(['success', 'error']).describe('The outcome of the operation.'),
  message: z.string().describe('A message describing the outcome.'),
  email: z.object({
    to: z.string(),
    subject: z.string(),
    body: z.string(),
    sent: z.boolean(),
    sendError: z.string().optional(),
  }).optional().describe('Details of the email operation. Optional if email sending is not applicable.'),
  temporaryUserId: z.string().optional().describe('Generated temporary user ID if accepted.'),
  temporaryPassword: z.string().optional().describe('Generated temporary password if accepted.'),
});
export type ProcessApplicationOutput = z.infer<typeof ProcessApplicationOutputSchema>;


async function sendEmailNotification(to: string, subject: string, body: string): Promise<{ success: boolean; message: string; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.error("**********************************************************************************");
    console.error("ERROR: RESEND_API_KEY not found in environment variables.");
    console.error("Email sending is DISABLED. The email below is a simulation logged to the console.");
    console.error("To enable real email sending, set RESEND_API_KEY in your .env.local file and restart the server.");
    console.error("**********************************************************************************");
    console.log("------ SIMULATING EMAIL SENDING (RESEND_API_KEY missing) ------");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("Body:\n", body);
    console.log("-----------------------------------------------------------");
    return { success: false, message: "Email sending disabled: RESEND_API_KEY not found. Logged to console.", error: "RESEND_API_KEY_MISSING" };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    // Use the configured FROM email address from environment variables
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'TBI Platform <onboarding@resend.dev>';
    
    console.log("Attempting to send email:");
    console.log("From:", fromEmail);
    console.log("To:", to);
    console.log("Subject:", subject);
    
    const { data, error } = await resend.emails.send({
      from: fromEmail, 
      to: [to],
      subject: subject,
      text: body, // For HTML emails, use 'html: "<strong>your html content</strong>"'
    });

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


const processApplicationFlow = ai.defineFlow(
  {
    name: 'processApplicationFlow',
    inputSchema: ProcessApplicationInputSchema,
    outputSchema: ProcessApplicationOutputSchema,
  },
  async (input) => {
    const { submissionId, action, applicantName, applicantEmail } = input;
    const submissionRef = doc(db, 'contactSubmissions', submissionId);

    try {
      const submissionSnap = await getDoc(submissionRef);
      if (!submissionSnap.exists()) {
        return { status: 'error' as const, message: `Submission with ID ${submissionId} not found.` };
      }
      const submissionData = submissionSnap.data();
      if (submissionData.status !== 'pending') {
         return { status: 'error' as const, message: `Submission ${submissionId} has already been processed (status: ${submissionData.status}).` };
      }

      let emailSubject = '';
      let emailBody = '';
      let updateData: any = {
        processedByAdminAt: serverTimestamp(),
      };
      let temporaryUserId: string | undefined = undefined;
      let temporaryPassword: string | undefined = undefined;

      if (action === 'accept') {
        temporaryUserId = generateRandomString(8);
        temporaryPassword = generateRandomString(10);
        
        updateData.status = 'accepted';
        updateData.temporaryUserId = temporaryUserId;
        updateData.temporaryPassword = temporaryPassword;

        emailSubject = 'Congratulations! Your RCEOM-TBI Application has been Accepted!';
        emailBody = `Dear ${applicantName},\n\nWe are thrilled to inform you that your application to RCEOM-TBI has been accepted!\n\nWe were very impressed with your idea and believe in its potential. Here are your temporary login credentials to access our portal (feature coming soon):\nUser ID: ${temporaryUserId}\nPassword: ${temporaryPassword}\n\nPlease keep these safe. We will be in touch shortly with the next steps.\n\nWelcome to RCEOM-TBI!\n\nBest regards,\nThe RCEOM-TBI Team`;

      } else { // action === 'reject'
        updateData.status = 'rejected';
        emailSubject = 'Update on Your RCEOM-TBI Application';
        emailBody = `Dear ${applicantName},\n\nThank you for your interest in RCEOM-TBI and for taking the time to apply.\n\nAfter careful consideration, we regret to inform you that we will not be moving forward with your application at this time. The selection process is highly competitive, and we receive many qualified applications.\n\nWe wish you the best of luck in your future endeavors.\n\nSincerely,\nThe RCEOM-TBI Team`;
      }

      await updateDoc(submissionRef, updateData);
      
      const emailResult = await sendEmailNotification(applicantEmail, emailSubject, emailBody);

      return {
        status: 'success' as const,
        message: `Application ${action === 'accept' ? 'accepted' : 'rejected'} successfully. ${emailResult.message}`,
        email: {
          to: applicantEmail,
          subject: emailSubject,
          body: emailBody,
          sent: emailResult.success,
          sendError: emailResult.error,
        },
        temporaryUserId: temporaryUserId,
        temporaryPassword: temporaryPassword,
      };

    } catch (error: any) {
      console.error('Error processing application:', error);
      return {
        status: 'error' as const,
        message: `Failed to process application: ${error.message}`,
      };
    }
  }
);

export async function processApplication(input: ProcessApplicationInput): Promise<ProcessApplicationOutput> {
  return processApplicationFlow(input);
}
