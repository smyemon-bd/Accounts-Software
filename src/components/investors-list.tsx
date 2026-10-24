"use client";

import { createInvestor } from "@/server/actions/finance";
import { useToast } from "@/components/toast-provider";
import { UserPlus, User } from "lucide-react";

export function InvestorsList({ investors }: { investors: any[] }) {
  const { showToast } = useToast();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-xl">
            <UserPlus className="text-blue-600 dark:text-blue-400" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Add New Investor</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Register a new investor.</p>
          </div>
        </div>
        
        <form action={async (formData) => {
          await createInvestor(formData);
          showToast("Investor added!");
        }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input name="name" placeholder="Full Name" required className="input-premium" />
          <input name="phone" placeholder="Phone Number" className="input-premium" />
          <input name="email" placeholder="Email" className="input-premium" />
          <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-xl px-5 py-2.5 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30">
            Add Investor
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="font-semibold mb-4 text-slate-800 dark:text-white">Investor List</h2>
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="table-premium">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {investors.map(i => (
                <tr key={i.id}>
                  <td className="font-medium">{i.name}</td>
                  <td>{i.phone || "N/A"}</td>
                  <td>{i.email || "N/A"}</td>
                  <td className="text-xs">{new Date(i.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {investors.length === 0 && (
                <tr><td colSpan={4} className="text-center py-8 text-slate-500">No investors yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}