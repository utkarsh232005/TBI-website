import { Landmark, Building, FileTextIcon } from "lucide-react";

const campusConfig = {
  campus: { icon: Landmark, bg: 'bg-blue-500/10', text: 'text-blue-400' },
  'off-campus': { icon: Building, bg: 'bg-purple-500/10', text: 'text-purple-400' },
  default: { icon: FileTextIcon, bg: 'bg-neutral-700/10', text: 'text-neutral-400' }
} as const;

type CampusStatus = 'campus' | 'off-campus' | undefined;

interface CampusBadgeProps {
  status?: CampusStatus;
  className?: string;
}

export function CampusBadge({ status, className = '' }: CampusBadgeProps) {
  const config = status ? campusConfig[status] : campusConfig.default;
  const { icon: Icon, bg, text } = config;
  const label = status ? (status === 'campus' ? 'Campus' : 'Off-Campus') : 'N/A';

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text} ${className}`}>
      <Icon className="h-3 w-3 mr-1.5" />
      {label}
    </span>
  );
}
