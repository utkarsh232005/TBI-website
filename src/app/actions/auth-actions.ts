
// src/app/actions/auth-actions.ts
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const AdminLoginFormSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type AdminLoginFormValues = z.infer<typeof AdminLoginFormSchema>;

export interface VerifyCredentialsResponse {
  success: boolean;
  message: string;
  redirectTo?: string;
}

const ADMIN_CREDENTIALS_PATH = 'admin_config/main_credentials';

export async function verifyAdminCredentials(
  values: AdminLoginFormValues
): Promise<VerifyCredentialsResponse> {
  try {
    const validatedValues = AdminLoginFormSchema.parse(values);

    const credsDocRef = doc(db, ADMIN_CREDENTIALS_PATH);
    const credsDocSnap = await getDoc(credsDocRef);

    if (!credsDocSnap.exists()) {
      console.error(
        `Admin credentials document not found at ${ADMIN_CREDENTIALS_PATH}. Please create it in Firestore with 'email' and 'password' fields.`
      );
      return {
        success: false,
        message:
          'Admin configuration error. Please contact support. (Hint: Create admin_config/main_credentials document in Firestore with email and password fields)',
      };
    }

    const storedCredentials = credsDocSnap.data();

    if (!storedCredentials || typeof storedCredentials !== 'object') {
      console.error(
        `Admin credentials document at ${ADMIN_CREDENTIALS_PATH} is empty or not an object.`
      );
      return {
        success: false,
        message:
          'Admin configuration error. Credentials document is malformed. Ensure it has email and password fields.',
      };
    }
    
    if (typeof storedCredentials.email !== 'string' || typeof storedCredentials.password !== 'string') {
      console.error(
        `Admin credentials document at ${ADMIN_CREDENTIALS_PATH} is missing 'email' or 'password' string fields.`
      );
      return {
        success: false,
        message:
          'Admin configuration error. Credentials document is missing required email/password string fields.',
      };
    }


    // WARNING: Plaintext password comparison. Highly insecure for production.
    // Passwords should be hashed and compared securely.
    if (
      validatedValues.email === storedCredentials.email &&
      validatedValues.password === storedCredentials.password
    ) {
      return {
        success: true,
        message: 'Admin Login Successful',
        redirectTo: '/admin/dashboard',
      };
    } else {
      return { success: false, message: 'Invalid admin email or password.' };
    }
  } catch (error: any) {
    console.error('[AuthActions] Error verifying admin credentials:', error);
    if (error instanceof z.ZodError) {
      return { success: false, message: 'Invalid input data.' };
    }
    // Check if it's a Firestore permission error
    if (error.code === 'permission-denied' || (error.message && (error.message.toLowerCase().includes('permission denied') || error.message.toLowerCase().includes('insufficient permissions')))) {
      return {
        success: false,
        message: 'Login Failed: Firestore permission denied. Please check your Firestore security rules to allow reading the admin credentials document.',
      };
    }
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return {
      success: false,
      message: `An unexpected error occurred during login: ${errorMessage}`,
    };
  }
}
