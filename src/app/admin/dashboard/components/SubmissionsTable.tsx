import { FileTextIcon, Loader2, AlertCircle, UserCircle, KeyRound, ChevronDown, ChevronUp, Eye, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Submission, SubmissionStatus, CampusStatus } from "@/types/Submission";
import { StatusBadge } from "./StatusBadge";
import { CampusBadge } from "./CampusBadge";
import { format } from 'date-fns';
import { SubmissionActions } from "./SubmissionActions";
import { Timestamp } from 'firebase/firestore';
import { useState } from 'react';
import { SubmissionDetailsModal } from './SubmissionDetailsModal';

type Status = 'pending' | 'accepted' | 'rejected';

interface SubmissionsTableProps {
  submissions: Submission[];
  processingAction: { id: string; type: 'accept' | 'reject' } | null;
  onProcessAction: (id: string, action: 'accept' | 'reject', name: string, email: string, campusStatus: Submission['campusStatus']) => void;
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
    <div className="admin-body-small max-w-md">
      <div className="mb-2 leading-relaxed">
        <span className="admin-text-primary admin-font-medium">{displayText || 'N/A'}</span>
        {shouldTruncate && (
                      <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-2 inline-flex items-center admin-caption admin-link hover:bg-blue-100 px-2 py-1 rounded-md"
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
        <div className="admin-badge-success p-3 admin-caption space-y-2 w-full">
          <div className="admin-font-medium mb-1">Login Credentials</div>
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
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          </div>
          <div>
            <h3 className="admin-heading-4">Loading submissions</h3>
            <p className="admin-body-small mt-2">Fetching the latest application data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-red-100 to-rose-100 rounded-2xl flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h3 className="admin-heading-4 admin-text-error">Unable to load submissions</h3>
            <p className="admin-body-small mt-2 leading-relaxed">{error}</p>
          </div>
          <Button 
            onClick={onRetry} 
            className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-lg px-6 py-2 transition-all duration-300"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-gray-100 to-slate-100 rounded-3xl flex items-center justify-center">
            <FileTextIcon className="w-10 h-10 text-gray-400" />
          </div>
          <div>
            <h3 className="admin-heading-3">No submissions yet</h3>
            <p className="admin-body-small mt-2 max-w-md mx-auto leading-relaxed">
              Applications will appear here once users submit their startup ideas
            </p>
          </div>
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
            <span className="admin-body-small admin-font-medium text-blue-700">Waiting for submissions</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="p-4 text-left admin-table-header">Applicant</th>
              <th className="p-4 text-left admin-table-header">Company</th>
              <th className="p-4 text-left admin-table-header">Domain</th>
              <th className="p-4 text-left admin-table-header">Startup Idea</th>
              <th className="p-4 text-left admin-table-header">Status</th>
              <th className="p-4 text-left admin-table-header">Submitted</th>
              <th className="p-4 text-right admin-table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {submissions.map((submission, index) => (
              <tr 
                key={submission.id} 
                className={
                  `transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50/40`
                }
              >
                <td className="p-4">
                  <SubmissionDetailsModal submission={submission}>
                    <div className="flex items-center space-x-3 cursor-pointer hover:bg-blue-50 -m-2 p-2 rounded-lg transition-all duration-200">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-semibold text-sm shadow-sm">
                        {(submission.fullName || submission.name)?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="admin-table-cell-primary truncate">
                          {submission.fullName || submission.name}
                        </div>
                        <div className="admin-caption truncate">
                          {submission.companyEmail || submission.email}
                        </div>
                      </div>
                    </div>
                  </SubmissionDetailsModal>
                </td>
                <td className="p-4 admin-table-cell">{submission.companyName || '-'}</td>
                <td className="p-4 admin-table-cell">{submission.domain || '-'}</td>
                <td className="p-4 text-gray-800 max-w-xs">
                  <IdeaCell 
                    idea={submission.idea || ''} 
                    submissionId={submission.id} 
                    status={submission.status} 
                    temporaryUserId={submission.temporaryUserId} 
                    temporaryPassword={submission.temporaryPassword} 
                  />
                </td>
                <td className="p-4">
                  <StatusBadge status={submission.status as Status} />
                </td>
                <td className="p-4 admin-table-cell">{formatDate(submission.submittedAt)}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <SubmissionDetailsModal submission={submission}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 admin-btn-text bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300"
                      >
                        <Eye className="h-3 w-3 mr-1" />
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
                        submission.email,
                        submission.campusStatus
                      )}
                      onReject={() => onProcessAction(
                        submission.id, 
                        'reject', 
                        submission.name, 
                        submission.email,
                        submission.campusStatus
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
