import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/user-context';

interface OnboardingState {
  showOnboarding: boolean;
  isCompleted: boolean;
  loading: boolean;
}

export function useOnboarding() {
  const { user } = useUser();
  const { userData, loading: authLoading, checkOnboardingStatus } = useAuth();
  const [state, setState] = useState<OnboardingState>({
    showOnboarding: false,
    isCompleted: false,
    loading: true,
  });

  useEffect(() => {
    const checkStatus = async () => {
      if (!authLoading && user && userData) {
        console.log('useOnboarding: Checking status from database');
        
        // Check onboarding status from database
        const isCompleted = userData.onboardingCompleted || false;
        
        setState({
          showOnboarding: !isCompleted,
          isCompleted: isCompleted,
          loading: false,
        });
        
        console.log('useOnboarding: Status determined:', {
          showOnboarding: !isCompleted,
          isCompleted: isCompleted
        });
      } else if (!authLoading && !user) {
        setState({
          showOnboarding: false,
          isCompleted: false,
          loading: false,
        });
      }
    };

    checkStatus();
  }, [user, userData, authLoading]);

  const completeOnboarding = async () => {
    console.log('useOnboarding: Completing onboarding');
    setState(prev => ({
      ...prev,
      showOnboarding: false,
      isCompleted: true,
    }));
    
    // Refresh the auth context to get updated data
    if (checkOnboardingStatus) {
      await checkOnboardingStatus();
    }
  };

  const skipOnboarding = () => {
    setState(prev => ({
      ...prev,
      showOnboarding: false,
    }));
  };

  const resetOnboarding = () => {
    setState({
      showOnboarding: true,
      isCompleted: false,
      loading: false,
    });
  };

  return {
    showOnboarding: state.showOnboarding,
    isCompleted: state.isCompleted,
    loading: state.loading,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
  };
}
