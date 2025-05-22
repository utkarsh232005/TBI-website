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
          'Admin configuration error. Please contact support. (Hint: Create admin_config/main_credentials document in Firestore)',
      };
    }

    const storedCredentials = credsDocSnap.data();

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
  } catch (error) {
    console.error('[AuthActions] Error verifying admin credentials:', error);
    if (error instanceof z.ZodError) {
      return { success: false, message: 'Invalid input data.' };
    }
    return {
      success: false,
      message: 'An unexpected error occurred during login.',
    };
  }
}
