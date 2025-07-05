"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  User,
  Bell,
  Check,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle
} from "lucide-react";
import {
  updateUserProfile,
  updateNotificationPreferences,
  completeUserOnboarding,
  markPasswordChanged,
  type UpdateUserProfileFormValues,
  type UpdateNotificationPreferencesFormValues,
} from "@/app/actions/user-actions";
import { updateUserPassword } from "@/lib/client-utils";
import { useUser } from "@/contexts/user-context";

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

interface OnboardingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  userUid?: string; // Firebase Auth UID of logged in user
}

export function OnboardingPopup({ isOpen, onClose, onComplete, userUid }: OnboardingPopupProps) {
  const { toast } = useToast();

  console.log('OnboardingPopup render:', { isOpen, userUid });
  const { firebaseUser, authReady } = useUser();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = React.useState(false);
  const [isCompleting, setIsCompleting] = React.useState(false);

  const [steps, setSteps] = React.useState<OnboardingStep[]>([
    {
      id: 0,
      title: "Change Password",
      description: "Set a secure password for your account",
      icon: <Lock className="h-5 w-5" />,
      completed: false,
    },
    {
      id: 1,
      title: "Complete Profile",
      description: "Add your personal and professional details",
      icon: <User className="h-5 w-5" />,
      completed: false,
    },
    {
      id: 2,
      title: "Email Notifications",
      description: "Choose your notification preferences",
      icon: <Bell className="h-5 w-5" />,
      completed: false,
    },
  ]);

  // Form states
  const [passwordForm, setPasswordForm] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileForm, setProfileForm] = React.useState({
    firstName: "",
    lastName: "",
    phone: "",
    bio: "",
    linkedin: "",
  });

  const [notificationPreferences, setNotificationPreferences] = React.useState({
    enabled: false,
  });

  const allStepsCompleted = steps.every(step => step.completed);

  const completeStep = (stepId: number) => {
    setSteps(prev => prev.map(step =>
      step.id === stepId ? { ...step, completed: true } : step
    ));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userUid) {
      toast({
        title: "Error",
        description: "User not identified. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    if (!authReady) {
      toast({
        title: "Error",
        description: "Authentication is still loading. Please wait a moment and try again.",
        variant: "destructive",
      });
      return;
    }

    if (!firebaseUser) {
      toast({
        title: "Error",
        description: "No authenticated user found. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    if (!passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Please ensure passwords match and are not empty.",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Attempting password update for user:', { uid: firebaseUser.uid, email: firebaseUser.email });

      // Update password using client-side Firebase Auth
      const passwordResult = await updateUserPassword(
        passwordForm.newPassword,
        passwordForm.currentPassword
      );

      if (!passwordResult.success) {
        toast({
          title: "Error",
          description: passwordResult.message,
          variant: "destructive",
        });
        return;
      }

      // Mark password as changed in Firestore
      const firestoreResult = await markPasswordChanged(userUid);

      if (!firestoreResult.success) {
        console.warn('Password updated but failed to record in Firestore:', firestoreResult.message);
      }

      toast({
        title: "Success",
        description: "Password updated successfully!",
      });
      completeStep(0);
      setCurrentStep(1);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userUid) {
      toast({
        title: "Error",
        description: "User not identified. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    if (!profileForm.firstName || !profileForm.lastName) {
      toast({
        title: "Error",
        description: "First name and last name are required.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateUserProfile({
        uid: userUid,
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phone: profileForm.phone,
        bio: profileForm.bio,
        linkedin: profileForm.linkedin,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        completeStep(1);
        setCurrentStep(2);
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationSubmit = async (enable: boolean) => {
    if (!userUid) {
      toast({
        title: "Error",
        description: "User not identified. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateNotificationPreferences({
        uid: userUid,
        emailNotifications: enable,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        setNotificationPreferences({ enabled: enable });
        completeStep(2);

        // Complete the entire onboarding process and close popup
        setTimeout(async () => {
          await handleComplete();
        }, 500);
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipNotifications = () => {
    handleNotificationSubmit(false);
  };

  const handleEnableNotifications = () => {
    handleNotificationSubmit(true);
  };

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (isCompleting) return; // Prevent multiple calls

    setIsCompleting(true);

    // Mark onboarding as completed in database
    try {
      if (userUid) {
        console.log('Completing onboarding for user:', userUid);
        const result = await completeUserOnboarding(userUid);
        if (result.success) {
          console.log('Onboarding marked as completed in database');

          // Show success animation
          setShowSuccessAnimation(true);

          // Wait for animation to complete, then close modal
          setTimeout(() => {
            console.log('Animation complete, closing modal');
            setShowSuccessAnimation(false);
            setIsCompleting(false);

            // Reset all form states for next user
            setCurrentStep(0);
            setPasswordForm({
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            });
            setProfileForm({
              firstName: "",
              lastName: "",
              phone: "",
              bio: "",
              linkedin: "",
            });
            setNotificationPreferences({
              enabled: false,
            });

            // Reset step completion states
            setSteps(prev => prev.map(step => ({ ...step, completed: false })));

            // Call completion handlers after a short delay to ensure state is reset
            setTimeout(() => {
              onComplete();
              onClose();
            }, 100);
          }, 3500); // 3.5 seconds for the full animation experience

          return;
        } else {
          console.error('Failed to complete onboarding:', result.message);
          toast({
            title: "Warning",
            description: "Onboarding steps completed, but there was an issue saving to database.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Warning",
        description: "Onboarding steps completed, but there was an issue saving to database.",
        variant: "destructive",
      });
    }

    // If there was an error, still complete but without animation
    setIsCompleting(false);
    onComplete();
    onClose();
  };

  React.useEffect(() => {
    if (allStepsCompleted && currentStep === steps.length - 1) {
      // Auto-complete after a short delay when all steps are done
      const timer = setTimeout(() => {
        if (allStepsCompleted) { // Double check to ensure all steps are still completed
          handleComplete();
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [allStepsCompleted, currentStep]);

  // Fallback: Force close modal if animation has been showing for too long
  React.useEffect(() => {
    if (showSuccessAnimation) {
      const forceCloseTimer = setTimeout(() => {
        console.log('Force closing modal after animation timeout');
        setShowSuccessAnimation(false);
        setIsCompleting(false);
        onComplete();
        onClose();
      }, 4000); // 4 seconds fallback

      return () => clearTimeout(forceCloseTimer);
    }
  }, [showSuccessAnimation, onComplete, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      console.log('Dialog onOpenChange called:', { open, allStepsCompleted, isCompleting });
      // Allow closing if all steps are completed or if not showing the modal
      if (!open && (allStepsCompleted || !isCompleting)) {
        console.log('Dialog onOpenChange: Closing modal', {
          allStepsCompleted,
          showSuccessAnimation,
          isCompleting
        });

        // Only reset animation state if it's still showing
        if (showSuccessAnimation) {
          setShowSuccessAnimation(false);
        }

        onComplete();
        onClose();
      }
    }}>
      <DialogContent className="max-w-2xl bg-neutral-900 border-neutral-800 text-white relative overflow-hidden z-50"
        style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        onPointerDownOutside={(e) => {
          console.log('Pointer down outside, preventing close:', { allStepsCompleted, isCompleting });
          // Prevent closing by clicking outside only if steps are not completed and we're not completing
          if (!allStepsCompleted && !isCompleting) {
            e.preventDefault();
          }
        }}>

        {/* Success Animation Overlay */}
        <AnimatePresence>
          {showSuccessAnimation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-green-600/95 flex flex-col items-center justify-center z-50"
            >
              {/* Animated Checkmark */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.2
                }}
                className="mb-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{
                    duration: 0.6,
                    delay: 0.5,
                    times: [0, 0.7, 1]
                  }}
                  className="w-24 h-24 bg-white rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-16 h-16 text-green-600" />
                </motion.div>
              </motion.div>

              {/* Success Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-center"
              >
                <h3 className="text-2xl font-bold text-white mb-2">
                  Welcome Aboard! 🎉
                </h3>
                <p className="text-green-100 text-lg">
                  Your onboarding is complete
                </p>
              </motion.div>

              {/* Floating Particles Animation */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 0,
                    scale: 0,
                    x: 0,
                    y: 0
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0.5],
                    x: Math.random() * 400 - 200,
                    y: Math.random() * 300 - 150
                  }}
                  transition={{
                    duration: 2,
                    delay: 1 + i * 0.1,
                    ease: "easeOut"
                  }}
                  className="absolute w-3 h-3 bg-white rounded-full"
                  style={{
                    left: '50%',
                    top: '50%'
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-white">
            Welcome! Let's get you started
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            Complete these steps to set up your account and access all features.
          </DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-8 px-4">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                {/* Step Circle */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                    step.completed
                      ? "bg-green-600 text-white"
                      : currentStep === index
                        ? "bg-indigo-600 text-white"
                        : "bg-neutral-700 text-neutral-400"
                  )}
                >
                  {step.completed ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    step.icon
                  )}
                </div>

                {/* Step Info */}
                <div className="mt-2 text-center">
                  <div
                    className={cn(
                      "text-sm font-medium",
                      step.completed
                        ? "text-green-400"
                        : currentStep === index
                          ? "text-indigo-400"
                          : "text-neutral-400"
                    )}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-neutral-500 max-w-24">
                    {step.description}
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-16 mx-4 mb-8 transition-all duration-300",
                    steps[index + 1].completed || currentStep > index
                      ? "bg-green-600"
                      : "bg-neutral-700"
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          {currentStep === 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">Change Your Password</h3>

              {/* Authentication Status */}
              {!authReady && (
                <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-yellow-200">Loading authentication...</span>
                  </div>
                </div>
              )}

              {authReady && !firebaseUser && (
                <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-3 text-center">
                  <span className="text-red-200">Authentication error. Please refresh and try again.</span>
                </div>
              )}

              {authReady && firebaseUser && (
                <div className="bg-green-900/30 border border-green-600/50 rounded-lg p-3 text-center">
                  <span className="text-green-200">✓ Authenticated as {firebaseUser.email}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4"
                style={{ opacity: authReady && firebaseUser ? 1 : 0.5 }}>
                <div>
                  <Label htmlFor="onboarding-currentPassword">Current Password</Label>
                  <Input
                    id="onboarding-currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="bg-neutral-800 border-neutral-700 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="onboarding-newPassword">New Password</Label>
                  <Input
                    id="onboarding-newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="bg-neutral-800 border-neutral-700 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="onboarding-confirmPassword">Confirm New Password</Label>
                  <Input
                    id="onboarding-confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="bg-neutral-800 border-neutral-700 text-white"
                    required
                  />
                </div>                <Button type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  disabled={isLoading || !authReady || !firebaseUser}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating Password...
                    </>
                  ) : !authReady ? (
                    "Loading Authentication..."
                  ) : !firebaseUser ? (
                    "Authentication Required"
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">Complete Your Profile</h3>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="bg-neutral-800 border-neutral-700 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="bg-neutral-800 border-neutral-700 text-white"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                    className="bg-neutral-800 border-neutral-700 text-white"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn Profile</Label>
                  <Input
                    id="linkedin"
                    value={profileForm.linkedin}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, linkedin: e.target.value }))}
                    className="bg-neutral-800 border-neutral-700 text-white"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving Profile...
                    </>
                  ) : (
                    "Save Profile"
                  )}
                </Button>
              </form>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-center">Email Notifications</h3>
              <div className="text-center space-y-4">
                <p className="text-neutral-300">
                  Would you like to receive email notifications about events, mentorship opportunities, and updates?
                </p>

                <div className="flex items-center justify-center space-x-4 p-4 bg-neutral-800 rounded-lg">
                  <Bell className="h-5 w-5 text-indigo-400" />
                  <span>Enable Email Notifications</span>
                  <Switch
                    checked={notificationPreferences.enabled}
                    onCheckedChange={setNotificationPreferences.bind(null, { enabled: !notificationPreferences.enabled })}
                  />
                </div>                <div className="flex space-x-4 pt-4">
                  <Button
                    onClick={handleSkipNotifications}
                    variant="outline"
                    className="flex-1 border-neutral-600 text-neutral-300 hover:bg-neutral-800"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    Skip for Now
                  </Button>
                  <Button
                    onClick={handleEnableNotifications}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    Enable Notifications
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        {!allStepsCompleted && (
          <div className="flex justify-between pt-4 border-t border-neutral-800">
            <Button
              onClick={goToPrevStep}
              disabled={currentStep === 0}
              variant="outline"
              className="border-neutral-600 text-neutral-300 hover:bg-neutral-800"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              onClick={goToNextStep}
              disabled={currentStep === steps.length - 1 || !steps[currentStep].completed}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Completion Message */}
        {allStepsCompleted && !showSuccessAnimation && (
          <div className="text-center space-y-4 pt-4 border-t border-neutral-800">
            <div className="text-green-400 font-semibold">
              🎉 All steps completed! Welcome to the platform.
            </div>
            <Button
              onClick={handleComplete}
              className="bg-green-600 hover:bg-green-700"
              disabled={isCompleting}
            >
              {isCompleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Completing Setup...
                </>
              ) : (
                "Get Started"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
