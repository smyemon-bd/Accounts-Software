"use client";

import { setBudget } from "@/server/actions/budget";
import { useToast } from "@/components/toast-provider";
import { SubmitButton } from "@/components/submit-button";
import { Target } from "lucide-react";

export function BudgetForm({ categories, month, year }: { categories: any[], month: number, year: number }) {
  const { showToast } = useToast();

  async function handleSubmit(formData: FormData) {
    await setBudget(formData);
    showToast("Budget saved successfully!");
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm sticky top-24">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
          <Target size={20} />
        </div>
        <div>
          <h2 className="font-bold text-slate-800 dark:text-white">Set Budget</h2>
          <p className="text-xs text-slate-500">Assign a limit for a category.</p>
        </div>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <input type="hidden" name="month" value={month} />
        <input type="hidden" name="year" value={year} />
        
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Expense Category</label>
          <select name="categoryId" required className="input-premium cursor-pointer">
            <option value="">Select Category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Budget Amount (৳)</label>
          <input name="amount" type="number" step="0.01" placeholder="e.g., 10000" required className="input-premium" />
        </div>

        <div className="pt-2">
          <SubmitButton className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-xl px-5 py-2.5 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30">
            Save Budget
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}