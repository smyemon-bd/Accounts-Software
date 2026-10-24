"use client";

import { createLoan } from "@/server/actions/finance";
import { useToast } from "@/components/toast-provider";
import Link from "next/link";
import { Landmark, Plus, FileText } from "lucide-react";

export function LoansTaken({ loans, paymentAccounts }: { loans: any[], paymentAccounts: any[] }) {
  const { showToast } = useToast();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-xl">
            <Plus className="text-blue-600 dark:text-blue-400" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Add New Loan</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Record a new loan.</p>
          </div>
        </div>
        
        <form action={async (formData) => {
          await createLoan(formData);
          showToast("Loan added!");
        }} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <input name="lenderName" placeholder="Lender Name" required className="input-premium" />
          <input name="principal" type="number" step="0.01" placeholder="Principal (৳)" required className="input-premium" />
          <input name="interestRate" type="number" step="0.01" placeholder="Interest Rate (%)" required className="input-premium" />
          <input name="tenureMonths" type="number" placeholder="Tenure (Months)" required className="input-premium" />
          <select name="paymentAccountId" className="input-premium cursor-pointer">
            <option value="">Select Account (Optional)</option>
            {paymentAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>)}
          </select>
          <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-xl px-5 py-2.5 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30">
            Add Loan
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="font-semibold mb-4 text-slate-800 dark:text-white">Active Loans</h2>
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="table-premium">
            <thead>
              <tr>
                <th>Lender</th>
                <th className="text-right">Principal</th>
                <th className="text-right">Interest</th>
                <th className="text-right">Tenure</th>
                <th className="text-right">EMI</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loans.map(loan => (
                <tr key={loan.id}>
                  <td className="font-medium">{loan.lenderName}</td>
                  <td className="text-right">৳ {loan.principal.toLocaleString()}</td>
                  <td className="text-right">{loan.interestRate}%</td>
                  <td className="text-right">{loan.tenureMonths} Months</td>
                  <td className="text-right font-bold text-blue-600">৳ {loan.emiAmount.toLocaleString()}</td>
                  <td className="text-right">
                    <Link href={`/loans/${loan.id}/receipt`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-semibold">
                      <FileText size={14} /> Receipt
                    </Link>
                  </td>
                </tr>
              ))}
              {loans.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-slate-500">No loans yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}