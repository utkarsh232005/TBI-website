import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Loader2, CheckCircle } from "lucide-react";

interface SubmissionActionsProps {
  submissionId: string;
  status: 'pending' | 'accepted' | 'rejected';
  processingAction?: {
    id: string;
    type: 'accept' | 'reject';
  } | null;
  onAccept: () => void;
  onReject: () => void;
  className?: string;
}

export function SubmissionActions({
  submissionId,
  status,
  processingAction,
  onAccept,
  onReject,
  className = ''
}: SubmissionActionsProps) {
  if (status !== 'pending') {
    return (
      <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
        <CheckCircle className="h-3.5 w-3.5 mr-2 text-green-500" />
        Processed
      </div>
    );
  }

  const isProcessing = processingAction?.id === submissionId;
  const isAccepting = isProcessing && processingAction.type === 'accept';
  const isRejecting = isProcessing && processingAction.type === 'reject';

  return (
    <div className={`flex items-center justify-end space-x-2 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onAccept}
        disabled={isProcessing}
        className={`inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-xl text-xs font-medium transition-all duration-200 border h-8 px-3 shadow-sm ${
          isAccepting
            ? 'bg-green-50 border-green-200 text-green-500 cursor-not-allowed opacity-80'
            : 'bg-white border-green-200 text-green-600 hover:bg-green-50 hover:shadow-md hover:border-green-300'
        }`}
      >
        {isAccepting ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
            Accepting...
          </>
        ) : (
          <>
            <ThumbsUp className="h-3.5 w-3.5 mr-1" />
            Accept
          </>
        )}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onReject}
        disabled={isProcessing}
        className={`inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-xl text-xs font-medium transition-all duration-200 border h-8 px-3 shadow-sm ${
          isRejecting
            ? 'bg-red-50 border-red-200 text-red-500 cursor-not-allowed opacity-80'
            : 'bg-white border-red-200 text-red-600 hover:bg-red-50 hover:shadow-md hover:border-red-300'
        }`}
      >
        {isRejecting ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
            Rejecting...
          </>
        ) : (
          <>
            <ThumbsDown className="h-3.5 w-3.5 mr-1" />
            Reject
          </>
        )}
      </Button>
    </div>
  );
}
