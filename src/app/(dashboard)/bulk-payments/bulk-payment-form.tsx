"use client";

import { useState } from "react";
import { createBulkPayments } from "@/server/actions/bulk-payment";
import { useToast } from "@/components/toast-provider";
import { SubmitButton } from "@/components/submit-button";
import { Plus, Trash2, Save } from "lucide-react";
import { useRouter } from "next/navigation";

export function BulkPaymentForm({ clients, paymentAccounts }: { clients: any[], paymentAccounts: any[] }) {
  const { showToast } = useToast();
  const router = useRouter();
  const [rows, setRows] = useState([{ id: Date.now(), clientId: "", amount: "", paymentAccountId: "", reference: "", notes: "" }]);

  const addRow = () => {
    setRows([...rows, { id: Date.now(), clientId: "", amount: "", paymentAccountId: "", reference: "", notes: "" }]);
  };

  const removeRow = (id: number) => {
    if (rows.length === 1) return;
    setRows(rows.filter(r => r.id !== id));
  };

  const updateRow = (id: number, field: string, value: string) => {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  async function handleSubmit(formData: FormData) {
    // ফর্ম ডেটা তৈরি করা (row গুলোকে স্ট্রিং হিসেবে জোড়া দেওয়া)
    const recordsData = rows.map(r => 
      `${r.clientId}|${r.amount}|${r.paymentAccountId}|${r.reference}|${r.notes}`
    );
    
    formData.delete("records");
    recordsData.forEach(data => formData.append("records", data));

    const res = await createBulkPayments(formData);
    if (res.success) {
      showToast("Bulk payments recorded successfully!");
      setRows([{ id: Date.now(), clientId: "", amount: "", paymentAccountId: "", reference: "", notes: "" }]); // রিসেট
      router.refresh();
    } else {
      showToast(res.error || "Failed to save payments");
    }
  }

  return (
    <form action={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Payment Date</label>
            <input 
              type="date" 
              name="date" 
              defaultValue={new Date().toISOString().split("T")[0]} 
              className="input-premium py-2" 
              required 
            />
          </div>
        </div>
        <button 
          type="button" 
          onClick={addRow}
          className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Add Another Row
        </button>
      </div>

      {/* Table Rows */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 font-bold w-1/4">Client</th>
              <th className="p-4 font-bold w-32">Amount (৳)</th>
              <th className="p-4 font-bold w-48">Payment Account</th>
              <th className="p-4 font-bold">Reference / Notes</th>
              <th className="p-4 font-bold w-16 text-center"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/20">
                <td className="p-3">
                  <select 
                    value={row.clientId} 
                    onChange={(e) => updateRow(row.id, "clientId", e.target.value)} 
                    required 
                    className="input-premium py-2 text-sm w-full cursor-pointer"
                  >
                    <option value="">Select Client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ""}</option>)}
                  </select>
                </td>
                <td className="p-3">
                  <input 
                    type="number" 
                    step="0.01"
                    value={row.amount} 
                    onChange={(e) => updateRow(row.id, "amount", e.target.value)} 
                    required
                    placeholder="0.00"
                    className="input-premium py-2 text-sm w-full font-mono" 
                  />
                </td>
                <td className="p-3">
                  <select 
                    value={row.paymentAccountId} 
                    onChange={(e) => updateRow(row.id, "paymentAccountId", e.target.value)} 
                    className="input-premium py-2 text-sm w-full cursor-pointer"
                  >
                    <option value="">Default Cash</option>
                    {paymentAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                  </select>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={row.reference} 
                      onChange={(e) => updateRow(row.id, "reference", e.target.value)} 
                      placeholder="Ref (Optional)"
                      className="input-premium py-2 text-sm w-full" 
                    />
                  </div>
                </td>
                <td className="p-3 text-center">
                  <button 
                    type="button"
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length === 1}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end">
        <SubmitButton className="w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-xl px-8 py-3 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2">
          <Save size={18} /> Save All Payments
        </SubmitButton>
      </div>
    </form>
  );
}