// src/getFirebaseApp()/actions/getFirebaseAuth()-actions.ts
'use server';

import { z } from 'zod';
import { getFirebaseDb, getFirebaseAuth } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/getFirebaseAuth()';

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

    const credsDocRef = doc(getFirebaseDb(), ADMIN_CREDENTIALS_PATH);
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
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});
export type UserLoginFormValues = z.infer<typeof UserLoginFormSchema>;

export interface VerifyUserCredentialsResponse {
  success: boolean;
  message: string;
  redirectTo?: string;
  userData?: {
    uid: string;
    email: string;
    name: string;
  };
}

export async function verifyUserCredentials(
  values: UserLoginFormValues
): Promise<VerifyUserCredentialsResponse> {
  try {
    const validatedValues = UserLoginFormSchema.parse(values);
    const { email, password } = validatedValues;

    try {
      // Authenticate with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      const firebaseUser = userCredential.user;
      
      // Keep user signed in - do not sign out
      // The user context will handle the getFirebaseAuth() state
      
      // Get user data from users collection
      const userDocRef = doc(getFirebaseDb(), 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // If user document doesn't exist, sign out and return error
        await signOut(getFirebaseAuth());
        return { 
          success: false, 
          message: 'User profile not found. Please contact support.' 
        };
      }
      
      const userData = userDoc.data();
      
      // Check if user is active
      if (userData.status !== 'active') {
        // If user is not active, sign out and return error
        await signOut(getFirebaseAuth());
        return { 
          success: false, 
          message: 'Your account is not active. Please contact support.' 
        };
      }

      return {
        success: true,
        message: 'User login successful!',
        redirectTo: '/user/dashboard',
        userData: {
          uid: firebaseUser.uid,
          email: firebaseUser.email || email,
          name: userData.name || 'User',
        }
      };
      
    } catch (authError: any) {
      console.error('Firebase Auth error:', authError);
      
      // Handle specific Firebase Auth errors
      if (authError.code === 'getFirebaseAuth()/user-not-found' || authError.code === 'getFirebaseAuth()/wrong-password') {
        return { success: false, message: 'Invalid email or password.' };
      } else if (authError.code === 'getFirebaseAuth()/user-disabled') {
        return { success: false, message: 'This account has been disabled.' };
      } else if (authError.code === 'getFirebaseAuth()/too-many-requests') {
        return { success: false, message: 'Too many failed login attempts. Please try again later.' };
      } else {
        return { success: false, message: 'Login failed. Please try again.' };
      }
    }
    
  } catch (error: any) {
    console.error('[AuthActions] Error verifying user credentials:', error);
    if (error instanceof z.ZodError) {
      return { success: false, message: 'Invalid input data.' };
    }
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return {
      success: false,
      message: `An unexpected error occurred during user login: ${errorMessage}`,
    };
  }
}

// Password Reset Schema
const PasswordResetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export interface PasswordResetResponse {
  success: boolean;
  message: string;
}

export async function resetPassword(email: string): Promise<PasswordResetResponse> {
  try {
    // Validate email format
    const validatedEmail = PasswordResetSchema.parse({ email });
    
    await sendPasswordResetEmail(getFirebaseAuth(), validatedEmail.email);
    
    return {
      success: true,
      message: 'Password reset email sent successfully. Please check your inbox and spam folder.'
    };
  } catch (error: any) {
    console.error('Password reset error:', error);
    
    let message = 'Failed to send password reset email. Please try again.';
    
    if (error.code === 'getFirebaseAuth()/user-not-found') {
      message = 'No account found with this email address.';
    } else if (error.code === 'getFirebaseAuth()/invalid-email') {
      message = 'Please enter a valid email address.';
    } else if (error.code === 'getFirebaseAuth()/too-many-requests') {
      message = 'Too many reset attempts. Please try again later.';
    } else if (error instanceof z.ZodError) {
      message = error.errors[0]?.message || 'Please enter a valid email address.';
    }
    
    return {
      success: false,
      message
    };
  }
}

// User logout function
export async function logoutUser(): Promise<{ success: boolean; message: string }> {
  try {
    await signOut(getFirebaseAuth());
    return {
      success: true,
      message: 'Logged out successfully'
    };
  } catch (error: any) {
    console.error('Error during logout:', error);
    return {
      success: false,
      message: 'Failed to logout. Please try again.'
    };
  }
}


