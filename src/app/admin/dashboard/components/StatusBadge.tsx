import { CheckCircle, XCircle, Clock } from "lucide-react";

const statusConfig = {
  pending: { icon: Clock, bg: 'bg-amber-500/10', text: 'text-amber-400' },
  accepted: { icon: CheckCircle, bg: 'bg-teal-500/10', text: 'text-teal-400' },
  rejected: { icon: XCircle, bg: 'bg-rose-500/10', text: 'text-rose-400' }
} as const;

type Status = keyof typeof statusConfig;

interface StatusBadgeProps {
  status: Status;
  showDate?: Date | string | null;
  className?: string;
}

export function StatusBadge({ status, showDate, className = '' }: StatusBadgeProps) {
  const { icon: Icon, bg, text } = statusConfig[status];
  const formattedDate = showDate ? new Date(showDate).toLocaleDateString() : null;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
        <Icon className="h-3 w-3 mr-1.5" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
      {formattedDate && (
        <span className="text-xs text-neutral-500">
          {formattedDate}
        </span>
      )}
    </div>
  );
}
