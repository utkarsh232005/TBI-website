"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { 
  Lock, 
  User, 
  Bell, 
  Check, 
  ChevronRight,
  ChevronLeft,
  Loader2
} from "lucide-react";
import {
  updateUserPassword,
  updateUserProfile,
  updateNotificationPreferences,
  completeUserOnboarding,
  type UpdatePasswordFormValues,
  type UpdateProfileFormValues,
  type UpdateNotificationPreferencesFormValues,
} from "@/app/actions/user-onboarding-actions";

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
  userIdentifier?: string; // email or temporaryUserId of logged in user
}

export function OnboardingPopup({ isOpen, onClose, onComplete, userIdentifier }: OnboardingPopupProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  
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
    if (!userIdentifier) {
      toast({
        title: "Error",
        description: "User not identified. Please log in again.",
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

    setIsLoading(true);
    try {
      const result = await updateUserPassword({
        userIdentifier,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        completeStep(0);
        setCurrentStep(1);
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
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userIdentifier) {
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
        userIdentifier,
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
    if (!userIdentifier) {
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
        userIdentifier,
        emailNotifications: enable,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        setNotificationPreferences({ enabled: enable });
        completeStep(2);
        
        // Complete the entire onboarding process
        await completeUserOnboarding(userIdentifier);
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

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  React.useEffect(() => {
    if (allStepsCompleted && currentStep === steps.length - 1) {
      // Auto-complete after a short delay when all steps are done
      const timer = setTimeout(() => {
        handleComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [allStepsCompleted, currentStep]);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl bg-neutral-900 border-neutral-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-white">
            Welcome! Let's get you started
          </DialogTitle>
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
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="bg-neutral-800 border-neutral-700 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="bg-neutral-800 border-neutral-700 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="bg-neutral-800 border-neutral-700 text-white"
                    required
                  />
                </div>                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating Password...
                    </>
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
        {allStepsCompleted && (
          <div className="text-center space-y-4 pt-4 border-t border-neutral-800">
            <div className="text-green-400 font-semibold">
              🎉 All steps completed! Welcome to the platform.
            </div>
            <Button
              onClick={handleComplete}
              className="bg-green-600 hover:bg-green-700"
            >
              Get Started
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
