// src/app/user/dashboard/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Info, FileText } from "lucide-react";

export default function UserDashboardPage() {
  // In a real scenario, you'd fetch the specific user's application data here.
  // This requires a robust authentication system to identify the logged-in user.
  // For now, we'll display a generic message and placeholder status.

  const applicationStatus = "Accepted"; // Placeholder
  const userName = "Innovator"; // Placeholder
  return (
    <div className="space-y-8">
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

          <div className="mt-6 p-4 bg-neutral-700/30 rounded-lg border border-neutral-600/50">
            <h4 className="text-md font-semibold text-neutral-300 mb-2">Next Steps:</h4>
            <ul className="list-disc list-inside text-neutral-400 text-sm space-y-1">
              <li>Explore the "Mentors" section to find experts in your field.</li>
              <li>Check out "Events" for upcoming workshops and networking opportunities.</li>
              <li>(Coming Soon) Update your profile and communication preferences in "Settings".</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
