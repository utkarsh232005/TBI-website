// Firebase Admin utilities for server-side operations
// This file contains utilities that require Firebase Admin SDK

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin if not already initialized
if (getApps().length === 0) {
  try {
    // Try to initialize with service account credentials from environment variables
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      console.log('✅ Firebase Admin initialized with service account credentials');
    } else {
      // Initialize without credentials (will work in Firebase Functions or with default application credentials)
      initializeApp();
      console.log('⚠️ Firebase Admin initialized with default credentials (some features may not work)');
    }
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error);
    // Initialize without credentials as fallback
    initializeApp();
  }
}

const adminAuth = getAuth();

/**
 * Delete a Firebase Auth user by UID (Admin only)
 * This requires Firebase Admin SDK and proper credentials
 */
export async function deleteFirebaseAuthUser(uid: string): Promise<{ success: boolean; message: string }> {
  try {
    // Check if Firebase Admin is properly initialized
    if (!adminAuth) {
      return { success: false, message: 'Firebase Admin not properly initialized' };
    }

    await adminAuth.deleteUser(uid);
    return { success: true, message: `Firebase Auth user ${uid} deleted successfully.` };
  } catch (error: any) {
    console.error('Error deleting Firebase Auth user:', error);
    
    // Handle specific error cases
    if (error.code === 'auth/user-not-found') {
      return { success: false, message: 'User not found in Firebase Authentication' };
    } else if (error.code === 'auth/insufficient-permission') {
      return { success: false, message: 'Insufficient permissions to delete user. Check Firebase Admin SDK setup.' };
    } else {
      return { success: false, message: `Failed to delete Firebase Auth user: ${error.message}` };
    }
  }
}

/**
 * Get Firebase Auth user by email (Admin only)
 */
export async function getFirebaseAuthUserByEmail(email: string) {
  try {
    const user = await adminAuth.getUserByEmail(email);
    return { success: true, user };
  } catch (error: any) {
    console.error('Error getting Firebase Auth user by email:', error);
    return { success: false, message: error.message };
  }
}

export { adminAuth };
