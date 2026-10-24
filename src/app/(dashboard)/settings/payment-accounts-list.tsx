"use client";

import { createPaymentAccount, togglePaymentAccount, deletePaymentAccount } from "@/server/actions/payment-account";
import { useToast } from "@/components/toast-provider";
import { Landmark, Smartphone, QrCode, Plus, Trash2, Eye, EyeOff } from "lucide-react";

export function PaymentAccountsList({ accounts }: { accounts: any[] }) {
  const { showToast } = useToast();

  const getIcon = (type: string) => {
    if (type === "BANK") return <Landmark size={16} />;
    if (type === "MFS") return <Smartphone size={16} />;
    return <QrCode size={16} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2.5 rounded-xl">
          <Landmark className="text-indigo-600 dark:text-indigo-400" size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Payment Methods</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your bank accounts, mobile banking, and QR codes.</p>
        </div>
      </div>

      {/* Add Account Form */}
      <form action={async (formData) => {
        await createPaymentAccount(formData);
        showToast("Payment account added!");
      }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input name="name" placeholder="Account Name (e.g., City Bank)" required className="input-premium" />
        <select name="type" required className="input-premium cursor-pointer">
          <option value="BANK">Bank Account</option>
          <option value="MFS">Mobile Banking (bKash/Nagad)</option>
          <option value="QR">Bangla QR</option>
        </select>
        <input name="accountNo" placeholder="Account Number" className="input-premium" />
        <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-xl px-5 py-2.5 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2">
          <Plus size={16} /> Add Account
        </button>
      </form>

      {/* Accounts List */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50">
        <div className="overflow-x-auto">
          <table className="table-premium">
            <thead>
              <tr>
                <th>Account Name</th>
                <th>Type</th>
                <th>Account No</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(acc => (
                <tr key={acc.id}>
                  <td className="font-medium text-slate-900 dark:text-slate-100">{acc.name}</td>
                  <td>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                      {getIcon(acc.type)} {acc.type}
                    </span>
                  </td>
                  <td className="text-slate-600 dark:text-slate-400">{acc.accountNo || "N/A"}</td>
                  <td>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${
                      acc.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {acc.isActive ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={async () => { await togglePaymentAccount(acc.id, acc.isActive); showToast("Status updated!"); }} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        {acc.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button onClick={async () => {
                        if (confirm("Delete this account?")) {
                          const res = await deletePaymentAccount(acc.id);
                          if (res.success) showToast("Deleted!"); else showToast(res.error || "Failed");
                        }
                      }} className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {accounts.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                      <Landmark size={40} className="mb-3 opacity-20" />
                      <p className="text-base font-medium">No payment accounts yet</p>
                      <p className="text-sm mt-1">Add your first bank account or mobile banking.</p>
                    </div>
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