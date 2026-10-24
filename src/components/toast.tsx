"use client";

import { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";

export function Toast({ message, onClose }: { message: string, onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    // w-full h-full এর সাথে pl-64 বা ml-64 দিলে সাইডবারের জায়গা বাদ দিয়ে মাঝখানে আসবে
    <div className="fixed inset-0 z-[100] flex items-center justify-center md:pl-64 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-3 bg-white dark:bg-slate-900 border border-green-200 dark:border-green-900/50 shadow-2xl px-6 py-4 rounded-xl animate-toast">
        <CheckCircle2 className="text-green-600 dark:text-green-400" size={24} />
        <p className="text-base font-semibold text-slate-800 dark:text-white">{message}</p>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-2">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}