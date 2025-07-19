
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Submission, CampusStatus } from "@/types/Submission";
import { SubmissionActions } from "@/app/admin/dashboard/components/SubmissionActions";
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
    <div className="w-full h-full">
      <Card className="relative h-full bg-white border border-purple-100 shadow-sm hover:shadow-md transition rounded-xl overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center border border-purple-100">
                <Building className="h-5 w-5 text-purple-700" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base font-semibold text-gray-900 truncate">
                  {submission.companyName || submission.name || 'Unknown Company'}
                </CardTitle>
                <CardDescription className="text-xs text-gray-500 truncate">
                  {submission.name || 'Unknown Founder'}
                </CardDescription>
              </div>
            </div>
            <div>
              <Badge 
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                  submission.status === 'accepted'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : submission.status === 'rejected'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
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
        <CardContent className="flex-grow space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 border border-purple-100">
              <div className="p-2 bg-purple-100 rounded-md">
                <Mail className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-purple-600 uppercase tracking-wide">Email</div>
                <div className="text-sm font-semibold text-gray-800 truncate">
                  {submission.companyEmail || submission.email || 'No email provided'}
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
            {(submission.domain || submission.businessCategory) && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                <div className="p-2 bg-blue-100 rounded-md">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-blue-600 uppercase tracking-wide">Domain</div>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-bold">
                    {submission.domain || submission.businessCategory}
                  </Badge>
                </div>
              </div>
            )}
            {submission.developmentStage && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
                <div className="p-2 bg-amber-100 rounded-md">
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-amber-600 uppercase tracking-wide">Stage</div>
                  <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs font-bold">
                    {submission.developmentStage}
                  </Badge>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-rose-50 border border-rose-100">
              <div className="p-2 bg-rose-100 rounded-md">
                <MapPin className="h-4 w-4 text-rose-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-rose-600 uppercase tracking-wide">Campus Status</div>
                <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-xs font-bold">
                  Off-Campus
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50 border border-indigo-100">
              <div className="p-2 bg-indigo-100 rounded-md">
                <CalendarDays className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-indigo-600 uppercase tracking-wide">Submitted</div>
                <div className="text-sm font-semibold text-gray-800">
                  {formatDate(submission.submittedAt)}
                </div>
              </div>
            </div>
            {submission.linkedinUrl && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-cyan-50 border border-cyan-100">
                <div className="p-2 bg-cyan-100 rounded-md">
                  <ExternalLink className="h-4 w-4 text-cyan-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-cyan-600 uppercase tracking-wide">LinkedIn</div>
                  <a 
                    href={submission.linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-cyan-700 hover:text-cyan-800 truncate block"
                  >
                    Profile Link
                  </a>
                </div>
              </div>
            )}
          </div>
          {submission.idea && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 border border-purple-100">
                <div className="p-2 bg-purple-100 rounded-md">
                  <FlaskConical className="h-4 w-4 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-violet-600 uppercase tracking-wide">Startup Details</div>
                  <div className="text-sm font-semibold text-gray-800">
                    {isExpanded ? 'Full Details' : 'Click to expand'}
                  </div>
                </div>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-violet-600 hover:text-violet-700 transition"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>
              {isExpanded && (
                <div className="bg-white border border-purple-100 rounded-lg p-4 space-y-4">
                  {submission.startupIdea && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-violet-600 uppercase tracking-wide">Startup Idea</div>
                      <div className="text-sm text-gray-700 leading-relaxed bg-purple-50 p-3 rounded-md border border-purple-100">
                        {submission.startupIdea}
                      </div>
                    </div>
                  )}
                  {submission.problemSolving && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-blue-600 uppercase tracking-wide">Problem Solving</div>
                      <div className="text-sm text-gray-700 leading-relaxed bg-blue-50 p-3 rounded-md border border-blue-100">
                        {submission.problemSolving}
                      </div>
                    </div>
                  )}
                  {submission.uniqueness && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Uniqueness</div>
                      <div className="text-sm text-gray-700 leading-relaxed bg-emerald-50 p-3 rounded-md border border-emerald-100">
                        {submission.uniqueness}
                      </div>
                    </div>
                  )}
                  {submission.targetAudience && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-orange-600 uppercase tracking-wide">Target Audience</div>
                      <div className="text-sm text-gray-700 leading-relaxed bg-orange-50 p-3 rounded-md border border-orange-100">
                        {submission.targetAudience}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {submission.status === 'accepted' && submission.temporaryUserId && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 rounded-md">
                  <KeyRound className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="text-sm font-semibold text-emerald-800">Login Credentials Generated</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <UserCircle className="h-3 w-3 text-emerald-700" />
                  <span className="font-mono bg-emerald-100 px-2 py-1 rounded text-emerald-800 text-xs">{submission.temporaryUserId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <KeyRound className="h-3 w-3 text-emerald-700" />
                  <span className="font-mono bg-emerald-100 px-2 py-1 rounded text-emerald-800 text-xs">{submission.temporaryPassword}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-0">
          <div className="w-full space-y-3">
            <Button 
              onClick={() => onViewDetails(submission)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition"
            >
              <div className="flex items-center justify-center gap-2">
                <Eye className="h-4 w-4" />
                <span>View Details</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </Button>
            <SubmissionActions
              submissionId={submission.id}
              status={submission.status}
              processingAction={processingAction}
              onAccept={() => onProcessAction(
                submission.id, 
                'accept', 
                submission.name || submission.companyName || 'Unknown', 
                submission.companyEmail || submission.email || 'unknown@example.com',
                submission.campusStatus
              )}
              onReject={() => onProcessAction(
                submission.id, 
                'reject', 
                submission.name || submission.companyName || 'Unknown', 
                submission.companyEmail || submission.email || 'unknown@example.com',
                submission.campusStatus
              )}
            />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
