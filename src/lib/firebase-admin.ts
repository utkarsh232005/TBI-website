import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let _adminApp: any = null;

export function getAdminApp() {
  if (_adminApp) return _adminApp;
  
  if (getApps().length > 0) {
    _adminApp = getApp();
    return _adminApp;
  }

  try {
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      console.warn('Firebase Admin credentials are missing. Skipping initialization.');
      return null;
    }

    _adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    console.log('✅ Firebase Admin initialized with service account credentials');
  } catch (error) {
    console.warn('Failed to initialize Firebase Admin. Skipping initialization.', error);
    return null;
  }
  return _adminApp;
}

let _adminAuth: any = null;
export function getAdminAuth() {
  if (_adminAuth) return _adminAuth;
  const app = getAdminApp();
  if (!app) return null;
  _adminAuth = getAuth(app);
  return _adminAuth;
}

export async function deleteFirebaseAuthUser(
  uid: string
): Promise<{ success: boolean; message: string; status?: number }> {
  try {
    const auth = getAdminAuth();
    if (!auth) {
      return { success: false, message: 'Firebase Admin not initialized properly', status: 503 };
    }
    await auth.deleteUser(uid);
    return { success: true, message: 'Firebase Auth user deleted successfully.' };
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      return { success: false, message: 'User not found in Firebase Authentication' };
    }
    return { success: false, message: `Failed to delete Firebase Auth user: ${error.message}` };
  }
}

export async function getFirebaseAuthUserByEmail(email: string) {
  try {
    const auth = getAdminAuth();
    if (!auth) return { success: false, message: 'Firebase admin not initialized' };
    const user = await auth.getUserByEmail(email);
    return { success: true, user };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

