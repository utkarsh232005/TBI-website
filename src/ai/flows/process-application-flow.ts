
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
  }).optional().describe('Details of the email that would be sent. Optional if email sending fails or is not applicable.'),
  temporaryUserId: z.string().optional().describe('Generated temporary user ID if accepted.'),
  temporaryPassword: z.string().optional().describe('Generated temporary password if accepted.'),
});
export type ProcessApplicationOutput = z.infer<typeof ProcessApplicationOutputSchema>;


async function sendEmailNotification(to: string, subject: string, body: string) {
  // In a real application, you would integrate with an email service provider
  // (e.g., SendGrid, Mailgun, AWS SES, or Firebase Trigger Email Extension).
  console.log("------ SIMULATING EMAIL SENDING ------");
  console.log("To:", to);
  console.log("Subject:", subject);
  console.log("Body:\n", body);
  console.log("--------------------------------------");
  // For this prototype, we just log. In a real app, this function would return a promise
  // indicating success or failure of the email sending operation.
  return { success: true, message: "Email logged to console (simulated)." };
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
        return { status: 'error', message: `Submission with ID ${submissionId} not found.` };
      }
      const submissionData = submissionSnap.data();
      if (submissionData.status !== 'pending') {
         return { status: 'error', message: `Submission ${submissionId} has already been processed (status: ${submissionData.status}).` };
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

        emailSubject = 'Congratulations! Your InnoNexus Application has been Accepted!';
        emailBody = `Dear ${applicantName},\n\nWe are thrilled to inform you that your application to InnoNexus has been accepted!\n\nWe were very impressed with your idea and believe in its potential. Here are your temporary login credentials to access our portal (feature coming soon):\nUser ID: ${temporaryUserId}\nPassword: ${temporaryPassword}\n\nPlease keep these safe. We will be in touch shortly with the next steps.\n\nWelcome to InnoNexus!\n\nBest regards,\nThe InnoNexus Team`;

      } else { // action === 'reject'
        updateData.status = 'rejected';
        emailSubject = 'Update on Your InnoNexus Application';
        emailBody = `Dear ${applicantName},\n\nThank you for your interest in InnoNexus and for taking the time to apply.\n\nAfter careful consideration, we regret to inform you that we will not be moving forward with your application at this time. The selection process is highly competitive, and we receive many qualified applications.\n\nWe wish you the best of luck in your future endeavors.\n\nSincerely,\nThe InnoNexus Team`;
      }

      await updateDoc(submissionRef, updateData);
      
      // Simulate sending email
      await sendEmailNotification(applicantEmail, emailSubject, emailBody);

      return {
        status: 'success',
        message: `Application ${action === 'accept' ? 'accepted' : 'rejected'} successfully.`,
        email: {
          to: applicantEmail,
          subject: emailSubject,
          body: emailBody,
        },
        temporaryUserId: temporaryUserId,
        temporaryPassword: temporaryPassword,
      };

    } catch (error: any) {
      console.error('Error processing application:', error);
      return {
        status: 'error',
        message: `Failed to process application: ${error.message}`,
      };
    }
  }
);

export async function processApplication(input: ProcessApplicationInput): Promise<ProcessApplicationOutput> {
  // This flow does not use an LLM prompt directly, it's procedural.
  // If we wanted an LLM to draft the email, we would define and call a prompt here.
  return processApplicationFlow(input);
}
