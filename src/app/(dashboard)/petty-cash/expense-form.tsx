"use client";

import { useState } from "react";
import { createExpense } from "@/server/actions/expense";
import { useToast } from "@/components/toast-provider";
import { SubmitButton } from "@/components/submit-button";
import { Receipt } from "lucide-react";

export function PettyCashExpenseForm({ 
  pettyCashAccounts, 
  categories, 
  heads, 
  subHeads 
}: { 
  pettyCashAccounts: any[]; 
  categories: any[]; 
  heads: any[]; 
  subHeads: any[]; 
}) {
  const { showToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("");

  const filteredHeads = selectedCategory
    ? heads.filter((h: any) => h.categoryId === selectedCategory)
    : heads;

  async function handleSubmit(formData: FormData) {
    const res = await createExpense(formData);
    if (res?.success) {
      showToast("Expense added successfully!");
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm h-full">
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Title / Description</label>
          <input name="title" placeholder="e.g., Office Tea/Coffee" required className="input-premium" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Amount (৳)</label>
            <input name="amount" type="number" step="0.01" placeholder="Amount" required className="input-premium" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Select Petty Cash</label>
            <select name="paymentAccountId" required className="input-premium cursor-pointer">
              <option value="">Select Account</option>
              {pettyCashAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
            <select name="categoryId" required onChange={(e) => setSelectedCategory(e.target.value)} className="input-premium cursor-pointer">
              <option value="">Select Category</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Head (Optional)</label>
            <select name="headId" className="input-premium cursor-pointer">
              <option value="">Select Head</option>
              {filteredHeads.map((h: any) => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Sub-Head (Optional)</label>
            <select name="subHeadId" className="input-premium cursor-pointer">
              <option value="">Select Sub-Head</option>
              {subHeads.map((sh: any) => <option key={sh.id} value={sh.id}>{sh.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Invoice No (Optional)</label>
            <input name="invoiceNo" placeholder="Invoice No" className="input-premium" />
          </div>
        </div>

        <div className="pt-2">
          {/* ✅ Add Client-এর মতো নীল গ্রেডিয়েন্ট */}
          <SubmitButton className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-xl px-5 py-2.5 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2">
            <Receipt size={18} /> Add Expense
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}