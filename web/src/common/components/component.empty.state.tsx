import React from "react";
import { FolderOpenIcon } from "@heroicons/react/24/outline";

export interface CompEmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const CompEmptyState = ({
  title = "Tidak Ada Data",
  description = "Belum ada data yang tersedia saat ini.",
  icon,
  action,
}: CompEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 shadow-sm w-full my-4">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 mb-4 text-slate-400 dark:text-slate-500">
        {icon || <FolderOpenIcon className="w-8 h-8" />}
      </div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};
