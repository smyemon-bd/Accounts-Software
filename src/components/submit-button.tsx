"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { forwardRef } from "react";

export const SubmitButton = forwardRef<HTMLButtonElement, { 
  children: React.ReactNode; 
  className?: string; 
}>(({ children, className = "w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-xl px-5 py-2.5 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30" }, ref) => {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending}
      ref={ref}
      className={`${className} flex items-center justify-center gap-2 transition-all`}
    >
      {pending ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
});

SubmitButton.displayName = "SubmitButton";