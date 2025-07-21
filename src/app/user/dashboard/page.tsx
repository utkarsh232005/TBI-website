// src/app/user/dashboard/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Info, FileText, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/user-context";
import { useEffect, useState } from "react";

export default function UserDashboardPage() {
  const { user, firebaseUser, isLoading: userLoading, authReady } = useUser();
  const { userData, loading: authLoading, isOnboardingCompleted, refreshUserData } = useAuth();

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

  // Show loading while checking user authentication
  if (userLoading || authLoading || !authReady) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your dashboard...</p>
          {!authReady && (
            <p className="text-xs text-gray-500 mt-2">Initializing authentication...</p>
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
          <Lock className="mx-auto h-12 w-12 text-gray-500 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 text-lg">
            Please log in to access your dashboard.
          </p>
          <p className="text-xs text-gray-500 mt-2">
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
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Welcome to Your RCEOM-TBI Portal, {userName}!
          </CardTitle>
          <CardDescription className="text-gray-600">
            Here's a summary of your application and available resources.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Application Status
            </h3>
            {applicationStatus === "Accepted" ? (
              <div className="flex items-center p-4 rounded-lg bg-green-50 border border-green-200">
                <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <p className="font-semibold text-green-800">Congratulations! Your application has been {applicationStatus}.</p>
                  <p className="text-sm text-green-700">
                    You can now explore mentor profiles and upcoming events.
                  </p>
                </div>
              </div>
            ) : (
               <div className="flex items-center p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                <Info className="h-6 w-6 text-yellow-600 mr-3" />
                <div>
                  <p className="font-semibold text-yellow-800">Your application status is: {applicationStatus}</p>
                  <p className="text-sm text-yellow-700">
                    We will notify you of any updates.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Onboarding Status */}
          {userData && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-md font-semibold text-gray-800 mb-2 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
                Account Setup Status
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-white border border-gray-200">
                  {userData.onboardingProgress?.passwordChanged ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-400" />
                  )}
                  <div>
                    <p className="text-gray-800 font-medium">Password Setup</p>
                    <p className="text-sm text-gray-500">
                      {userData.onboardingProgress?.passwordChanged ? "Completed" : "Pending"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-white border border-gray-200">
                  {userData.onboardingProgress?.profileCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-400" />
                  )}
                  <div>
                    <p className="text-gray-800 font-medium">Profile Completion</p>
                    <p className="text-sm text-gray-500">
                      {userData.onboardingProgress?.profileCompleted ? "Completed" : "Pending"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-white border border-gray-200">
                  {userData.onboardingProgress?.notificationsConfigured ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-400" />
                  )}
                  <div>
                    <p className="text-gray-800 font-medium">Notifications</p>
                    <p className="text-sm text-gray-500">
                      {userData.onboardingProgress?.notificationsConfigured ? "Configured" : "Pending"}
                    </p>
                  </div>
                </div>
              </div>
              
              {!isOnboardingCompleted && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    Please complete your onboarding steps to access all features. The onboarding popup will appear automatically.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-md font-semibold text-gray-800 mb-2">Next Steps:</h4>
            <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
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
