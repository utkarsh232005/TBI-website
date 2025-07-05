import React from "react";
import { X, AlertCircle, CheckCircle, Clock, CheckCheck, CircleX, AlertTriangle, Clock as CircleClock } from "lucide-react";

type StatusCardProps = {
  type: 'success' | 'warning' | 'error' | 'pending';
  title: string;
  value: string | number;
  description?: string;
  percentage?: string;
  className?: string;
};

export function StatusCard({ type, title, value, description, percentage = "+2.5%", className = "" }: StatusCardProps) {
  // Enhanced icon and colors based on type for more attractive and eye-catching design
  const iconProps = {
    success: {
      Icon: CheckCheck,
      iconClass: "bg-gradient-to-br from-green-50 to-green-200 text-green-600 border border-green-200 shadow-lg",
      textColor: "text-green-600",
      badgeClass: "bg-gradient-to-r from-green-100 to-emerald-200 text-green-700 border border-green-200/70",
      bgGradient: "bg-gradient-to-br from-white via-green-50/10 to-green-100/20",
      border: "border-green-200/60",
      shimmer: "from-green-100/20 via-white/60 to-green-100/20",
      glow: "after:bg-green-500/10",
      iconBg: "bg-[#EEFDF5]"
    },
    warning: {
      Icon: AlertTriangle,
      iconClass: "bg-gradient-to-br from-amber-50 to-amber-200 text-amber-600 border border-amber-200 shadow-lg",
      textColor: "text-amber-600",
      badgeClass: "bg-gradient-to-r from-amber-100 to-yellow-200 text-amber-700 border border-amber-200/70",
      bgGradient: "bg-gradient-to-br from-white via-amber-50/10 to-amber-100/20",
      border: "border-amber-200/60",
      shimmer: "from-amber-100/20 via-white/60 to-amber-100/20",
      glow: "after:bg-amber-500/10",
      iconBg: "bg-[#FFF9EB]"
    },
    error: {
      Icon: CircleX,
      iconClass: "bg-gradient-to-br from-red-50 to-red-200 text-red-600 border border-red-200 shadow-lg",
      textColor: "text-red-600",
      badgeClass: "bg-gradient-to-r from-red-100 to-rose-200 text-red-700 border border-red-200/70",
      bgGradient: "bg-gradient-to-br from-white via-red-50/10 to-red-100/20",
      border: "border-red-200/60",
      shimmer: "from-red-100/20 via-white/60 to-red-100/20",
      glow: "after:bg-red-500/10",
      iconBg: "bg-[#FEEFEE]"
    },
    pending: {
      Icon: CircleClock,
      iconClass: "bg-gradient-to-br from-blue-50 to-blue-200 text-blue-600 border border-blue-200 shadow-lg",
      textColor: "text-blue-600",
      badgeClass: "bg-gradient-to-r from-blue-100 to-indigo-200 text-blue-700 border border-blue-200/70",
      bgGradient: "bg-gradient-to-br from-white via-blue-50/10 to-blue-100/20",
      border: "border-blue-200/60",
      shimmer: "from-blue-100/20 via-white/60 to-blue-100/20",
      glow: "after:bg-blue-500/10",
      iconBg: "bg-[#F0F4FE]"
    },
  };

  const { Icon, iconClass, textColor, badgeClass, bgGradient, border, shimmer, glow } = iconProps[type];

  return (
    <div className={`bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 ${border} border overflow-hidden relative group ${className} after:absolute after:inset-0 after:rounded-xl after:opacity-0 after:transition-opacity after:duration-500 group-hover:after:opacity-100 ${glow} after:blur-xl after:-z-10`}>
      {/* Custom icon background matching the screenshot */}
      <div className={`absolute inset-0 ${iconProps[type].iconBg}`}></div>
      
      {/* Improved shimmer effect on hover */}
      <div className={`absolute inset-0 bg-gradient-to-r ${shimmer} bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>
      
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconClass.replace('rounded-xl', 'rounded-full').replace('shadow-lg', '')} group-hover:scale-105 transition-transform duration-300`}>
            <Icon className="h-6 w-6" />
          </div>
          {percentage && (
            <div className={`py-1 px-3 rounded-full text-xs font-medium ${badgeClass.replace('shadow-sm', '')} group-hover:shadow-sm transition-all duration-300 flex items-center`}>
              <span className={`inline-block w-1 h-1 rounded-full ${percentage.includes('-') ? 'bg-red-500' : percentage === '0%' ? 'bg-gray-400' : 'bg-green-500'} mr-1.5`}></span>
              {percentage}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium uppercase tracking-wider text-gray-500">{title}</h3>
          <p className={`text-3xl font-bold ${textColor}`}>
            {value}
          </p>
          {description && (
            <p className="text-sm font-medium text-gray-500 flex items-center">
              <span className="w-2 h-2 rounded-full mr-2 bg-current opacity-60"></span>
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
