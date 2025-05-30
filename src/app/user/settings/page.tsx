
// src/app/user/settings/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function UserSettingsPage() {
  return (
    <div className="space-y-8">
      <Card className="bg-neutral-800/50 border-neutral-700/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white flex items-center">
            <Settings className="h-6 w-6 mr-3 text-indigo-400" />
            Account Settings
          </CardTitle>
          <CardDescription className="text-neutral-400">
            Manage your account preferences. (Functionality Coming Soon)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-300">
            This section will allow you to update your profile information,
            change your password (if applicable), and manage notification preferences.
          </p>
          <div className="mt-6 p-4 bg-neutral-700/30 rounded-lg border border-neutral-600/50 text-center">
            <p className="text-neutral-400">User settings are currently under development.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
