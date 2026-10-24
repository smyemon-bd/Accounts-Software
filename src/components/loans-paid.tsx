"use client";

import { repayLoan } from "@/server/actions/finance";
import { useToast } from "@/components/toast-provider";
import { Wallet, Plus } from "lucide-react";

export function LoansPaid({ repayments, loans, paymentAccounts }: { repayments: any[], loans: any[], paymentAccounts: any[] }) {
  const { showToast } = useToast();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-xl">
            <Plus className="text-blue-600 dark:text-blue-400" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Record Loan Repayment</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Pay back a loan.</p>
          </div>
        </div>
        
        <form action={async (formData) => {
          await repayLoan(formData);
          showToast("Loan repayment recorded!");
        }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select name="loanId" required className="input-premium cursor-pointer">
            <option value="">Select Loan</option>
            {loans.map(l => <option key={l.id} value={l.id}>{l.lenderName} (৳{l.principal.toLocaleString()})</option>)}
          </select>
          <input name="amount" type="number" step="0.01" placeholder="Amount (৳)" required className="input-premium" />
          <select name="paymentAccountId" className="input-premium cursor-pointer">
            <option value="">Select Account (Optional)</option>
            {paymentAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>)}
          </select>
          <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-xl px-5 py-2.5 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 md:col-span-3">
            Record Payment
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="font-semibold mb-4 text-slate-800 dark:text-white">Repayment History</h2>
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="table-premium">
            <thead>
              <tr>
                <th>Date</th>
                <th>Lender</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {repayments.map(rep => (
                <tr key={rep.id}>
                  <td className="text-xs">{new Date(rep.paidAt).toLocaleDateString()}</td>
                  <td className="font-medium">{rep.loan.lenderName}</td>
                  <td className="text-right font-bold text-green-600">৳ {rep.amount.toLocaleString()}</td>
                </tr>
              ))}
              {repayments.length === 0 && (
                <tr><td colSpan={3} className="text-center py-8 text-slate-500">No repayments yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}