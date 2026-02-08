import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorDisplayProps {
  message: string;
  className?: string;
  onRetry?: () => void;
}

export function ErrorDisplay({ message, className, onRetry }: ErrorDisplayProps) {
  return (
    <div className={cn(
      'rounded-md bg-red-50 p-4 border border-red-200',
      className
    )}>
      <div className="flex items-center">
        <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
        <span className="text-sm text-red-800">{message}</span>
      </div>
      {onRetry && (
        <div className="mt-3">
          <button
            onClick={onRetry}
            className="text-sm font-medium text-red-700 hover:text-red-600"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}