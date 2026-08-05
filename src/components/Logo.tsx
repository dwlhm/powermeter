import { Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export const Logo = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const dim = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 26 : 22;
  return (
    <div className="flex items-center gap-2.5">
      <motion.div
        initial={{ rotate: -10, scale: 0.9 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className={`${dim} rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/30`}
      >
        <Zap size={iconSize} strokeWidth={2.5} />
      </motion.div>
      <div className="flex flex-col leading-tight">
        <span className="font-bold text-slate-800 dark:text-white text-lg tracking-tight">VoltIQ</span>
        <span className="text-[10px] text-slate-400 uppercase tracking-widest">EMS</span>
      </div>
    </div>
  );
};
