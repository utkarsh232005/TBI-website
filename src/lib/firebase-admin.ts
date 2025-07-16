// Firebase Admin utilities for server-side operations
// This file contains utilities that require Firebase Admin SDK

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin if not already initialized
if (getApps().length === 0) {
  // Note: You need to set up Firebase Admin credentials
  // Either through service account key file or environment variables
  initializeApp({
    // credential: cert({
    //   projectId: process.env.FIREBASE_PROJECT_ID,
    //   clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    //   privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    // }),
    // Or use default credentials if running on Firebase Functions
  });
}

const adminAuth = getAuth();

/**
 * Delete a Firebase Auth user by UID (Admin only)
 * This requires Firebase Admin SDK and proper credentials
 */
export async function deleteFirebaseAuthUser(uid: string): Promise<{ success: boolean; message: string }> {
  try {
    await adminAuth.deleteUser(uid);
    return { success: true, message: `Firebase Auth user ${uid} deleted successfully.` };
  } catch (error: any) {
    console.error('Error deleting Firebase Auth user:', error);
    return { success: false, message: `Failed to delete Firebase Auth user: ${error.message}` };
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
