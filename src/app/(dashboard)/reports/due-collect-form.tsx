"use client";

import { recordPayment } from "@/server/actions/payment";
import { useToast } from "@/components/toast-provider";
import { CreditCard } from "lucide-react";
import { useState } from "react";

export function DueCollectForm({ 
  installmentId, 
  orderId, 
  amount,
  paymentAccounts 
}: { 
  installmentId: string; 
  orderId: string; 
  amount: number;
  paymentAccounts: any[];
}) {
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg text-xs font-semibold transition-colors border border-green-100 dark:border-green-800/50"
      >
        <CreditCard size={14} /> Collect
      </button>
    );
  }

  return (
    <form action={async (formData) => {
      await recordPayment(formData);
      showToast("Payment collected successfully!");
      setIsOpen(false);
    }} className="flex items-center gap-2 justify-end">
      <input type="hidden" name="serviceOrderId" value={orderId} />
      <input type="hidden" name="amount" value={amount} />
      
      <select name="method" className="border rounded-lg px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white">
        <option value="CASH">Cash</option>
        <option value="BANK">Bank</option>
        <option value="MOBILE">Mobile</option>
      </select>
      
      <select name="paymentAccountId" className="border rounded-lg px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white">
        <option value="">Account (Optional)</option>
        {paymentAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
      </select>

      <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-green-700">
        Pay ৳{amount.toLocaleString()}
      </button>
      
      <button type="button" onClick={() => setIsOpen(false)} className="text-red-500 text-xs hover:underline">
        Cancel
      </button>
    </form>
  );
}