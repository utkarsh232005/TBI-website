'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  serverTimestamp,
  DocumentData 
} from 'firebase/firestore';

// Interface for user document structure
interface UserDocument extends DocumentData {
  name: string;
  email: string;
  temporaryUserId?: string;
  temporaryPassword?: string;
  status: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  linkedin?: string;
  notificationPreferences?: {
    emailNotifications: boolean;
    updatedAt?: any;
  };
  onboardingProgress?: {
    passwordChanged?: boolean;
    passwordChangedAt?: any;
    profileCompleted?: boolean;
    profileCompletedAt?: any;
    notificationsConfigured?: boolean;
    notificationsConfiguredAt?: any;
    completed?: boolean;
    completedAt?: any;
  };
  onboardingCompleted?: boolean;
  onboardingCompletedAt?: any;
  passwordUpdatedAt?: any;
  profileUpdatedAt?: any;
}

// Schemas for validation
const UpdatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  userIdentifier: z.string().min(1, 'User identifier is required'), // email or temporaryUserId
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const UpdateProfileSchema = z.object({
  userIdentifier: z.string().min(1, 'User identifier is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  bio: z.string().optional(),
  linkedin: z.string().url().optional().or(z.literal('')),
});

const UpdateNotificationPreferencesSchema = z.object({
  userIdentifier: z.string().min(1, 'User identifier is required'),
  emailNotifications: z.boolean(),
});

export type UpdatePasswordFormValues = z.infer<typeof UpdatePasswordSchema>;
export type UpdateProfileFormValues = z.infer<typeof UpdateProfileSchema>;
export type UpdateNotificationPreferencesFormValues = z.infer<typeof UpdateNotificationPreferencesSchema>;

export interface UpdateResponse {
  success: boolean;
  message: string;
  error?: string;
}

// Helper function to find user document by email or temporaryUserId
async function findUserDocument(identifier: string): Promise<{ userDoc: UserDocument | null; docId: string | null }> {
  const submissionsRef = collection(db, 'contactSubmissions');
  const q = query(
    submissionsRef,
    where('status', '==', 'accepted')
  );

  const querySnapshot = await getDocs(q);
  let userDoc: UserDocument | null = null;
  let docId: string | null = null;

  querySnapshot.forEach((docSnap) => {
    const userData = docSnap.data() as UserDocument;
    if (userData.email === identifier || userData.temporaryUserId === identifier) {
      userDoc = userData;
      docId = docSnap.id;
    }
  });

  return { userDoc, docId };
}

export async function updateUserPassword(
  values: UpdatePasswordFormValues
): Promise<UpdateResponse> {
  try {
    const validatedValues = UpdatePasswordSchema.parse(values);
    const { currentPassword, newPassword, userIdentifier } = validatedValues;

    // Find user document
    const { userDoc, docId } = await findUserDocument(userIdentifier);

    if (!userDoc || !docId) {
      return {
        success: false,
        message: 'User not found or application not accepted.',
      };
    }

    // Verify current password (WARNING: This is still plaintext comparison)
    if (userDoc.temporaryPassword !== currentPassword) {
      return {
        success: false,
        message: 'Current password is incorrect.',
      };
    }

    // Update password in Firestore
    const userDocRef = doc(db, 'contactSubmissions', docId);
    await updateDoc(userDocRef, {
      temporaryPassword: newPassword,
      passwordUpdatedAt: serverTimestamp(),
      onboardingProgress: {
        ...userDoc.onboardingProgress,
        passwordChanged: true,
        passwordChangedAt: serverTimestamp(),
      }
    });

    return {
      success: true,
      message: 'Password updated successfully!',
    };

  } catch (error: any) {
    console.error('[UpdateUserPassword] Error:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Invalid input data.',
        error: error.errors.map(e => e.message).join(', '),
      };
    }
    return {
      success: false,
      message: 'Failed to update password. Please try again.',
      error: error.message,
    };
  }
}

export async function updateUserProfile(
  values: UpdateProfileFormValues
): Promise<UpdateResponse> {
  try {
    const validatedValues = UpdateProfileSchema.parse(values);
    const { userIdentifier, firstName, lastName, phone, bio, linkedin } = validatedValues;

    // Find user document
    const { userDoc, docId } = await findUserDocument(userIdentifier);

    if (!userDoc || !docId) {
      return {
        success: false,
        message: 'User not found or application not accepted.',
      };
    }

    // Prepare update data
    const updateData: any = {
      // Update the original name field with full name
      name: `${firstName} ${lastName}`,
      // Add new profile fields
      firstName,
      lastName,
      profileUpdatedAt: serverTimestamp(),
      onboardingProgress: {
        ...userDoc.onboardingProgress,
        profileCompleted: true,
        profileCompletedAt: serverTimestamp(),
      }
    };

    // Add optional fields if provided
    if (phone) updateData.phone = phone;
    if (bio) updateData.bio = bio;
    if (linkedin) updateData.linkedin = linkedin;

    // Update profile in Firestore
    const userDocRef = doc(db, 'contactSubmissions', docId);
    await updateDoc(userDocRef, updateData);

    return {
      success: true,
      message: 'Profile updated successfully!',
    };

  } catch (error: any) {
    console.error('[UpdateUserProfile] Error:', error);
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

export async function updateNotificationPreferences(
  values: UpdateNotificationPreferencesFormValues
): Promise<UpdateResponse> {
  try {
    const validatedValues = UpdateNotificationPreferencesSchema.parse(values);
    const { userIdentifier, emailNotifications } = validatedValues;

    // Find user document
    const { userDoc, docId } = await findUserDocument(userIdentifier);

    if (!userDoc || !docId) {
      return {
        success: false,
        message: 'User not found or application not accepted.',
      };
    }

    // Update notification preferences in Firestore
    const userDocRef = doc(db, 'contactSubmissions', docId);
    await updateDoc(userDocRef, {
      notificationPreferences: {
        emailNotifications,
        updatedAt: serverTimestamp(),
      },
      onboardingProgress: {
        ...userDoc.onboardingProgress,
        notificationsConfigured: true,
        notificationsConfiguredAt: serverTimestamp(),
      }
    });

    return {
      success: true,
      message: 'Notification preferences updated successfully!',
    };

  } catch (error: any) {
    console.error('[UpdateNotificationPreferences] Error:', error);
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

// Function to mark onboarding as completed
export async function completeUserOnboarding(userIdentifier: string): Promise<UpdateResponse> {
  try {
    // Find user document
    const { userDoc, docId } = await findUserDocument(userIdentifier);

    if (!userDoc || !docId) {
      return {
        success: false,
        message: 'User not found or application not accepted.',
      };
    }

    // Mark onboarding as completed
    const userDocRef = doc(db, 'contactSubmissions', docId);
    await updateDoc(userDocRef, {
      onboardingCompleted: true,
      onboardingCompletedAt: serverTimestamp(),
      onboardingProgress: {
        ...userDoc.onboardingProgress,
        completed: true,
        completedAt: serverTimestamp(),
      }
    });

    return {
      success: true,
      message: 'Onboarding completed successfully!',
    };

  } catch (error: any) {
    console.error('[CompleteUserOnboarding] Error:', error);
    return {
      success: false,
      message: 'Failed to complete onboarding. Please try again.',
      error: error.message,
    };
  }
}

// Function to get current user data for populating forms
export async function getCurrentUserData(userIdentifier: string) {
  try {
    const { userDoc, docId } = await findUserDocument(userIdentifier);

    if (!userDoc || !docId) {
      return {
        success: false,
        message: 'User not found or application not accepted.',
        data: null,
      };
    }

    return {
      success: true,
      message: 'User data retrieved successfully.',
      data: {
        id: docId,
        name: userDoc.name,
        firstName: userDoc.firstName || '',
        lastName: userDoc.lastName || '',
        email: userDoc.email,
        phone: userDoc.phone || '',
        bio: userDoc.bio || '',
        linkedin: userDoc.linkedin || '',
        temporaryUserId: userDoc.temporaryUserId,
        notificationPreferences: userDoc.notificationPreferences || { emailNotifications: false },
        onboardingProgress: userDoc.onboardingProgress || {},
        onboardingCompleted: userDoc.onboardingCompleted || false,
      },
    };

  } catch (error: any) {
    console.error('[GetCurrentUserData] Error:', error);
    return {
      success: false,
      message: 'Failed to retrieve user data.',
      data: null,
      error: error.message,
    };
  }
}

// Helper function to serialize Firestore data for client components
function serializeUserData(userData: UserDocument): any {
  const serialized: any = { ...userData };
  
  // Convert all timestamp fields to ISO strings
  const timestampFields = [
    'submittedAt',
    'passwordUpdatedAt', 
    'profileUpdatedAt',
    'onboardingCompletedAt',
    'processedByAdminAt'
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

// Function to get user profile data
export async function getUserProfileData(identifier: string): Promise<{
  success: boolean;
  data?: any;
  message: string;
}> {
  try {
    const { userDoc, docId } = await findUserDocument(identifier);
    
    if (!userDoc || !docId) {
      return {
        success: false,
        message: 'User not found or not accepted.',
      };
    }

    // Serialize the data to remove Firestore timestamps
    const serializedData = serializeUserData(userDoc);

    return {
      success: true,
      data: serializedData,
      message: 'Profile data retrieved successfully.',
    };
  } catch (error: any) {
    console.error('Error fetching user profile data:', error);    return {
      success: false,
      message: `Failed to fetch profile data: ${error.message || 'Unknown error'}`,
    };
  }
}
