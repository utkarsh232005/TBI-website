'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  DocumentData 
} from 'firebase/firestore';
import { UserProfileData, UpdateUserProfileFormValues } from '@/types/user';

// Response interface
export interface UserActionResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

// Schema for updating user profile - now includes new fields
const UpdateUserProfileSchema = z.object({
  uid: z.string().min(1, 'User ID is required'),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  linkedin: z.string().url().optional().or(z.literal('')),
  profilePicture: z.string().url().optional().or(z.literal('')),
  startupName: z.string().optional(),
  startupDescription: z.string().optional(),
  startupWebsite: z.string().url().optional().or(z.literal('')),
  teamInfo: z.string().optional(),
});

// Schema for updating notification preferences
const UpdateNotificationPreferencesSchema = z.object({
  uid: z.string().min(1, 'User ID is required'),
  emailNotifications: z.boolean(),
});

export type UpdateNotificationPreferencesFormValues = z.infer<typeof UpdateNotificationPreferencesSchema>;

// Function to get user data by UID
export async function getUserData(uid: string): Promise<UserActionResponse> {
  try {
    if (!uid) {
      return {
        success: false,
        message: 'User ID is required.',
      };
    }

    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return {
        success: false,
        message: 'User not found.',
      };
    }

    const userData = userDoc.data() as UserProfileData;
    
    // Serialize timestamp fields
    const serializedData = serializeUserData(userData);

    return {
      success: true,
      data: serializedData,
      message: 'User data retrieved successfully.',
    };
  } catch (error: any) {
    console.error('Error fetching user data:', error);
    return {
      success: false,
      message: `Failed to fetch user data: ${error.message || 'Unknown error'}`,
    };
  }
}

// Function to update user profile
export async function updateUserProfile(values: UpdateUserProfileFormValues): Promise<UserActionResponse> {
  try {
    const validatedValues = UpdateUserProfileSchema.parse(values);
    const { uid, ...profileData } = validatedValues;

    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return {
        success: false,
        message: 'User not found.',
      };
    }

    const updateData = {
      ...profileData,
      name: `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim(),
      updatedAt: serverTimestamp(),
      'onboardingProgress.profileCompleted': true,
      'onboardingProgress.profileCompletedAt': serverTimestamp(),
    };

    // Update user document
    await updateDoc(userDocRef, updateData);

    return {
      success: true,
      message: 'Profile updated successfully!',
    };

  } catch (error: any) {
    console.error('Error updating user profile:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Invalid input data.',
        error: error.errors.map(e => e.message).join(', '),
      };
    }
    return {
      success: false,
      message: 'Failed to update profile. Please try again.',
      error: error.message,
    };
  }
}

// Function to update notification preferences
export async function updateNotificationPreferences(values: UpdateNotificationPreferencesFormValues): Promise<UserActionResponse> {
  try {
    const validatedValues = UpdateNotificationPreferencesSchema.parse(values);
    const { uid, emailNotifications } = validatedValues;

    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return {
        success: false,
        message: 'User not found.',
      };
    }

    // Update notification preferences
    await updateDoc(userDocRef, {
      'notificationPreferences.emailNotifications': emailNotifications,
      'notificationPreferences.updatedAt': serverTimestamp(),
      'onboardingProgress.notificationsConfigured': true,
      'onboardingProgress.notificationsConfiguredAt': serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: 'Notification preferences updated successfully!',
    };

  } catch (error: any) {
    console.error('Error updating notification preferences:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Invalid input data.',
        error: error.errors.map(e => e.message).join(', '),
      };
    }
    return {
      success: false,
      message: 'Failed to update notification preferences. Please try again.',
      error: error.message,
    };
  }
}

// Function to complete user onboarding
export async function completeUserOnboarding(uid: string): Promise<UserActionResponse> {
  try {
    if (!uid) {
      return {
        success: false,
        message: 'User ID is required.',
      };
    }

    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return {
        success: false,
        message: 'User not found.',
      };
    }

    // Mark onboarding as completed
    await updateDoc(userDocRef, {
      onboardingCompleted: true,
      'onboardingProgress.completed': true,
      'onboardingProgress.completedAt': serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: 'Onboarding completed successfully!',
    };

  } catch (error: any) {
    console.error('Error completing onboarding:', error);
    return {
      success: false,
      message: 'Failed to complete onboarding. Please try again.',
      error: error.message,
    };
  }
}

// Function to mark password as changed in onboarding
export async function markPasswordChanged(uid: string): Promise<UserActionResponse> {
  try {
    if (!uid) {
      return {
        success: false,
        message: 'User ID is required.',
      };
    }

    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return {
        success: false,
        message: 'User not found.',
      };
    }

    // Mark password as changed in onboarding progress
    await updateDoc(userDocRef, {
      'onboardingProgress.passwordChanged': true,
      'onboardingProgress.passwordChangedAt': serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: 'Password change recorded successfully!',
    };

  } catch (error: any) {
    console.error('Error marking password as changed:', error);
    return {
      success: false,
      message: 'Failed to update password status. Please try again.',
      error: error.message,
    };
  }
}

// Helper function to serialize Firestore data for client components
function serializeUserData(userData: UserProfileData): any {
  const serialized: any = { ...userData };
  
  // Convert all timestamp fields to ISO strings
  const timestampFields = [
    'createdAt',
    'updatedAt',
  ];
  
  timestampFields.forEach(field => {
    if (serialized[field]) {
      serialized[field] = serialized[field].toDate ? 
        serialized[field].toDate().toISOString() : 
        serialized[field];
    }
  });
  
  // Handle nested timestamp fields in onboardingProgress
  if (serialized.onboardingProgress) {
    const progressFields = [
      'passwordChangedAt',
      'profileCompletedAt', 
      'notificationsConfiguredAt',
      'completedAt'
    ];
    
    progressFields.forEach(field => {
      if (serialized.onboardingProgress[field]) {
        serialized.onboardingProgress[field] = serialized.onboardingProgress[field].toDate ?
          serialized.onboardingProgress[field].toDate().toISOString() :
          serialized.onboardingProgress[field];
      }
    });
  }
  
  // Handle nested timestamp in notificationPreferences
  if (serialized.notificationPreferences && serialized.notificationPreferences.updatedAt) {
    serialized.notificationPreferences.updatedAt = serialized.notificationPreferences.updatedAt.toDate ?
      serialized.notificationPreferences.updatedAt.toDate().toISOString() :
      serialized.notificationPreferences.updatedAt;
  }
  
  return serialized;
}
