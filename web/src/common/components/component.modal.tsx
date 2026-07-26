import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useRouter } from "@tanstack/react-router";
import { XMarkIcon } from "@heroicons/react/24/outline";

export interface CompModalProps {
  children: React.ReactNode;
  closeTo: string;
  closeParams?: Record<string, string>;
  title?: string;
  className?: string;
}

export const CompModal = ({
  children,
  closeTo,
  closeParams,
  title,
  className = "max-w-2xl",
}: CompModalProps) => {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        router.navigate({ to: closeTo, params: closeParams });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeTo, closeParams, router]);

  // Body scroll lock removed as per user request to allow scrolling while popup is open

  // Render via portal ke document.body agar popup selalu nempel ke viewport
  // (tidak terjebak containing block dari ancestor ber-backdrop-filter/transform)
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/* Backdrop */}
      <Link
        to={closeTo}
        params={closeParams}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        aria-label="Tutup dialog"
      />

      {/* Modal Content */}
      <div
        className={`relative w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-200 overflow-hidden ${className}`}
      >
        {/* Header (optional based on title) */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <h2 id="modal-title" className="text-xl font-semibold text-slate-800 dark:text-slate-100">
              {title}
            </h2>
          </div>
        )}

        {/* Close Button */}
        <Link
          to={closeTo}
          params={closeParams}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 z-10"
          aria-label="Tutup"
        >
          <XMarkIcon className="w-5 h-5" />
        </Link>

        {/* Content container with scrolling */}
        <div className="overflow-y-auto p-6 relative flex-grow">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
};
