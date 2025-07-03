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
    <div className="text-sm text-gray-700 max-w-md">
      <div className="mb-2 leading-relaxed">
        <span className="text-gray-900 font-medium">{displayText || 'N/A'}</span>
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2 inline-flex items-center text-xs text-blue-600 hover:text-blue-800 transition-all duration-200 hover:bg-blue-100 px-2 py-1 rounded-md"
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
        <div className="admin-badge-success p-3 text-xs space-y-2 w-full">
          <div className="font-medium mb-1">Login Credentials</div>
          <div className="flex items-center gap-2">
            <UserCircle className="h-3 w-3 text-green-700" />
            <span className="font-mono bg-green-100 px-2 py-1 rounded text-green-800">{temporaryUserId}</span>
          </div>
          <div className="flex items-center gap-2">
            <KeyRound className="h-3 w-3 text-green-700" />
            <span className="font-mono bg-green-100 px-2 py-1 rounded text-green-800">{temporaryPassword}</span>
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
      <div className="flex items-center justify-center py-16 rounded-2xl admin-card">
        <div className="text-center space-y-4">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Loading submissions</h3>
            <p className="text-sm text-gray-600 mt-1">Please wait while we fetch the data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 rounded-2xl admin-card border-red-200">
        <div className="text-center space-y-4">
          <div className="admin-icon admin-icon-red w-fit mx-auto">
            <AlertCircle className="h-10 w-10" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-red-700">Unable to load submissions</h3>
            <p className="text-sm text-red-600 mt-2 max-w-md mx-auto leading-relaxed">{error}</p>
          </div>
          <Button 
            onClick={onRetry} 
            variant="outline" 
            className="admin-btn admin-btn-secondary mt-6 border-red-300 text-red-700 hover:border-red-500"
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
      <div className="text-center py-20 rounded-2xl admin-card border-dashed border-gray-200">
        <div className="space-y-6">
          <div className="admin-icon admin-icon-blue w-fit mx-auto p-6">
            <FileTextIcon className="h-16 w-16" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No submissions yet</h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">
              Applications will appear here once users submit their startup ideas through the form
            </p>
          </div>
          <div className="pt-4">
            <div className="admin-badge admin-badge-neutral inline-flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Waiting for applications...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`admin-card overflow-hidden glass-card glass-card-hover rounded-xl shadow-md border border-gray-200/40 ${className}`}>
      <div className="overflow-x-auto admin-scrollbar">
        <table className="admin-table w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="p-4 text-left font-semibold text-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-md bg-blue-50">
                    <UserCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <span>Applicant</span>
                </div>
              </th>
              <th className="p-4 text-left font-semibold text-gray-700">Company</th>
              <th className="p-4 text-left font-semibold text-gray-700">Domain</th>
              <th className="p-4 text-left font-semibold text-gray-700">Startup Idea</th>
              <th className="p-4 text-left font-semibold text-gray-700">Status</th>
              <th className="p-4 text-left font-semibold text-gray-700">Submitted</th>
              <th className="p-4 text-right font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {submissions.map((submission, index) => (
              <tr 
                key={submission.id} 
                className="group transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/30"
              >
                <td className="p-5">
                  <SubmissionDetailsModal submission={submission}>
                    <div className="flex items-center space-x-3 cursor-pointer hover:bg-blue-100/30 -m-2 p-2 rounded-lg transition-colors">
                      <div className="admin-icon admin-icon-blue w-10 h-10 text-lg font-bold flex items-center justify-center shadow-sm">
                        <span>
                          {(submission.fullName || submission.name)?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-800 group-hover:text-gray-900 transition-colors truncate">
                          {submission.fullName || submission.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {submission.companyEmail || submission.email}
                        </div>
                      </div>
                      <div className="bg-white/80 p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <Eye className="h-4 w-4 text-blue-500" />
                      </div>
                    </div>
                  </SubmissionDetailsModal>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">
                    {submission.companyName || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 border border-blue-200/40 shadow-sm">
                    {submission.domain || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm text-gray-700 max-w-xs group-hover:text-gray-900">
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
                  <div className="text-sm text-gray-500 group-hover:text-gray-700">
                    {formatDate(submission.submittedAt)}
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <SubmissionDetailsModal submission={submission}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 border bg-white h-9 px-4 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 shadow-sm hover:shadow-md"
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
