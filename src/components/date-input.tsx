"use client";

import { useRef } from "react";
import { Calendar } from "lucide-react";

export function DateInput({ name, defaultValue }: { name: string, defaultValue?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (inputRef.current) {
      try {
        inputRef.current.showPicker();
      } catch (error) {
        console.log("showPicker not supported");
      }
    }
  };

  return (
    // এখানে relative z-50 যোগ করা হয়েছে যাতে ক্যালেন্ডার সবার উপরে থাকে
    <div className="relative z-50">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
        <Calendar className="h-4 w-4 text-slate-400" />
      </div>
      <input
        ref={inputRef}
        type="date"
        name={name}
        defaultValue={defaultValue}
        onClick={handleClick}
        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 py-2.5 text-sm text-slate-800 dark:text-white outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 cursor-pointer"
        style={{ paddingLeft: '2.75rem' }}
      />
    </div>
  );
}