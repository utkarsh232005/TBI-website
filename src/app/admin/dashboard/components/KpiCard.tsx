import { ReactNode } from 'react';

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  description?: string;
  colorClass?: string;
  className?: string;
}

export function KpiCard({ 
  title, 
  value, 
  icon,
  description, 
  colorClass = "text-indigo-400",
  className = ''
}: KpiCardProps) {
  return (
    <div className={`group p-6 bg-neutral-900 rounded-2xl border border-neutral-800 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5 ${className}`}>
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-xl bg-neutral-800 border border-neutral-700/50 group-hover:border-indigo-500/30 transition-colors`}>
          <div className={colorClass}>
            {icon}
          </div>
        </div>
      </div>
      <div className="mt-6">
        <h3 className="text-sm font-medium text-neutral-400">{title}</h3>
        <p className="mt-2 text-3xl font-bold text-white">{value}</p>
        {description && (
          <p className="mt-2 text-sm text-neutral-400">{description}</p>
        )}
      </div>
    </div>
  );
}
