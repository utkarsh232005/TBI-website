
// src/app/mentor/my-mentees/page.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function MyMenteesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Mentees</h1>
        <p className="text-muted-foreground mt-2">
          An overview of all the users under your mentorship.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            The "My Mentees" section is currently under construction.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            This page will display a list of all the startup founders you are currently mentoring.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
