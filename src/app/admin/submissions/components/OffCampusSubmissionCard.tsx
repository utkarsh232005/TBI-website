'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Submission, CampusStatus } from "@/types/Submission";
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { 
  FileTextIcon, 
  UserCircle, 
  KeyRound, 
  Mail, 
  CalendarDays, 
  FlaskConical, 
  Building, 
  Landmark, 
  Phone, 
  ExternalLink, 
  GraduationCap, 
  User, 
  Info,
  MapPin,
  Briefcase,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Star,
  Award,
  BookOpen,
  Zap,
  Heart
} from "lucide-react";
import { SubmissionActions } from "@/app/admin/dashboard/components/SubmissionActions";
import { useState } from "react";

interface OffCampusSubmissionCardProps {
  submission: Submission;
  processingAction: { id: string; type: 'accept' | 'reject' } | null;
  onProcessAction: (id: string, action: 'accept' | 'reject', name: string, email: string) => void;
  onViewDetails: (submission: Submission) => void;
}

const formatDate = (date: Date | string | Timestamp | undefined) => {
  if (!date) return 'N/A';
  try {
    // Handle Firestore Timestamp
    if (date && typeof date === 'object' && 'toDate' in date) {
      return format((date as Timestamp).toDate(), "PPpp");
    }
    return format(new Date(date), "PPpp");
  } catch {
    return 'Invalid Date';
  }
};

export function OffCampusSubmissionCard({
  submission,
  processingAction,
  onProcessAction,
  onViewDetails,
}: OffCampusSubmissionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusBadgeClasses = (status: Submission['status']) =>
    status === 'accepted'
      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
      : status === 'rejected'
        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        : 'bg-amber-500/10 border-amber-500/20 text-amber-400';

  const getStatusIcon = (status: Submission['status']) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-3 w-3" />;
      case 'rejected':
        return <XCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const isProcessing = processingAction?.id === submission.id;

  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div className="group relative w-full h-full">
      {/* Background gradient and effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-white to-pink-50/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
      
      {/* Main card */}
      <Card className="relative h-full backdrop-blur-sm bg-white/95 border-2 border-purple-100/50 shadow-lg shadow-purple-100/25 hover:shadow-xl hover:shadow-purple-200/30 hover:border-purple-200/70 transition-all duration-500 ease-out rounded-2xl overflow-hidden group-hover:scale-[1.02] group-hover:-translate-y-1">
        
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-violet-500 opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Header */}
        <CardHeader className="pb-4 relative overflow-hidden">
          {/* Header background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-50/30 via-white/20 to-pink-50/30 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Company icon */}
              <div className="relative group/icon">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-violet-500/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500/15 via-pink-500/10 to-violet-500/15 rounded-full flex items-center justify-center border-2 border-white/70 shadow-lg backdrop-blur-sm group-hover/icon:shadow-xl group-hover/icon:scale-110 transition-all duration-400">
                  <Building className="h-5 w-5 text-purple-700 group-hover/icon:text-purple-800 transition-colors duration-300" />
                </div>
              </div>
              
              {/* Company name and founder */}
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-bold text-gray-800 group-hover:text-gray-900 transition-colors duration-300 truncate">
                  {submission.companyName || submission.name || 'Unknown Company'}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300 truncate">
                  {submission.name || 'Unknown Founder'}
                </CardDescription>
              </div>
            </div>
            
            {/* Status indicator */}
            <div className="relative">
              <Badge 
                className={`px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                  submission.status === 'accepted'
                    ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-700 border-emerald-200 shadow-emerald-100'
                    : submission.status === 'rejected'
                      ? 'bg-gradient-to-r from-rose-500/20 to-red-500/20 text-rose-700 border-rose-200 shadow-rose-100'
                      : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 border-amber-200 shadow-amber-100'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {getStatusIcon(submission.status)}
                  <span className="capitalize">{submission.status || 'pending'}</span>
                </div>
              </Badge>
            </div>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="flex-grow space-y-4 relative">
          {/* Info sections */}
          <div className="space-y-3">
            <div className="group/item flex items-center gap-3 p-3 rounded-xl bg-purple-50/50 border border-purple-100/50 hover:bg-purple-50 hover:border-purple-200 transition-all duration-300 hover:shadow-md">
              <div className="p-2 bg-purple-100 rounded-lg group-hover/item:bg-purple-200 group-hover/item:scale-110 transition-all duration-300">
                <Mail className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-purple-600 uppercase tracking-wide">Email</div>
                <div className="text-sm font-semibold text-gray-800 truncate group-hover/item:text-gray-900 transition-colors duration-300">
                  {submission.companyEmail || submission.email || 'No email provided'}
                </div>
              </div>
            </div>
            
            {submission.phone && (
              <div className="group/item flex items-center gap-3 p-3 rounded-xl bg-green-50/50 border border-green-100/50 hover:bg-green-50 hover:border-green-200 transition-all duration-300 hover:shadow-md">
                <div className="p-2 bg-green-100 rounded-lg group-hover/item:bg-green-200 group-hover/item:scale-110 transition-all duration-300">
                  <Phone className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-green-600 uppercase tracking-wide">Phone</div>
                  <div className="text-sm font-semibold text-gray-800 truncate group-hover/item:text-gray-900 transition-colors duration-300">
                    {submission.phone}
                  </div>
                </div>
              </div>
            )}
            
            {(submission.domain || submission.businessCategory) && (
              <div className="group/item flex items-center gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100/50 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 hover:shadow-md">
                <div className="p-2 bg-blue-100 rounded-lg group-hover/item:bg-blue-200 group-hover/item:scale-110 transition-all duration-300">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-blue-600 uppercase tracking-wide">Domain</div>
                  <Badge className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-700 border-blue-200 shadow-blue-100 text-xs font-bold">
                    {submission.domain || submission.businessCategory}
                  </Badge>
                </div>
              </div>
            )}

            {submission.developmentStage && (
              <div className="group/item flex items-center gap-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100/50 hover:bg-amber-50 hover:border-amber-200 transition-all duration-300 hover:shadow-md">
                <div className="p-2 bg-amber-100 rounded-lg group-hover/item:bg-amber-200 group-hover/item:scale-110 transition-all duration-300">
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-amber-600 uppercase tracking-wide">Stage</div>
                  <Badge className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 border-amber-200 shadow-amber-100 text-xs font-bold">
                    {submission.developmentStage}
                  </Badge>
                </div>
              </div>
            )}

            <div className="group/item flex items-center gap-3 p-3 rounded-xl bg-rose-50/50 border border-rose-100/50 hover:bg-rose-50 hover:border-rose-200 transition-all duration-300 hover:shadow-md">
              <div className="p-2 bg-rose-100 rounded-lg group-hover/item:bg-rose-200 group-hover/item:scale-110 transition-all duration-300">
                <MapPin className="h-4 w-4 text-rose-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-rose-600 uppercase tracking-wide">Campus Status</div>
                <Badge className="bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 border-rose-200 shadow-rose-100 text-xs font-bold">
                  Off-Campus
                </Badge>
              </div>
            </div>

            <div className="group/item flex items-center gap-3 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100/50 hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-300 hover:shadow-md">
              <div className="p-2 bg-indigo-100 rounded-lg group-hover/item:bg-indigo-200 group-hover/item:scale-110 transition-all duration-300">
                <CalendarDays className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-indigo-600 uppercase tracking-wide">Submitted</div>
                <div className="text-sm font-semibold text-gray-800 group-hover/item:text-gray-900 transition-colors duration-300">
                  {formatDate(submission.submittedAt)}
                </div>
              </div>
            </div>

            {submission.linkedinUrl && (
              <div className="group/item flex items-center gap-3 p-3 rounded-xl bg-cyan-50/50 border border-cyan-100/50 hover:bg-cyan-50 hover:border-cyan-200 transition-all duration-300 hover:shadow-md">
                <div className="p-2 bg-cyan-100 rounded-lg group-hover/item:bg-cyan-200 group-hover/item:scale-110 transition-all duration-300">
                  <ExternalLink className="h-4 w-4 text-cyan-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-cyan-600 uppercase tracking-wide">LinkedIn</div>
                  <a 
                    href={submission.linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-cyan-700 hover:text-cyan-800 transition-colors duration-300 truncate block"
                  >
                    Profile Link
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Startup idea section */}
          {submission.idea && (
            <div className="space-y-3">
              <div className="group/item flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-violet-50/50 to-purple-50/50 border border-violet-100/50 hover:from-violet-50 hover:to-purple-50 hover:border-violet-200 transition-all duration-300 hover:shadow-md">
                <div className="p-2 bg-gradient-to-r from-violet-100 to-purple-100 rounded-lg group-hover/item:from-violet-200 group-hover/item:to-purple-200 group-hover/item:scale-110 transition-all duration-300">
                  <FlaskConical className="h-4 w-4 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-violet-600 uppercase tracking-wide">Startup Details</div>
                  <div className="text-sm font-semibold text-gray-800 group-hover/item:text-gray-900 transition-colors duration-300">
                    {isExpanded ? 'Full Details' : 'Click to expand'}
                  </div>
                </div>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-violet-600 hover:text-violet-700 transition-colors duration-300"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>
              
              {isExpanded && (
                <div className="bg-white/80 backdrop-blur-sm border border-violet-100/50 rounded-xl p-4 space-y-4 shadow-sm">
                  {submission.startupIdea && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-violet-600 uppercase tracking-wide">Startup Idea</div>
                      <div className="text-sm text-gray-700 leading-relaxed bg-gradient-to-r from-violet-50/50 to-purple-50/50 p-3 rounded-lg border border-violet-100/30">
                        {submission.startupIdea}
                      </div>
                    </div>
                  )}
                  
                  {submission.problemSolving && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-blue-600 uppercase tracking-wide">Problem Solving</div>
                      <div className="text-sm text-gray-700 leading-relaxed bg-gradient-to-r from-blue-50/50 to-cyan-50/50 p-3 rounded-lg border border-blue-100/30">
                        {submission.problemSolving}
                      </div>
                    </div>
                  )}
                  
                  {submission.uniqueness && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Uniqueness</div>
                      <div className="text-sm text-gray-700 leading-relaxed bg-gradient-to-r from-emerald-50/50 to-green-50/50 p-3 rounded-lg border border-emerald-100/30">
                        {submission.uniqueness}
                      </div>
                    </div>
                  )}
                  
                  {submission.targetAudience && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-orange-600 uppercase tracking-wide">Target Audience</div>
                      <div className="text-sm text-gray-700 leading-relaxed bg-gradient-to-r from-orange-50/50 to-amber-50/50 p-3 rounded-lg border border-orange-100/30">
                        {submission.targetAudience}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Login credentials for accepted submissions */}
          {submission.status === 'accepted' && submission.temporaryUserId && (
            <div className="bg-gradient-to-r from-emerald-50/80 to-green-50/80 border-2 border-emerald-200/50 rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <KeyRound className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="text-sm font-bold text-emerald-700 uppercase tracking-wide">Login Credentials</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 bg-emerald-100/50 rounded-lg">
                  <UserCircle className="h-4 w-4 text-emerald-600" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-emerald-600 uppercase tracking-wide">User ID</div>
                    <div className="font-mono text-sm font-semibold text-emerald-800 truncate">
                      {submission.temporaryUserId}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-emerald-100/50 rounded-lg">
                  <KeyRound className="h-4 w-4 text-emerald-600" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Password</div>
                    <div className="font-mono text-sm font-semibold text-emerald-800 truncate">
                      {submission.temporaryPassword}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        {/* Footer */}
        <CardFooter className="pt-4 flex flex-col gap-3 relative">
          {/* View details button */}
          <Button 
            onClick={() => onViewDetails(submission)}
            className="w-full group/btn relative bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-xl border-0 shadow-lg shadow-purple-200/50 hover:shadow-xl hover:shadow-purple-300/50 transition-all duration-300 hover:scale-105 overflow-hidden"
          >
            {/* Button shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
            
            <div className="relative flex items-center justify-center gap-2">
              <Eye className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-300" />
              <span>View Details</span>
              <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
            </div>
          </Button>
          
          {/* Action buttons for pending submissions */}
          {submission.status === 'pending' && (
            <div className="flex gap-2 w-full">
              <Button
                onClick={() => onProcessAction(submission.id, 'accept', submission.name, submission.email)}
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-2 px-4 rounded-xl border-0 shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:shadow-emerald-300/50 transition-all duration-300 hover:scale-105"
              >
                {isProcessing && processingAction?.type === 'accept' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ThumbsUp className="h-4 w-4 mr-2" />
                )}
                Accept
              </Button>
              <Button
                onClick={() => onProcessAction(submission.id, 'reject', submission.name, submission.email)}
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-semibold py-2 px-4 rounded-xl border-0 shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-300/50 transition-all duration-300 hover:scale-105"
              >
                {isProcessing && processingAction?.type === 'reject' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ThumbsDown className="h-4 w-4 mr-2" />
                )}
                Reject
              </Button>
            </div>
          )}
        </CardFooter>
        
        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-violet-500 opacity-40 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Floating particles effect */}
        <div className="absolute top-4 right-4 w-2 h-2 bg-purple-400/30 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-300 animate-pulse"></div>
        <div className="absolute top-8 right-8 w-1 h-1 bg-pink-400/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-500 animate-pulse"></div>
        <div className="absolute bottom-8 left-4 w-1.5 h-1.5 bg-violet-400/30 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-700 animate-pulse"></div>
      </Card>
    </div>
  );
}
