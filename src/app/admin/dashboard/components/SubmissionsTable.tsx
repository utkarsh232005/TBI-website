import { FileTextIcon, Loader2, AlertCircle, RefreshCw, UserCircle, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Submission, SubmissionStatus, CampusStatus } from "@/types/Submission";
import { StatusBadge } from "./StatusBadge";
import { CampusBadge } from "./CampusBadge";
import { format } from 'date-fns';
import { SubmissionActions } from "./SubmissionActions";

interface SubmissionsTableProps {
  submissions: Submission[];
  processingAction: { id: string; type: 'accept' | 'reject' } | null;
  onProcessAction: (id: string, action: 'accept' | 'reject', name: string, email: string) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry: () => void;
  className?: string;
}

const formatDate = (date: Date | string | undefined) => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), "PPpp");
  } catch {
    return 'Invalid Date';
  }
};

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
      <div className="flex items-center justify-center py-10 rounded-xl bg-neutral-900/30">
        <Loader2 className="mr-3 h-8 w-8 animate-spin text-indigo-400" />
        <span className="text-neutral-300">Loading submissions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 rounded-xl bg-rose-900/10 border border-rose-900/30">
        <AlertCircle className="h-10 w-10 text-rose-400 mb-3" />
        <h3 className="text-lg font-semibold text-rose-100">Error loading data</h3>
        <p className="text-sm text-rose-300 mt-1 mb-4 text-center max-w-md">{error}</p>
        <Button 
          onClick={onRetry} 
          variant="outline" 
          className="border-rose-500/30 text-rose-300 hover:bg-rose-900/30 hover:text-white"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-12 rounded-xl bg-neutral-900/30 border border-dashed border-neutral-700/50">
        <FileTextIcon className="mx-auto h-12 w-12 text-neutral-500 mb-4" />
        <h3 className="text-lg font-medium text-neutral-200">No submissions yet</h3>
        <p className="text-neutral-400 mt-1">Applications will appear here once submitted</p>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-neutral-800/50 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-800/30 border-b border-neutral-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Idea</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Campus</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Submitted</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-neutral-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {submissions.map((submission) => (
              <tr key={submission.id} className="hover:bg-neutral-800/20 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{submission.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">
                  {submission.email}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-neutral-300 max-w-xs truncate">
                    {submission.idea}
                  </div>
                  {submission.status === 'accepted' && submission.temporaryUserId && (
                    <div className="mt-1 text-xs text-neutral-400 space-y-1">
                      <div className="flex items-center gap-1">
                        <UserCircle className="h-3 w-3" />
                        <span>ID: {submission.temporaryUserId}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <KeyRound className="h-3 w-3" />
                        <span>Pass: {submission.temporaryPassword}</span>
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <CampusBadge status={submission.campusStatus} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge 
                    status={submission.status} 
                    showDate={submission.processedByAdminAt}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                  {formatDate(submission.submittedAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium pr-6">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
