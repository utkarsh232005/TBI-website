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
      <div className="flex items-center text-xs text-neutral-500">
        <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
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
        className={`h-8 px-3 text-xs font-medium rounded-md ${
          isAccepting
            ? 'bg-teal-500/20 border-teal-500/30 text-teal-300 cursor-not-allowed'
            : 'bg-teal-500/10 border-teal-500/20 text-teal-400 hover:bg-teal-500/20'
        }`}
      >
        {isAccepting ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            Accepting...
          </>
        ) : (
          <>
            <ThumbsUp className="h-3.5 w-3.5 mr-1.5" />
            Accept
          </>
        )}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onReject}
        disabled={isProcessing}
        className={`h-8 px-3 text-xs font-medium rounded-md ${
          isRejecting
            ? 'bg-rose-500/20 border-rose-500/30 text-rose-300 cursor-not-allowed'
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20'
        }`}
      >
        {isRejecting ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            Rejecting...
          </>
        ) : (
          <>
            <ThumbsDown className="h-3.5 w-3.5 mr-1.5" />
            Reject
          </>
        )}
      </Button>
    </div>
  );
}
