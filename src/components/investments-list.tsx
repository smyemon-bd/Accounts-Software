"use client";

import { createInvestment } from "@/server/actions/finance";
import { useToast } from "@/components/toast-provider";
import Link from "next/link";
import { TrendingUp, Plus, FileText, User } from "lucide-react";

export function InvestmentsList({ 
  investments, 
  investors, 
  paymentAccounts 
}: { 
  investments: any[], 
  investors: any[], 
  paymentAccounts: any[] 
}) {
  const { showToast } = useToast();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-xl">
            <Plus className="text-blue-600 dark:text-blue-400" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Add New Investment</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Record a new investment.</p>
          </div>
        </div>
        
        <form action={async (formData) => {
          await createInvestment(formData);
          showToast("Investment added!");
        }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Investor Select Dropdown */}
          <select name="investorId" required className="input-premium cursor-pointer appearance-none">
            <option value="">Select Investor</option>
            {investors?.map((inv: any) => (
              <option key={inv.id} value={inv.id} className="dark:bg-slate-900">
                {inv.name} {inv.phone ? `(${inv.phone})` : ""}
              </option>
            ))}
          </select>
          
          <input name="amount" type="number" step="0.01" placeholder="Amount (৳)" required className="input-premium" />
          
          <select name="paymentAccountId" className="input-premium cursor-pointer appearance-none">
            <option value="">Select Account (Optional)</option>
            {paymentAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>)}
          </select>
          
          <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-xl px-5 py-2.5 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 md:col-span-3">
            Add Investment
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="font-semibold mb-4 text-slate-800 dark:text-white">Investment History</h2>
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="table-premium">
            <thead>
              <tr>
                <th>Date</th>
                <th>Investor</th>
                <th className="text-right">Amount</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {investments.map(inv => (
                <tr key={inv.id}>
                  <td className="text-xs">
                    {new Date(inv.investedAt).toLocaleDateString()}
                  </td>
                  <td className="font-medium">
                    {/* ইনভেস্টরের নামের সাথে লিংক */}
                    <Link 
                      href={`/investments/investors/${inv.investorId}`} 
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
                    >
                      <User size={14} />
                      {inv.investor.name}
                    </Link>
                  </td>
                  <td className="text-right font-bold text-blue-600">
                    ৳ {inv.amount.toLocaleString()}
                  </td>
                  <td className="text-right">
                    <Link 
                      href={`/investments/${inv.id}/receipt`} 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                    >
                      <FileText size={14} /> Receipt
                    </Link>
                  </td>
                </tr>
              ))}
              {investments.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-500">
                    No investments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}