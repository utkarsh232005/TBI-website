import React from "react";
import { X, AlertCircle, CheckCircle, Clock } from "lucide-react";

type StatusCardProps = {
  type: 'success' | 'warning' | 'error' | 'pending';
  title: string;
  value: string | number;
  description?: string;
  percentage?: string;
  className?: string;
};

export function StatusCard({ type, title, value, description, percentage = "+2.5%", className = "" }: StatusCardProps) {
  // Get the correct icon and colors based on type
  const iconProps = {
    success: {
      Icon: CheckCircle,
      iconClass: "admin-icon-green",
      textColor: "text-green-600",
      badgeClass: "admin-badge-success",
    },
    warning: {
      Icon: AlertCircle,
      iconClass: "admin-icon-amber",
      textColor: "text-amber-600",
      badgeClass: "admin-badge-warning",
    },
    error: {
      Icon: X,
      iconClass: "admin-icon-red",
      textColor: "text-red-600",
      badgeClass: "admin-badge-error",
    },
    pending: {
      Icon: Clock,
      iconClass: "admin-icon-blue",
      textColor: "text-blue-600",
      badgeClass: "admin-badge-info",
    },
  };

  const { Icon, iconClass, textColor, badgeClass } = iconProps[type];

  return (
    <div className={`admin-card group cursor-pointer admin-float ${className}`}>
      {/* Shimmer effect on hover */}
      <div className="admin-shimmer absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"></div>
      
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`admin-icon ${iconClass}`}>
            <Icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
          </div>
          {percentage && (
            <div className={`admin-badge ${badgeClass}`}>
              {percentage}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">{title}</h3>
          <p className={`text-2xl font-bold transition-all duration-300 group-hover:scale-105 ${textColor}`}>
            {value}
          </p>
          {description && (
            <p className="text-xs font-medium text-muted-foreground flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5"></span>
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
