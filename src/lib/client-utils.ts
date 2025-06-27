// Client-side utility functions that need access to browser APIs like localStorage
import { auth } from './firebase';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

// Utility function to store current user data after successful login
export function setCurrentUser(userData: {
  uid: string;
  email: string;
  name: string;
}): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('currentUser', JSON.stringify(userData));
  }
}

// Utility function to get current user data
export function getCurrentUser(): {
  uid: string;
  email: string;
  name: string;
} | null {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing current user data:', error);
        return null;
      }
    }
  }
  return null;
}

// Utility function to clear user session data
export function clearUserSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('currentUser');
    // Note: We no longer use localStorage for onboarding status
    // This is now managed by the database
  }
}

// Client-side password update function
export async function updateUserPassword(newPassword: string, currentPassword?: string): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  try {
    console.log('updateUserPassword called with:', { hasCurrentPassword: !!currentPassword, newPasswordLength: newPassword.length });
    
    // Wait a bit to ensure auth state is loaded
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const user = auth.currentUser;
    console.log('Current user:', { uid: user?.uid, email: user?.email, isAnonymous: user?.isAnonymous });
    
    if (!user) {
      console.error('No current user found in Firebase Auth');
      return {
        success: false,
        message: 'No authenticated user found. Please log in again.',
      };
    }

    // If current password is provided, reauthenticate first
    if (currentPassword && user.email) {
      try {
        console.log('Attempting to reauthenticate user with email:', user.email);
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        console.log('Reauthentication successful');
      } catch (error: any) {
        console.error('Reauthentication failed:', error);
        return {
          success: false,
          message: 'Current password is incorrect.',
          error: error.message,
        };
      }
    }

    // Update the password
    console.log('Attempting to update password...');
    await updatePassword(user, newPassword);
    console.log('Password update successful');

    return {
      success: true,
      message: 'Password updated successfully!',
    };

  } catch (error: any) {
    console.error('Error updating password:', error);
    
    // Handle specific Firebase Auth errors
    if (error.code === 'auth/weak-password') {
      return {
        success: false,
        message: 'Password is too weak. Please choose a stronger password.',
      };
    } else if (error.code === 'auth/requires-recent-login') {
      return {
        success: false,
        message: 'Please log out and log back in before changing your password.',
      };
    } else {
      return {
        success: false,
        message: 'Failed to update password. Please try again.',
        error: error.message,
      };
    }
  }
}
