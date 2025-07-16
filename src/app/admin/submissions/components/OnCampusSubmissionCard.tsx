
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Submission, CampusStatus } from "@/types/Submission";
import { format } from 'date-fns';
import { FileTextIcon, UserCircle, KeyRound, Mail, CalendarDays, FlaskConical, Building, Landmark, Phone, ExternalLink, GraduationCap, User, Info, Eye, Sparkles, Star, Award, Clock, BookOpen, Zap, Heart, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { SubmissionActions } from "@/app/admin/dashboard/components/SubmissionActions";
import { useState } from "react";

interface OnCampusSubmissionCardProps {
  submission: Submission;
  processingAction: { id: string; type: 'accept' | 'reject' } | null;
  onProcessAction: (id: string, action: 'accept' | 'reject', name: string, email: string, campusStatus: Submission['campusStatus']) => void;
  onViewDetails: (submission: Submission) => void;
}

const formatDate = (date: Date | string | undefined) => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), "PPpp");
  } catch {
    return 'Invalid Date';
  }
};

export function OnCampusSubmissionCard({
  submission,
  processingAction,
  onProcessAction,
  onViewDetails,
}: OnCampusSubmissionCardProps) {
  const getStatusBadgeClasses = (status: Submission['status']) =>
    status === 'accepted'
      ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-700 border-emerald-200 shadow-emerald-100'
      : status === 'rejected'
        ? 'bg-gradient-to-r from-rose-500/20 to-red-500/20 text-rose-700 border-rose-200 shadow-rose-100'
        : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 border-amber-200 shadow-amber-100';

  const getCampusBadgeClasses = (status?: CampusStatus) =>
    status === 'campus'
      ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-700 border-blue-200 shadow-blue-100'
      : status === 'off-campus'
        ? 'bg-gradient-to-r from-purple-500/20 to-violet-500/20 text-purple-700 border-purple-200 shadow-purple-100'
        : 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-700 border-gray-200 shadow-gray-100';

  const getStatusIcon = (status: Submission['status']) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-3 w-3 text-emerald-600" />;
      case 'rejected':
        return <XCircle className="h-3 w-3 text-rose-600" />;
      default:
        return <Clock className="h-3 w-3 text-amber-600" />;
    }
  };

  return (
    <div className="w-full h-full">
      <Card className="relative h-full bg-white border border-blue-100 shadow-sm hover:shadow-md transition rounded-xl overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
                <span className="text-blue-700 font-bold text-lg">
                  {submission.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base font-semibold text-gray-900 truncate">
                  {submission.name}
                </CardTitle>
                <CardDescription className="text-xs text-gray-500 truncate">
                  {submission.email}
                </CardDescription>
              </div>
            </div>
            <div>
              <div className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusBadgeClasses(submission.status)}`}>
                <div className="flex items-center gap-1.5">
                  {getStatusIcon(submission.status)}
                  <span className="capitalize">{submission.status}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-between">
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
              <div className="p-2 bg-blue-100 rounded-md">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-blue-600 uppercase tracking-wide">Full Name</div>
                <div className="text-sm font-semibold text-gray-800 truncate">
                  {submission.name}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 border border-purple-100">
              <div className="p-2 bg-purple-100 rounded-md">
                <Mail className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-purple-600 uppercase tracking-wide">Email</div>
                <div className="text-sm font-semibold text-gray-800 truncate">
                  {submission.email}
                </div>
              </div>
            </div>
            {submission.phone && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-100">
                <div className="p-2 bg-green-100 rounded-md">
                  <Phone className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-green-600 uppercase tracking-wide">Phone</div>
                  <div className="text-sm font-semibold text-gray-800 truncate">
                    {submission.phone}
                  </div>
                </div>
              </div>
            )}
            {submission.campus && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 border border-orange-100">
                <div className="p-2 bg-orange-100 rounded-md">
                  <Landmark className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-orange-600 uppercase tracking-wide">Campus</div>
                  <Badge className={`text-xs font-bold border ${getCampusBadgeClasses(submission.campusStatus)}`}>{submission.campus}</Badge>
                </div>
              </div>
            )}
          </div>
          <div>
            <Button 
              onClick={() => onViewDetails(submission)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition"
            >
              <div className="flex items-center justify-center gap-2">
                <Eye className="h-4 w-4" />
                <span>View Details</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
