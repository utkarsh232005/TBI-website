"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { OnboardingPopup } from "@/components/ui/onboarding-popup";
import { useUser } from "@/contexts/user-context";

export function OnboardingTestButton() {
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  const { user, firebaseUser } = useUser();

  const handleComplete = () => {
    console.log("Onboarding completed!");
  };

  const handleClose = () => {
    setShowOnboarding(false);
    console.log("Onboarding popup closed");
  };

  return (
    <div className="p-4">
      <Button 
        onClick={() => setShowOnboarding(true)}
        className="bg-blue-600 hover:bg-blue-700"
        disabled={!firebaseUser}
      >
        {!firebaseUser ? "Login First" : "Test Onboarding"}
      </Button>

      <OnboardingPopup
        isOpen={showOnboarding}
        onClose={handleClose}
        onComplete={handleComplete}
        userUid={firebaseUser?.uid}
      />

      {firebaseUser && (
        <div className="mt-4 p-2 bg-gray-100 rounded text-sm">
          <p>Logged in as: {firebaseUser.email}</p>
          <p>UID: {firebaseUser.uid}</p>
        </div>
      )}
    </div>
  );
}
