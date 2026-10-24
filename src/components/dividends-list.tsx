"use client";

import { declareDividend, payDividend } from "@/server/actions/dividend";
import { useToast } from "@/components/toast-provider";
import { FileText, Wallet, CheckCircle2, Clock } from "lucide-react";

export function DividendsList({ dividends, holders, paymentAccounts }: { dividends: any[], holders: any[], paymentAccounts: any[] }) {
  const { showToast } = useToast();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-xl">
            <FileText className="text-blue-600 dark:text-blue-400" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Declare Dividend</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Declare a new dividend for a shareholder.</p>
          </div>
        </div>
        
        <form action={async (formData) => {
          await declareDividend(formData);
          showToast("Dividend declared!");
        }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select name="shareHolderId" required className="input-premium cursor-pointer">
            <option value="">Select Share Holder</option>
            {holders.map(h => <option key={h.id} value={h.id}>{h.name} ({h.totalShares} shares)</option>)}
          </select>
          <input name="amount" type="number" step="0.01" placeholder="Dividend Amount (৳)" required className="input-premium" />
          <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-xl px-5 py-2.5 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30">
            Declare
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="font-semibold mb-4 text-slate-800 dark:text-white">Dividend History</h2>
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="table-premium">
            <thead>
              <tr>
                <th>Date</th>
                <th>Share Holder</th>
                <th className="text-right">Amount</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {dividends.map(d => (
                <tr key={d.id}>
                  <td className="text-xs">{new Date(d.declaredAt).toLocaleDateString()}</td>
                  <td className="font-medium">{d.shareHolder.name}</td>
                  <td className="text-right font-bold text-blue-600">৳ {d.amount.toLocaleString()}</td>
                  <td>
                    {d.status === "PAID" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        <CheckCircle2 size={12} /> Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                        <Clock size={12} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="text-right">
                    {d.status === "PENDING" && (
                      <form action={async (formData) => {
                        await payDividend(formData);
                        showToast("Dividend paid!");
                      }} className="flex gap-2 justify-end">
                        <input type="hidden" name="id" value={d.id} />
                        <select name="paymentAccountId" className="input-premium text-xs py-1 px-2 w-32">
                          <option value="">Select Account</option>
                          {paymentAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                        </select>
                        <button className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-xs font-semibold hover:bg-green-100">
                          Pay Now
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}