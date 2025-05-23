// src/app/admin/mentors/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function AdminMentorsPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-orbitron">
            <Users className="mr-3 h-7 w-7 text-primary" />
            Mentors Management
          </CardTitle>
          <CardDescription>
            Create, view, edit, and delete mentor profiles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">
            <p className="text-muted-foreground text-lg">
              Mentor management features (Create, Edit, Delete) are coming soon!
            </p>
            {/* Placeholder for future functionality like a button to "Add New Mentor" and a table of mentors */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
