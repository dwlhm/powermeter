import { type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ErrorStateProps {
  title?: string;
  message?: string;
  action?: ReactNode;
}

export const ErrorState = ({ title = 'Something went wrong', message = 'Please try again.', action }: ErrorStateProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center gap-3 py-16 text-center"
  >
    <div className="w-14 h-14 rounded-2xl bg-danger-500/10 flex items-center justify-center text-danger-500">
      <AlertTriangle size={26} />
    </div>
    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
    <p className="text-sm text-slate-500 max-w-sm">{message}</p>
    {action}
  </motion.div>
);
