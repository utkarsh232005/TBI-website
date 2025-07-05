import { FileTextIcon, Loader2, AlertCircle, UserCircle, KeyRound, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Submission, SubmissionStatus, CampusStatus } from "@/types/Submission";
import { StatusBadge } from "./StatusBadge";
import { CampusBadge } from "./CampusBadge";
import { format } from 'date-fns';
import { SubmissionActions } from "./SubmissionActions";
import { Timestamp } from 'firebase/firestore';
import { useState } from 'react';
import { SubmissionDetailsModal } from './SubmissionDetailsModal';

interface SubmissionsTableProps {
  submissions: Submission[];
  processingAction: { id: string; type: 'accept' | 'reject' } | null;
  onProcessAction: (id: string, action: 'accept' | 'reject', name: string, email: string) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry: () => void;
  className?: string;
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

// Component for expandable idea cell
function IdeaCell({ idea, submissionId, status, temporaryUserId, temporaryPassword }: {
  idea: string;
  submissionId: string;
  status: string;
  temporaryUserId?: string;
  temporaryPassword?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 120;
  const shouldTruncate = idea && idea.length > maxLength;
  const displayText = isExpanded ? idea : (shouldTruncate ? `${idea.substring(0, maxLength)}...` : idea);

  return (
    <div className="text-sm text-neutral-200 max-w-md">
      <div className="mb-2 leading-relaxed">
        <span className="text-neutral-100">{displayText || 'N/A'}</span>
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2 inline-flex items-center text-xs text-indigo-400 hover:text-indigo-300 transition-all duration-200 hover:bg-indigo-900/20 px-2 py-1 rounded-md"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                More
              </>
            )}
          </button>
        )}
      </div>
      {status === 'accepted' && temporaryUserId && (
        <div className="bg-emerald-950/30 border border-emerald-800/30 rounded-lg p-3 text-xs text-emerald-200 space-y-2">
          <div className="font-medium text-emerald-100 mb-1">Login Credentials</div>
          <div className="flex items-center gap-2">
            <UserCircle className="h-3 w-3 text-emerald-400" />
            <span className="font-mono bg-emerald-900/30 px-2 py-1 rounded text-emerald-100">{temporaryUserId}</span>
          </div>
          <div className="flex items-center gap-2">
            <KeyRound className="h-3 w-3 text-emerald-400" />
            <span className="font-mono bg-emerald-900/30 px-2 py-1 rounded text-emerald-100">{temporaryPassword}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function SubmissionsTable({
  submissions,
  processingAction,
  onProcessAction,
  isLoading = false,
  error = null,
  onRetry,
  className = ''
}: SubmissionsTableProps) {
  if (isLoading && submissions.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 rounded-2xl bg-gradient-to-br from-neutral-900/50 via-neutral-800/30 to-neutral-900/50 border border-neutral-700/50">
        <div className="text-center space-y-4">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-400" />
          <div>
            <h3 className="text-lg font-semibold text-neutral-100">Loading submissions</h3>
            <p className="text-sm text-neutral-400 mt-1">Please wait while we fetch the data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 rounded-2xl bg-gradient-to-br from-red-950/20 via-red-900/10 to-red-950/20 border border-red-800/30">
        <div className="text-center space-y-4">
          <div className="p-4 rounded-full bg-red-900/30 w-fit mx-auto">
            <AlertCircle className="h-10 w-10 text-red-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-red-100">Unable to load submissions</h3>
            <p className="text-sm text-red-300 mt-2 max-w-md mx-auto leading-relaxed">{error}</p>
          </div>
          <Button 
            onClick={onRetry} 
            variant="outline" 
            className="mt-6 border-red-500/40 text-red-300 hover:bg-red-900/30 hover:text-white hover:border-red-400 transition-all duration-200"
          >
            <Loader2 className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-20 rounded-2xl bg-gradient-to-br from-neutral-900/40 via-neutral-800/20 to-neutral-900/40 border border-dashed border-neutral-600/50">
        <div className="space-y-6">
          <div className="p-6 rounded-full bg-neutral-800/50 w-fit mx-auto">
            <FileTextIcon className="h-16 w-16 text-neutral-400" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-neutral-100 mb-2">No submissions yet</h3>
            <p className="text-neutral-400 text-lg max-w-md mx-auto leading-relaxed">
              Applications will appear here once users submit their startup ideas through the form
            </p>
          </div>
          <div className="pt-4">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-neutral-800/30 text-sm text-neutral-400 border border-neutral-700/50">
              <div className="w-2 h-2 bg-neutral-500 rounded-full mr-2"></div>
              Waiting for applications...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-neutral-700/50 overflow-hidden bg-gradient-to-br from-neutral-900/60 via-neutral-800/40 to-neutral-900/60 backdrop-blur-sm shadow-2xl ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-neutral-800/60 via-neutral-700/40 to-neutral-800/60 border-b border-neutral-600/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                <div className="flex items-center space-x-2">
                  <UserCircle className="h-4 w-4 text-neutral-400" />
                  <span>Applicant</span>
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-200 uppercase tracking-wider">Company</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-200 uppercase tracking-wider">Domain</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-200 uppercase tracking-wider">Startup Idea</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-200 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-200 uppercase tracking-wider">Submitted</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-200 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-700/30">
            {submissions.map((submission, index) => (
              <tr 
                key={submission.id} 
                className={`
                  hover:bg-gradient-to-r hover:from-neutral-800/30 hover:via-neutral-700/20 hover:to-neutral-800/30 
                  transition-all duration-300 group
                  ${index % 2 === 0 ? 'bg-neutral-800/10' : 'bg-neutral-900/20'}
                `}
              >
                <td className="px-6 py-5">
                  <SubmissionDetailsModal submission={submission}>
                    <div className="flex items-center space-x-3 cursor-pointer hover:bg-neutral-800/20 -m-2 p-2 rounded-lg transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-indigo-400/30">
                        <span className="text-indigo-300 font-semibold text-sm">
                          {(submission.fullName || submission.name)?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-neutral-100 group-hover:text-white transition-colors truncate">
                          {submission.fullName || submission.name}
                        </div>
                        <div className="text-xs text-neutral-400 truncate">
                          {submission.companyEmail || submission.email}
                        </div>
                      </div>
                      <Eye className="h-4 w-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </SubmissionDetailsModal>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm text-neutral-300 group-hover:text-neutral-200">
                    {submission.companyName || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-900/40 to-blue-800/40 text-blue-200 border border-blue-700/40 shadow-lg">
                    {submission.domain || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm text-neutral-200 max-w-xs">
                    <div className="truncate">
                      {submission.idea || submission.startupIdea || 'N/A'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-2">
                    <StatusBadge 
                      status={submission.status} 
                      showDate={submission.processedByAdminAt ? 
                        (typeof submission.processedByAdminAt === 'object' && 'toDate' in submission.processedByAdminAt ? 
                          submission.processedByAdminAt.toDate() : 
                          new Date(submission.processedByAdminAt)) : 
                        null
                      }
                    />
                    <CampusBadge status={submission.campusStatus} />
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm text-neutral-400 group-hover:text-neutral-300">
                    {formatDate(submission.submittedAt)}
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <SubmissionDetailsModal submission={submission}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/30 hover:text-white"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </SubmissionDetailsModal>
                    <SubmissionActions
                      submissionId={submission.id}
                      status={submission.status}
                      processingAction={processingAction}
                      onAccept={() => onProcessAction(
                        submission.id, 
                        'accept', 
                        submission.name, 
                        submission.email
                      )}
                      onReject={() => onProcessAction(
                        submission.id, 
                        'reject', 
                        submission.name, 
                        submission.email
                      )}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
