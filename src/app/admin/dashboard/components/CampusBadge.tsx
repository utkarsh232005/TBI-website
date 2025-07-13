import { Landmark, Building, FileTextIcon } from "lucide-react";

const campusConfig = {
  campus: { 
    icon: Landmark, 
    bg: 'bg-blue-50', 
    text: 'text-blue-700',
    border: 'border-blue-200'
  },
  'off-campus': { 
    icon: Building, 
    bg: 'bg-purple-50', 
    text: 'text-purple-700',
    border: 'border-purple-200'
  },
  default: { 
    icon: FileTextIcon, 
    bg: 'bg-gray-50', 
    text: 'text-gray-700',
    border: 'border-gray-200'
  }
} as const;

type CampusStatus = 'campus' | 'off-campus' | undefined;

interface CampusBadgeProps {
  status?: CampusStatus;
  className?: string;
}

export function CampusBadge({ status, className = '' }: CampusBadgeProps) {
  const config = status ? campusConfig[status] : campusConfig.default;
  const { icon: Icon, bg, text, border } = config;
  const label = status ? (status === 'campus' ? 'Campus' : 'Off-Campus') : 'N/A';

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${bg} ${text} border ${border} ${className}`}>
      <Icon className="h-3.5 w-3.5 mr-2" />
      {label}
    </span>
  );
}
