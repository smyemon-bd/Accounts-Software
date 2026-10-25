"use client";

import { refillPettyCash } from "@/server/actions/petty-cash";
import { useToast } from "@/components/toast-provider";
import { ArrowRightLeft } from "lucide-react";
import { SubmitButton } from "@/components/submit-button";

export function PettyCashForm({ mainAccounts, pettyCashAccounts }: { mainAccounts: any[], pettyCashAccounts: any[] }) {
  const { showToast } = useToast();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm h-full">
      <form action={async (formData) => {
        const res = await refillPettyCash(formData);
        if (res.success) {
          showToast("Petty cash refilled successfully!");
        } else {
          showToast(res.error || "Failed to refill");
        }
      }} className="space-y-4">
        
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">From Account (Source)</label>
          <select name="fromAccountId" required className="input-premium cursor-pointer">
            <option value="">Select Main Account</option>
            {mainAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">To Petty Cash</label>
          <select name="pettyCashAccountId" required className="input-premium cursor-pointer">
            <option value="">Select Petty Cash</option>
            {pettyCashAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Amount (৳)</label>
          <input name="amount" type="number" step="0.01" required className="input-premium" placeholder="e.g., 5000" />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Note</label>
          <input name="note" required className="input-premium" placeholder="Refill for October" />
        </div>

        <div className="pt-2">
          {/* ✅ Add Client-এর মতো নীল গ্রেডিয়েন্ট */}
          <SubmitButton className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-xl px-5 py-2.5 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2">
            <ArrowRightLeft size={18} /> Transfer Funds
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}