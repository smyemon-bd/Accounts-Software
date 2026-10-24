"use client";

import { createShareHolder, allocateShares } from "@/server/actions/dividend";
import { useToast } from "@/components/toast-provider";
import { UserPlus, Share2 } from "lucide-react";

export function ShareHoldersList({ holders }: { holders: any[] }) {
  const { showToast } = useToast();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-xl">
            <UserPlus className="text-blue-600 dark:text-blue-400" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Add New Share Holder</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Register a new shareholder.</p>
          </div>
        </div>
        
        <form action={async (formData) => {
          await createShareHolder(formData);
          showToast("Share Holder added!");
        }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input name="name" placeholder="Full Name" required className="input-premium" />
          <input name="phone" placeholder="Phone" className="input-premium" />
          <input name="email" placeholder="Email" className="input-premium" />
          <input name="totalShares" type="number" placeholder="Initial Shares" className="input-premium" />
          <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-xl px-5 py-2.5 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 md:col-span-4">
            Add Share Holder
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="font-semibold mb-4 text-slate-800 dark:text-white">Share Holders List</h2>
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="table-premium">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th className="text-right">Total Shares</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {holders.map(h => (
                <tr key={h.id}>
                  <td className="font-medium">{h.name}</td>
                  <td>{h.phone || "N/A"}</td>
                  <td>{h.email || "N/A"}</td>
                  <td className="text-right font-bold">{h.totalShares}</td>
                  <td className="text-right">
                    <form action={async (formData) => {
                      await allocateShares(formData);
                      showToast("Shares allocated!");
                    }} className="flex gap-2 justify-end">
                      <input type="hidden" name="shareHolderId" value={h.id} />
                      <input name="shares" type="number" placeholder="Qty" className="w-20 input-premium text-xs py-1 px-2" required />
                      <input name="pricePerShare" type="number" step="0.01" placeholder="Price" className="w-24 input-premium text-xs py-1 px-2" required />
                      <button className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-semibold hover:bg-blue-100">
                        Allocate
                      </button>
                    </form>
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