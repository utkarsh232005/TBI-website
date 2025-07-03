import { Landmark, Building, FileTextIcon } from "lucide-react";

const campusConfig = {
  campus: { 
    icon: Landmark, 
    bg: 'bg-gradient-to-r from-blue-50 to-indigo-50', 
    text: 'text-blue-600',
    border: 'border-blue-100/40'
  },
  'off-campus': { 
    icon: Building, 
    bg: 'bg-gradient-to-r from-purple-50 to-violet-50', 
    text: 'text-purple-600',
    border: 'border-purple-100/40'
  },
  default: { 
    icon: FileTextIcon, 
    bg: 'bg-gradient-to-r from-gray-50 to-slate-50', 
    text: 'text-gray-600',
    border: 'border-gray-100/40'
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
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text} border ${border} shadow-sm ${className}`}>
      <Icon className="h-3 w-3 mr-1.5" />
      {label}
    </span>
  );
}
