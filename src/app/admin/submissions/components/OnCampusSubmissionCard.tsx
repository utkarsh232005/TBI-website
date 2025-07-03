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
  onProcessAction: (id: string, action: 'accept' | 'reject', name: string, email: string) => void;
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
    <div className="group relative w-full h-full">      
      {/* Main card */}
      <Card className="relative h-full bg-white border-2 border-blue-100/50 shadow-lg hover:shadow-xl hover:border-blue-200/70 transition-all duration-300 ease-out rounded-2xl overflow-hidden">
        
        {/* Header */}
        <CardHeader className="pb-4 relative overflow-hidden">
          
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500/15 via-purple-500/10 to-indigo-500/15 rounded-full flex items-center justify-center border-2 border-white/70 shadow-lg backdrop-blur-sm">
                  <span className="text-blue-700 font-bold text-lg">
                    {submission.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              
              {/* Name and email */}
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-bold text-gray-800 truncate">
                  {submission.name}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 truncate">
                  {submission.email}
                </CardDescription>
              </div>
            </div>
            
            {/* Status indicator */}
            <div className="relative">
              <div className={`px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm backdrop-blur-sm ${getStatusBadgeClasses(submission.status)}`}>
                <div className="flex items-center gap-1.5">
                  {getStatusIcon(submission.status)}
                  <span className="capitalize">{submission.status}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        {/* Content */}
        <CardContent className="flex-grow flex flex-col justify-between relative">
          {/* Info grid */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100/50 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 hover:shadow-md">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-blue-600 uppercase tracking-wide">Full Name</div>
                <div className="text-sm font-semibold text-gray-800 truncate">
                  {submission.name}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-50/50 border border-purple-100/50 hover:bg-purple-50 hover:border-purple-200 transition-all duration-300 hover:shadow-md">
              <div className="p-2 bg-purple-100 rounded-lg">
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
              <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50/50 border border-green-100/50 hover:bg-green-50 hover:border-green-200 transition-all duration-300 hover:shadow-md">
                <div className="p-2 bg-green-100 rounded-lg">
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
              <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-50/50 border border-orange-100/50 hover:bg-orange-50 hover:border-orange-200 transition-all duration-300 hover:shadow-md">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Landmark className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-orange-600 uppercase tracking-wide">Campus</div>
                  <Badge className={`text-xs font-bold border shadow-sm ${getCampusBadgeClasses(submission.campusStatus)}`}>
                    {submission.campus}
                  </Badge>
                </div>
              </div>
            )}
          </div>
          
          {/* Action button */}
          <div className="relative">
            <Button 
              onClick={() => onViewDetails(submission)}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
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