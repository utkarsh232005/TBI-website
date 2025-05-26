import { cn } from "@/lib/utils";
import { Check, Clock, X } from "lucide-react";
import { Badge } from "../ui/badge";
import { EventStatus } from "@/types/events";

interface StatusBadgeProps {
  status: EventStatus;
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const statusConfig = {
    pending: {
      label: 'Pending',
      className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      icon: <Clock className="h-3 w-3" />
    },
    approved: {
      label: 'Approved',
      className: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
      icon: <Check className="h-3 w-3" />
    },
    rejected: {
      label: 'Rejected',
      className: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      icon: <X className="h-3 w-3" />
    }
  };

  const { label, className: statusClassName, icon } = statusConfig[status] || statusConfig.pending;

  return (
    <Badge 
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        statusClassName,
        className
      )}
    >
      {icon}
      {label}
    </Badge>
  );
};
