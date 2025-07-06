
// src/app/mentor/profile/page.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { User } from "lucide-react";

export default function MentorProfilePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your public profile and account settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            The mentor profile and settings page is being developed.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Soon, you will be able to update your profile details, change your password, and manage notification preferences here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
