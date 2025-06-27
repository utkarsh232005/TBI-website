// Client-side Firebase Auth utilities
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export interface PasswordUpdateResult {
  success: boolean;
  message: string;
  error?: string;
}

export async function updateUserPassword(newPassword: string, currentPassword?: string): Promise<PasswordUpdateResult> {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      return {
        success: false,
        message: 'No authenticated user found. Please log in again.',
      };
    }

    // For new users with temporary passwords, we might need to reauthenticate first
    if (currentPassword && user.email) {
      try {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
      } catch (reauthError: any) {
        // If reauthentication fails, it might mean the current password is wrong
        // or the user is already authenticated with the temporary password
        console.warn('Reauthentication failed, proceeding with password update:', reauthError.message);
      }
    }

    // Update the password
    await updatePassword(user, newPassword);
    
    return {
      success: true,
      message: 'Password updated successfully!',
    };
    
  } catch (error: any) {
    console.error('Error updating password:', error);
    
    // Handle specific Firebase Auth errors
    let errorMessage = 'Failed to update password. Please try again.';
    
    switch (error.code) {
      case 'auth/weak-password':
        errorMessage = 'Password is too weak. Please choose a stronger password.';
        break;
      case 'auth/requires-recent-login':
        errorMessage = 'For security reasons, please log out and log back in before changing your password.';
        break;
      case 'auth/invalid-credential':
        errorMessage = 'Current password is incorrect.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later.';
        break;
      default:
        if (error.message) {
          errorMessage = error.message;
        }
    }
    
    return {
      success: false,
      message: errorMessage,
      error: error.code,
    };
  }
}
