// src/ai/flows/admin-settings-flow.ts
'use server';
/**
 * @fileOverview Flow to update admin credentials.
 *
 * - updateAdminCredentialsFlow - Handles updating admin email and password in Firestore.
 * - UpdateAdminCredentialsInput - Input type for the flow.
 * - UpdateAdminCredentialsOutput - Output type for the flow.
 */

import { ai } from '@/ai/genkit'; // Assuming genkit is initialized in @/ai/genkit
import { z } from 'genkit'; // Updated Zod import
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';

const ADMIN_CREDENTIALS_PATH = 'admin_config/main_credentials';

// Define input schema using Zod
const UpdateAdminCredentialsInputSchema = z.object({
  newEmail: z.string().email().describe('The new email address for the admin.'),
  newPassword: z.string().min(8).describe('The new password for the admin (min 8 characters).'),
});
export type UpdateAdminCredentialsInput = z.infer<typeof UpdateAdminCredentialsInputSchema>;

// Define output schema using Zod
const UpdateAdminCredentialsOutputSchema = z.object({
  success: z.boolean().describe('Whether the update was successful.'),
  message: z.string().describe('A message indicating the outcome.'),
});
export type UpdateAdminCredentialsOutput = z.infer<typeof UpdateAdminCredentialsOutputSchema>;

// This flow doesn't use an LLM, it directly interacts with Firestore.
// Genkit is used here primarily for consistency in how backend operations are structured.
const updateAdminCredentialsFlow = ai.defineFlow(
  {
    name: 'updateAdminCredentialsFlow',
    inputSchema: UpdateAdminCredentialsInputSchema,
    outputSchema: UpdateAdminCredentialsOutputSchema,
  },
  async (input) => {
    const { newEmail, newPassword } = input;
    const credentialsDocRef = doc(db, ADMIN_CREDENTIALS_PATH);

    try {
      // WARNING: Storing password in plaintext. Highly insecure for production.
      // Passwords should be hashed before storage.
      await setDoc(credentialsDocRef, { // Use setDoc with merge:true or updateDoc carefully
        email: newEmail,
        password: newPassword, // Storing plaintext password
        updatedAt: serverTimestamp(),
      }, { merge: true }); // merge: true will create if not exists, or update if it does.

      return {
        success: true,
        message: 'Admin credentials updated successfully. Please use the new credentials to log in next time.',
      };
    } catch (error: any) {
      console.error('Error updating admin credentials in Firestore:', error);
      return {
        success: false,
        message: `Failed to update admin credentials: ${error.message || 'Unknown error'}`,
      };
    }
  }
);

// Exported wrapper function to call the flow
export async function performFlowUpdateAdminCredentials(
  input: UpdateAdminCredentialsInput
): Promise<UpdateAdminCredentialsOutput> {
  return updateAdminCredentialsFlow(input);
}
