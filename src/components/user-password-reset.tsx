"use client";

import { useState } from "react";
import { resetUserPassword } from "@/server/actions/user";
import { useToast } from "@/components/toast-provider";
import { KeyRound, X } from "lucide-react";

export function UserPasswordReset({ userId, userName }: { userId: string, userName: string }) {
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
      >
        Reset Pass
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
        <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Reset Password</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Set a new password for <strong>{userName}</strong>.</p>

        <form action={async (formData) => {
          try {
            await resetUserPassword(formData);
            showToast("Password reset successfully!");
            setIsOpen(false);
          } catch (error: any) {
            showToast(error.message || "Failed to reset password");
          }
        }} className="space-y-4">
          <input type="hidden" name="id" value={userId} />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
            <input 
              name="newPassword" 
              type="text" 
              required 
              placeholder="Enter new password" 
              className="input-premium" 
            />
          </div>
          <button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2">
            <KeyRound size={16} /> Update Password
          </button>
        </form>
      </div>
    </div>
  );
}