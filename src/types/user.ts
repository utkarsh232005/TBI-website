// src/types/user.ts

// This type can be expanded as more user-specific data is added
export interface UserProfileData {
    uid: string;
    email: string;
    name: string;
    status: string;
    role: string;
    submissionId?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    bio?: string;
    linkedin?: string;
    profilePicture?: string;
    startupName?: string;
    startupDescription?: string;
    startupWebsite?: string;
    teamInfo?: string;
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
  
  export type UpdateUserProfileFormValues = Partial<UserProfileData> & {
    uid: string;
  };
  