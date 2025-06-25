'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getUserProfileData } from '@/app/actions/user-onboarding-actions';
import { useUser } from './user-context';

interface UserData {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  linkedin?: string;
  temporaryUserId?: string;
  onboardingCompleted?: boolean;
  onboardingProgress?: {
    passwordChanged?: boolean;
    profileCompleted?: boolean;
    notificationsConfigured?: boolean;
    completed?: boolean;
  };
  notificationPreferences?: {
    emailNotifications: boolean;
  };
}

interface AuthContextType {
  userData: UserData | null;
  loading: boolean;
  refreshUserData: () => Promise<void>;
  checkOnboardingStatus: () => Promise<boolean>;
  isOnboardingCompleted: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: userLoading } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);

  const fetchUserData = async (identifier: string): Promise<UserData | null> => {
    try {
      console.log('Fetching user data for identifier:', identifier);
      
      const response = await getUserProfileData(identifier);
      
      if (response.success && response.data) {
        const data = response.data;
        const userData: UserData = {
          id: data.id || identifier,
          email: data.email,
          name: data.name,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          bio: data.bio,
          linkedin: data.linkedin,
          temporaryUserId: data.temporaryUserId,
          onboardingCompleted: data.onboardingCompleted,
          onboardingProgress: data.onboardingProgress,
          notificationPreferences: data.notificationPreferences
        };
        
        console.log('User data fetched successfully:', userData);
        setIsOnboardingCompleted(!!userData.onboardingCompleted);
        return userData;
      }
      
      console.log('No user data found or fetch failed:', response.message);
      return null;
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  const refreshUserData = async () => {
    if (user?.identifier) {
      setLoading(true);
      const data = await fetchUserData(user.identifier);
      setUserData(data);
      setLoading(false);
    }
  };

  const checkOnboardingStatus = async (): Promise<boolean> => {
    if (!user?.identifier) return false;
    
    try {
      console.log('Checking onboarding status from database for:', user.identifier);
      const response = await getUserProfileData(user.identifier);
      
      if (response.success && response.data) {
        const completed = response.data.onboardingCompleted || false;
        console.log('Database onboarding status:', completed);
        setIsOnboardingCompleted(completed);
        return completed;
      } else {
        console.log('Failed to fetch user data for onboarding check:', response.message);
        setIsOnboardingCompleted(false);
        return false;
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setIsOnboardingCompleted(false);
      return false;
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      if (!userLoading && user?.identifier) {
        setLoading(true);
        const data = await fetchUserData(user.identifier);
        setUserData(data);
        setLoading(false);
      } else if (!userLoading && !user) {
        setUserData(null);
        setIsOnboardingCompleted(false);
        setLoading(false);
      }
    };

    loadUserData();
  }, [user, userLoading]);

  const value: AuthContextType = {
    userData,
    loading: loading || userLoading,
    refreshUserData,
    checkOnboardingStatus,
    isOnboardingCompleted
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};