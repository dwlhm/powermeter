import { type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: number;
  className?: string;
}

export const Spinner = ({ size = 20, className = '' }: SpinnerProps) => (
  <Loader2 className={`animate-spin ${className}`} size={size} />
);

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay = ({ message = 'Loading…' }: LoadingOverlayProps) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
    <Spinner size={28} />
    <p className="text-sm">{message}</p>
  </div>
);

export const PageLoader = () => (
  <div className="flex items-center justify-center h-full py-24">
    <Spinner size={32} className="text-brand-500" />
  </div>
);
