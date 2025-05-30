
// src/app/actions/auth-actions.ts
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, QuerySnapshot, DocumentData } from 'firebase/firestore';

// --- Admin Credentials ---
const AdminLoginFormSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
export type AdminLoginFormValues = z.infer<typeof AdminLoginFormSchema>;

export interface VerifyAdminCredentialsResponse {
  success: boolean;
  message: string;
  redirectTo?: string;
}
const ADMIN_CREDENTIALS_PATH = 'admin_config/main_credentials';

export async function verifyAdminCredentials(
  values: AdminLoginFormValues
): Promise<VerifyAdminCredentialsResponse> {
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

// --- User Credentials (for accepted applicants) ---
const UserLoginFormSchema = z.object({
  identifier: z.string().min(1, { message: "User ID or Email is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});
export type UserLoginFormValues = z.infer<typeof UserLoginFormSchema>;

export interface VerifyUserCredentialsResponse {
  success: boolean;
  message: string;
  redirectTo?: string;
}

export async function verifyUserCredentials(
  values: UserLoginFormValues
): Promise<VerifyUserCredentialsResponse> {
  try {
    const validatedValues = UserLoginFormSchema.parse(values);
    const { identifier, password } = validatedValues;

    const submissionsRef = collection(db, 'contactSubmissions');
    // Query for accepted submissions matching either email or temporaryUserId
    const q = query(
      submissionsRef,
      where('status', '==', 'accepted'),
      // Firestore doesn't support OR queries directly on different fields.
      // We'll fetch potential matches by email and then by temporaryUserId if needed,
      // or fetch all accepted and filter, which is less efficient for large datasets.
      // For simplicity here, we'll try matching by email, then by temporaryUserId if no email match.
      // A more robust solution for larger scale might involve two separate queries or restructuring data.
    );

    const querySnapshot = await getDocs(q);
    let matchedUser: DocumentData | null = null;

    querySnapshot.forEach((docSnap) => {
      const userData = docSnap.data();
      if (userData.email === identifier || userData.temporaryUserId === identifier) {
        matchedUser = userData;
      }
    });

    if (matchedUser) {
      // WARNING: Plaintext password comparison. Highly insecure for production.
      if (matchedUser.temporaryPassword === password) {
        return {
          success: true,
          message: 'User login successful!',
          redirectTo: '/user/dashboard', // Placeholder, adjust as needed
        };
      } else {
        return { success: false, message: 'Invalid password.' };
      }
    } else {
      return { success: false, message: 'User not found or application not accepted.' };
    }
  } catch (error: any) {
    console.error('[AuthActions] Error verifying user credentials:', error);
    if (error instanceof z.ZodError) {
      return { success: false, message: 'Invalid input data.' };
    }
    if (error.code === 'permission-denied' || (error.message && (error.message.toLowerCase().includes('permission denied') || error.message.toLowerCase().includes('insufficient permissions')))) {
      return {
        success: false,
        message: 'Login Failed: Firestore permission denied. Please check your Firestore security rules.',
      };
    }
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return {
      success: false,
      message: `An unexpected error occurred during user login: ${errorMessage}`,
    };
  }
}
