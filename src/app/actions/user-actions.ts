// src/app/actions/user-actions.ts
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  DocumentData,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { UserProfileData, UpdateUserProfileFormValues } from '@/types/user';
import { Submission } from '@/types/Submission';

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

// Function to get user data by UID, now also fetching submission data
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
    let submissionData: Submission | null = null;
    
    // Fetch submission data if submissionId exists
    if (userData.submissionId) {
        // We need to check both contactSubmissions and offCampusApplications
        const collectionsToSearch = ['contactSubmissions', 'offCampusApplications'];
        for (const collectionName of collectionsToSearch) {
            const submissionDocRef = doc(db, collectionName, userData.submissionId);
            const submissionDoc = await getDoc(submissionDocRef);
            if (submissionDoc.exists()) {
                submissionData = {
                    id: submissionDoc.id,
                    ...submissionDoc.data()
                } as Submission;
                break; // Found it, no need to check other collections
            }
        }
    }
    
    // Serialize timestamp fields before sending to client
    const serializedUserData = serializeTimestampFields(userData);
    const serializedSubmissionData = submissionData ? serializeTimestampFields(submissionData) : null;
    
    // Combine user data with submission data
    const combinedData = {
      ...serializedUserData,
      submissionData: serializedSubmissionData,
    };

    return {
      success: true,
      data: combinedData,
      message: 'User data and submission details retrieved successfully.',
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

// Helper function to serialize Firestore timestamps for client components
function serializeTimestampFields(data: DocumentData): any {
  if (!data) return data;
  
  const serialized: any = { ...data };
  
  for (const key in serialized) {
    if (serialized[key] && typeof serialized[key].toDate === 'function') {
      serialized[key] = serialized[key].toDate().toISOString();
    } else if (typeof serialized[key] === 'object' && serialized[key] !== null) {
      serialized[key] = serializeTimestampFields(serialized[key]);
    }
  }
  
  return serialized;
}