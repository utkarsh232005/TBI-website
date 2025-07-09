// src/app/mentor/profile/page.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { User } from "lucide-react";

export default function MentorProfilePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">
          Manage your public profile and account settings.
        </p>
      </div>

      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            The mentor profile and settings page is being developed.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            Soon, you will be able to update your profile details, change your password, and manage notification preferences here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
