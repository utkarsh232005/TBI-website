import { useState, useEffect } from 'react';
import { checkOnboardingStatus } from '@/lib/client-utils';

interface OnboardingState {
  showOnboarding: boolean;
  isCompleted: boolean;
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>({
    showOnboarding: false,
    isCompleted: false,
  });  useEffect(() => {
    // Add a small delay to ensure localStorage is ready
    const checkOnboardingStatusTimer = () => {
      const shouldShowOnboarding = checkOnboardingStatus();
      
      if (shouldShowOnboarding) {
        setState({
          showOnboarding: true,
          isCompleted: false,
        });
        // Clear the first login flag after showing onboarding
        if (typeof window !== 'undefined') {
          localStorage.removeItem('first_login');
        }
      } else {
        // Check if onboarding was already completed
        const hasCompletedOnboarding = localStorage.getItem('onboarding_completed') === 'true';
        setState({
          showOnboarding: false,
          isCompleted: hasCompletedOnboarding,
        });
      }
    };

    // Small delay to ensure localStorage is accessible
    const timer = setTimeout(checkOnboardingStatusTimer, 100);
    
    return () => clearTimeout(timer);
  }, []);  const completeOnboarding = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_completed', 'true');
      localStorage.removeItem('first_login'); // Ensure first_login flag is cleared
    }
    setState({
      showOnboarding: false,
      isCompleted: true,
    });
  };

  const skipOnboarding = () => {
    setState(prev => ({
      ...prev,
      showOnboarding: false,
    }));
  };
  const resetOnboarding = () => {
    localStorage.removeItem('onboarding_completed');
    localStorage.setItem('first_login', 'true');
    setState({
      showOnboarding: true,
      isCompleted: false,
    });
  };

  return {
    showOnboarding: state.showOnboarding,
    isCompleted: state.isCompleted,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
  };
}
