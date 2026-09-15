import { motion } from 'framer-motion';

export const Logo = ({
  size = 'md',
  className = '',
  textClassName = 'text-slate-800 dark:text-white',
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  textClassName?: string;
}) => {
  const dim = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <motion.div
        initial={{ rotate: -10, scale: 0.9 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className={`${dim} flex items-center justify-center shrink-0 drop-shadow-sm`}
      >
        <img src="/logo.png" alt="SI-MOLIS" className="w-full h-full object-contain" />
      </motion.div>
      <div className="flex flex-col leading-tight">
        <span className={`font-bold text-lg tracking-tight ${textClassName}`}>SI-MOLIS</span>
        <span className="text-[10px] text-slate-400 uppercase tracking-widest">EMS</span>
      </div>
    </div>
  );
};
