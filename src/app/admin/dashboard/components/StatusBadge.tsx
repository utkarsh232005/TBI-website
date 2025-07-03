import { CheckCircle, XCircle, Clock } from "lucide-react";

const statusConfig = {
  pending: { 
    icon: Clock, 
    bg: 'bg-gradient-to-r from-amber-50 to-yellow-50', 
    text: 'text-amber-600',
    border: 'border-amber-100/40'
  },
  accepted: { 
    icon: CheckCircle, 
    bg: 'bg-gradient-to-r from-green-50 to-emerald-50', 
    text: 'text-green-600',
    border: 'border-green-100/40'
  },
  rejected: { 
    icon: XCircle, 
    bg: 'bg-gradient-to-r from-red-50 to-rose-50', 
    text: 'text-red-600',
    border: 'border-red-100/40'
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
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text} border ${border} shadow-sm`}>
        <Icon className="h-3 w-3 mr-1.5" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
      {formattedDate && (
        <span className="text-xs text-gray-500">
          {formattedDate}
        </span>
      )}
    </div>
  );
}
