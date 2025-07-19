// src/app/mentor/evaluation/page.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ClipboardCheck, Star, TrendingUp, Award } from "lucide-react";

export default function MentorEvaluationPage() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Evaluation Center
            </h1>
            <p className="text-gray-600 text-lg">
              Review and provide feedback on your mentees' progress.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <ClipboardCheck className="h-5 w-5" />
            <span className="text-sm">Evaluation Tools</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Pending Evaluations</CardTitle>
            <ClipboardCheck className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 mb-1">3</div>
            <div className="flex items-center text-xs text-gray-500">
              <span>evaluations pending</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Average Rating</CardTitle>
            <Star className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 mb-1">4.8</div>
            <div className="flex items-center text-xs text-gray-500">
              <span>out of 5 stars</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Completed Reviews</CardTitle>
            <Award className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 mb-1">12</div>
            <div className="flex items-center text-xs text-gray-500">
              <span>reviews completed</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon Notice */}
      <Card className="border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900">Evaluation System</CardTitle>
          <CardDescription className="text-gray-600">
            Comprehensive mentee evaluation and feedback tools
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Enhanced Evaluation Tools Coming Soon</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            We're developing advanced evaluation features to help you better assess and guide your mentees' progress. Stay tuned for updates!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
