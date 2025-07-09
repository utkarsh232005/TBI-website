// src/app/mentor/evaluation/page.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ClipboardCheck } from "lucide-react";

export default function MentorEvaluationPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Evaluation</h1>
        <p className="text-gray-600 mt-1">
          Review and provide feedback on your mentees' progress.
        </p>
      </div>

      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            The mentee evaluation module is currently under development.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <ClipboardCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            This section will allow you to track milestones, review submissions, and provide structured evaluations for your mentees.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
