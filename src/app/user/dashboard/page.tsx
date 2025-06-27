// src/app/user/dashboard/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Info, FileText, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/user-context";
import { useEffect, useState } from "react";
import { OnboardingPopup } from "@/components/ui/onboarding-popup";

export default function UserDashboardPage() {
  const { user, firebaseUser, isLoading: userLoading, authReady } = useUser();
  const { userData, loading: authLoading, isOnboardingCompleted, refreshUserData } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  // Debug logging
  useEffect(() => {
    console.log('Dashboard render state:', {
      user: user ? { uid: user.uid, email: user.email } : null,
      firebaseUser: firebaseUser ? { uid: firebaseUser.uid, email: firebaseUser.email } : null,
      userLoading,
      authReady,
      authLoading,
      userData: userData ? { uid: userData.uid, onboardingCompleted: userData.onboardingCompleted } : null
    });
  }, [user, firebaseUser, userLoading, authReady, authLoading, userData]);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!userLoading && !authLoading && authReady && user && userData) {
        setCheckingOnboarding(true);
        
        // Always check onboarding status from database, not localStorage
        console.log('Checking onboarding status from database for user:', user.uid);
        console.log('User data:', userData);
        
        const onboardingCompleted = userData.onboardingCompleted || false;
        
        console.log('Database onboarding status:', {
          user: user.uid,
          onboardingCompleted,
          onboardingProgress: userData.onboardingProgress
        });

        // Show onboarding popup if not completed in database
        if (!onboardingCompleted) {
          console.log('Onboarding not completed, showing popup');
          setShowOnboarding(true);
        } else {
          console.log('Onboarding already completed, skipping popup');
          setShowOnboarding(false);
        }
        
        setCheckingOnboarding(false);
      } else if (!userLoading && !authLoading && authReady && !user) {
        console.log('Auth ready but no user found');
        setCheckingOnboarding(false);
      }
    };

    checkOnboardingStatus();
  }, [user, userData, userLoading, authLoading, authReady]);

  const handleOnboardingComplete = async () => {
    console.log('Onboarding completed, refreshing user data...');
    setShowOnboarding(false);
    
    // Refresh user data to get updated onboarding status
    try {
      await refreshUserData();
      console.log('User data refreshed after onboarding completion');
      
      // Force a small delay to ensure state updates
      setTimeout(() => {
        setCheckingOnboarding(false);
      }, 500);
    } catch (error) {
      console.error('Error refreshing user data after onboarding:', error);
      setCheckingOnboarding(false);
    }
  };

  // Show loading while checking user authentication and onboarding status
  if (userLoading || authLoading || !authReady || checkingOnboarding) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-indigo-400" />
          <p className="text-neutral-400">Loading your dashboard...</p>
          {!authReady && (
            <p className="text-xs text-neutral-500 mt-2">Initializing authentication...</p>
          )}
        </div>
      </div>
    );
  }

  // Show authentication required message if user is not logged in
  if (!user || !firebaseUser) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center py-20">
          <Lock className="mx-auto h-12 w-12 text-neutral-500 mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Authentication Required</h2>
          <p className="text-neutral-400 text-lg">
            Please log in to access your dashboard.
          </p>
          <p className="text-xs text-neutral-500 mt-2">
            Debug: authReady={authReady.toString()}, user={user ? 'exists' : 'null'}, firebaseUser={firebaseUser ? 'exists' : 'null'}
          </p>
        </div>
      </div>
    );
  }

  const applicationStatus = "Accepted"; // This should be based on userData.status
  const userName = userData?.name || userData?.firstName || user.name || "User";

  return (
    <div className="space-y-8">
      {/* Onboarding Popup */}
      <OnboardingPopup
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
        userUid={user.uid}
      />

      <Card className="bg-neutral-800/50 border-neutral-700/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">
            Welcome to Your RCEOM-TBI Portal, {userName}!
          </CardTitle>
          <CardDescription className="text-neutral-400">
            Here's a summary of your application and available resources.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-neutral-200 mb-2 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-indigo-400" />
              Application Status
            </h3>
            {applicationStatus === "Accepted" ? (
              <div className="flex items-center p-4 rounded-lg bg-teal-500/10 border border-teal-500/30">
                <CheckCircle className="h-6 w-6 text-teal-400 mr-3" />
                <div>
                  <p className="font-semibold text-teal-300">Congratulations! Your application has been {applicationStatus}.</p>
                  <p className="text-sm text-teal-400/80">
                    You can now explore mentor profiles and upcoming events.
                  </p>
                </div>
              </div>
            ) : (
               <div className="flex items-center p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <Info className="h-6 w-6 text-amber-400 mr-3" />
                <div>
                  <p className="font-semibold text-amber-300">Your application status is: {applicationStatus}</p>
                  <p className="text-sm text-amber-400/80">
                    We will notify you of any updates.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Onboarding Status */}
          {userData && (
            <div className="mt-6 p-4 bg-neutral-700/30 rounded-lg border border-neutral-600/50">
              <h4 className="text-md font-semibold text-neutral-300 mb-2 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-indigo-400" />
                Account Setup Status
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-neutral-700/30">
                  {userData.onboardingProgress?.passwordChanged ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-neutral-400" />
                  )}
                  <div>
                    <p className="text-white font-medium">Password Setup</p>
                    <p className="text-sm text-neutral-400">
                      {userData.onboardingProgress?.passwordChanged ? "Completed" : "Pending"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-neutral-700/30">
                  {userData.onboardingProgress?.profileCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-neutral-400" />
                  )}
                  <div>
                    <p className="text-white font-medium">Profile Completion</p>
                    <p className="text-sm text-neutral-400">
                      {userData.onboardingProgress?.profileCompleted ? "Completed" : "Pending"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-neutral-700/30">
                  {userData.onboardingProgress?.notificationsConfigured ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-neutral-400" />
                  )}
                  <div>
                    <p className="text-white font-medium">Notifications</p>
                    <p className="text-sm text-neutral-400">
                      {userData.onboardingProgress?.notificationsConfigured ? "Configured" : "Pending"}
                    </p>
                  </div>
                </div>
              </div>
              
              {!isOnboardingCompleted && (
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-amber-300 text-sm">
                    Please complete your onboarding steps to access all features.
                  </p>
                  <button
                    onClick={() => setShowOnboarding(true)}
                    className="mt-2 text-sm text-indigo-400 hover:text-indigo-300 underline"
                  >
                    Complete Onboarding
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 p-4 bg-neutral-700/30 rounded-lg border border-neutral-600/50">
            <h4 className="text-md font-semibold text-neutral-300 mb-2">Next Steps:</h4>
            <ul className="list-disc list-inside text-neutral-400 text-sm space-y-1">
              <li>Explore the "Mentors" section to find experts in your field.</li>
              <li>Check out "Events" for upcoming workshops and networking opportunities.</li>
              <li>Update your profile and communication preferences in "Settings".</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
