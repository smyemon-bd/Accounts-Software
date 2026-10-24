"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";

export function SearchBar({ placeholder = "Search..." }: { placeholder?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  // Debounce logic (টাইপ করা থামানোর ৩০০ মিলি-সেকেন্ড পর সার্চ হবে)
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q"); // যদি খালি করে দেয়, তবে q প্যারামিটার মুছে যাবে
      }
      
      router.push(`?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, router, searchParams]);

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-slate-400" />
      </div>
      
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        style={{ paddingLeft: '2.75rem', paddingRight: '2.5rem' }}
      />
      
      {/* যদি কিছু লেখা থাকে, তবে Clear (X) বাটন দেখাবে */}
      {query && (
        <button
          onClick={() => setQuery("")}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-red-500 transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}