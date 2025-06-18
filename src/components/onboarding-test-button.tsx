"use client";

import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useUser } from "@/contexts/user-context";

export function OnboardingTestButton() {
  const { resetOnboarding } = useOnboarding();
  const { user } = useUser();

  if (!user) {
    return (
      <div className="mb-4 p-4 bg-neutral-800 rounded-lg">
        <p className="text-neutral-300 text-sm">
          Please log in to test the onboarding popup.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-4 p-4 bg-neutral-800 rounded-lg">
      <p className="text-neutral-300 text-sm mb-2">
        Logged in as: {user.name} ({user.email})
      </p>
      <Button 
        onClick={resetOnboarding}
        variant="outline"
        size="sm"
      >
        Reset Onboarding (Test)
      </Button>
    </div>
  );
}
