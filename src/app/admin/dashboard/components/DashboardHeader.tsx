import { FileTextIcon, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  isLoading?: boolean;
  onRefresh?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function DashboardHeader({
  title,
  description,
  isLoading = false,
  onRefresh,
  className = '',
  children
}: DashboardHeaderProps) {
  return (
    <div className={`p-6 border-b border-neutral-800/50 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FileTextIcon className="mr-3 h-7 w-7 text-indigo-400" />
            {title}
          </h2>
          {description && (
            <p className="text-sm text-neutral-400 mt-1">
              {description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {children}
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm" 
              className="border-neutral-700 hover:bg-neutral-800/50 text-neutral-300 hover:text-white"
              onClick={onRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
