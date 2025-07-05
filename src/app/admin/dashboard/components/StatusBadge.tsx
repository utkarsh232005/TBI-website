import { CheckCircle, XCircle, Clock } from "lucide-react";

const statusConfig = {
  pending: { 
    icon: Clock, 
    bg: 'bg-yellow-50', 
    text: 'text-yellow-700',
    border: 'border-yellow-200'
  },
  accepted: { 
    icon: CheckCircle, 
    bg: 'bg-emerald-50', 
    text: 'text-emerald-700',
    border: 'border-emerald-200'
  },
  rejected: { 
    icon: XCircle, 
    bg: 'bg-rose-50', 
    text: 'text-rose-700',
    border: 'border-rose-200'
  }
} as const;

type Status = keyof typeof statusConfig;

interface StatusBadgeProps {
  status: Status;
  showDate?: Date | string | null;
  className?: string;
}

export function StatusBadge({ status, showDate, className = '' }: StatusBadgeProps) {
  const { icon: Icon, bg, text, border } = statusConfig[status];
  const formattedDate = showDate ? new Date(showDate).toLocaleDateString() : null;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${bg} ${text} border ${border}`}>
        <Icon className="h-3.5 w-3.5 mr-2" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
      {formattedDate && (
        <span className="text-xs text-gray-400">
          {formattedDate}
        </span>
      )}
    </div>
  );
}
