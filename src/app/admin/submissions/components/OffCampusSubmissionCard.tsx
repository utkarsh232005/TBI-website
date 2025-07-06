
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
  Loader2
} from "lucide-react";
import { useState } from "react";

interface OffCampusSubmissionCardProps {
  submission: Submission;
  processingAction: { id: string; type: 'accept' | 'reject' } | null;
  onProcessAction: (id: string, action: 'accept' | 'reject', name: string, email: string, campusStatus: Submission['campusStatus']) => void;
  onViewDetails: (submission: Submission) => void;
}

const formatDate = (date: Date | string | Timestamp | undefined) => {
  if (!date) return 'N/A';
  try {
    if (date && typeof date === 'object' && 'toDate' in date) {
      return format((date as Timestamp).toDate(), "PPp");
    }
    return format(new Date(date), "PPp");
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

  const truncateText = (text: string | undefined, maxLength: number = 100) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const fullIdea = [
    submission.startupIdea,
    submission.problemSolving ? `Problem: ${submission.problemSolving}` : '',
    submission.uniqueness ? `Unique Value: ${submission.uniqueness}` : '',
    submission.targetAudience ? `Target: ${submission.targetAudience}` : '',
  ].filter(part => part && part.trim()).join('\n\n') || submission.idea || 'No details provided.';

  return (
    <Card className="flex flex-col h-full bg-gradient-to-br from-neutral-900/60 via-neutral-800/40 to-neutral-900/60 border-neutral-700/50 hover:border-neutral-600/70 transition-all duration-300 hover:shadow-xl group">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${submission.campusStatus === 'off-campus' ? 'bg-purple-500/20 border-purple-400/30' : 'bg-blue-500/20 border-blue-400/30'}`}>
              {submission.campusStatus === 'off-campus' ? <Building className="h-5 w-5 text-purple-300" /> : <Landmark className="h-5 w-5 text-blue-300" />}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-neutral-100 truncate group-hover:text-white transition-colors">
                {submission.companyName || submission.fullName || 'Unknown Company'}
              </CardTitle>
              <CardDescription className="text-sm text-neutral-400 truncate">
                {submission.founderNames || submission.fullName || 'Unknown Founder'}
              </CardDescription>
            </div>
          </div>
          <Badge 
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border ${getStatusBadgeClasses(submission.status)}`}
          >
            {getStatusIcon(submission.status)}
            {submission.status || 'pending'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-grow space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-neutral-300">
            <Mail className="h-4 w-4 text-neutral-400 flex-shrink-0" />
            <span className="truncate">{submission.companyEmail || submission.email || 'No email'}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-neutral-300">
            <Briefcase className="h-4 w-4 text-neutral-400 flex-shrink-0" />
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-300 border-blue-500/20">
              {submission.domain || 'N/A'}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-sm text-neutral-300">
            <CalendarDays className="h-4 w-4 text-neutral-400 flex-shrink-0" />
            <span className="text-xs">{formatDate(submission.submittedAt)}</span>
          </div>
        </div>

        <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-neutral-400" />
              <span className="text-sm font-medium text-neutral-200">Startup Idea</span>
            </div>
            <div className="text-sm text-neutral-300 leading-relaxed bg-neutral-800/30 rounded-lg p-3 border border-neutral-700/30">
              {isExpanded ? fullIdea : truncateText(fullIdea)}
              {fullIdea.length > 100 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="ml-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  {isExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          </div>

        {submission.status === 'accepted' && (
          <div className="bg-emerald-950/30 border border-emerald-800/30 rounded-lg p-3 space-y-2">
            <div className="text-xs font-medium text-emerald-100 mb-2 flex items-center gap-2">
              <KeyRound className="h-3 w-3" /> Login Credentials
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <UserCircle className="h-3 w-3 text-emerald-400" />
                <span className="font-mono bg-emerald-900/30 px-2 py-1 rounded text-emerald-100">
                  {submission.firebaseUid}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4 flex flex-col gap-3">
        <Button 
          onClick={() => onViewDetails(submission)} 
          variant="outline"
          className="w-full border-neutral-600/50 text-neutral-300 hover:bg-neutral-800/50 hover:text-white hover:border-neutral-500"
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
        
        {submission.status === 'pending' && (
          <div className="flex gap-2 w-full">
            <Button
              onClick={() => onProcessAction(submission.id, 'accept', submission.fullName || submission.name, submission.companyEmail || submission.email, submission.campusStatus)}
              disabled={isProcessing}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isProcessing && processingAction?.type === 'accept' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ThumbsUp className="h-4 w-4 mr-2" />
              )}
              Accept
            </Button>
            <Button
              onClick={() => onProcessAction(submission.id, 'reject', submission.fullName || submission.name, submission.companyEmail || submission.email, submission.campusStatus)}
              disabled={isProcessing}
              variant="destructive"
              className="flex-1"
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
    </Card>
  );
}
