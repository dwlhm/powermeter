import { type ReactNode } from 'react';

type Variant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const variants: Record<Variant, string> = {
  success: 'bg-success-500/10 text-success-600 dark:text-success-500',
  warning: 'bg-warning-500/10 text-warning-600 dark:text-warning-500',
  danger: 'bg-danger-500/10 text-danger-600 dark:text-danger-500',
  info: 'bg-brand-500/10 text-brand-600 dark:text-brand-400',
  neutral: 'bg-slate-200/70 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300',
};

interface BadgeProps {
  variant?: Variant;
  children: ReactNode;
  dot?: boolean;
}

export const Badge = ({ variant = 'neutral', children, dot = false }: BadgeProps) => (
  <span className={`badge ${variants[variant]}`}>
    {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
    {children}
  </span>
);
