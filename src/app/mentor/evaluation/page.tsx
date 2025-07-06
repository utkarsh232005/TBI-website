
// src/app/mentor/evaluation/page.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ClipboardCheck } from "lucide-react";

export default function MentorEvaluationPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Evaluation</h1>
        <p className="text-muted-foreground mt-2">
          Review and provide feedback on your mentees' progress.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            The mentee evaluation module is currently under development.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <ClipboardCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            This section will allow you to track milestones, review submissions, and provide structured evaluations for your mentees.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
