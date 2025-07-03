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
  colorClass = "text-blue-600",
  className = ''
}: KpiCardProps) {
  return (
    <div className={`admin-card group cursor-pointer admin-float ${className}`}>
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`admin-icon admin-icon-${colorClass.includes('indigo') ? 'blue' : 
                          colorClass.includes('green') || colorClass.includes('emerald') ? 'green' : 
                          colorClass.includes('amber') || colorClass.includes('yellow') ? 'amber' : 
                          colorClass.includes('red') || colorClass.includes('rose') ? 'red' : 'blue'}`}>
            {icon}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">{title}</h3>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          {description && (
            <p className="mt-2 text-sm font-medium text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {/* Shimmer effect on hover */}
      <div className="admin-shimmer absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"></div>
    </div>
  );
}
