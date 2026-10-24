"use client";

import { useState } from "react";
import { createServiceOrder } from "@/server/actions/order";
import { DateInput } from "@/components/date-input";
import { FileText, Plus, CreditCard, User } from "lucide-react";

export function OrderForm({ clients, services }: { clients: any[], services: any[] }) {
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState("FULL");

  // সার্ভিস সিলেক্ট করলে অটোমেটিক প্রাইস বসে যাবে
  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedServiceId = e.target.value;
    const service = services.find(s => s.id === selectedServiceId);
    if (service) {
      setAmount(service.price.toString());
    } else {
      setAmount("");
    }
  };

  return (
    <form action={createServiceOrder} className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* ১. Client Select */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
          <User className="h-4 w-4 text-slate-400" />
        </div>
        <select name="clientId" required className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 py-2.5 text-sm text-slate-800 dark:text-white outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 cursor-pointer appearance-none" style={{ paddingLeft: '2.75rem' }}>
          <option value="">Select Client</option>
          {clients.map(c => <option key={c.id} value={c.id} className="dark:bg-slate-900">{c.name}</option>)}
        </select>
      </div>

      {/* ২. Service Select */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
          <FileText className="h-4 w-4 text-slate-400" />
        </div>
        <select 
          name="serviceId" 
          required 
          onChange={handleServiceChange}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 py-2.5 text-sm text-slate-800 dark:text-white outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 cursor-pointer appearance-none" 
          style={{ paddingLeft: '2.75rem' }}
        >
          <option value="">Select Service</option>
          {services.map(s => <option key={s.id} value={s.id} className="dark:bg-slate-900">{s.name} (৳{Number(s.price).toLocaleString()})</option>)}
        </select>
      </div>

      {/* ৩. Amount */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
          <span className="text-slate-400 font-semibold">৳</span>
        </div>
        <input 
          name="totalAmount" 
          type="number" 
          step="0.01" 
          placeholder="Total Amount" 
          required 
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          style={{ paddingLeft: '2.5rem' }}
        />
      </div>

      {/* ৪. Payment Type */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
          <CreditCard className="h-4 w-4 text-slate-400" />
        </div>
        <select 
          name="paymentType" 
          value={paymentType}
          onChange={(e) => setPaymentType(e.target.value)}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 py-2.5 text-sm text-slate-800 dark:text-white outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 cursor-pointer appearance-none" 
          style={{ paddingLeft: '2.75rem' }}
        >
          <option value="FULL" className="dark:bg-slate-900">Full Payment</option>
          <option value="INSTALLMENT" className="dark:bg-slate-900">Installment</option>
        </select>
      </div>

      {/* ৫. Installment Count (শুধু Installment সিলেক্ট করলে দেখাবে) */}
      {paymentType === "INSTALLMENT" && (
        <div className="relative">
          <input 
            name="installmentCount" 
            type="number" 
            min="1" 
            placeholder="Installment Count" 
            required
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" 
          />
        </div>
      )}

      {/* ৬. First Due Date (শুধু Installment সিলেক্ট করলে দেখাবে) */}
      {paymentType === "INSTALLMENT" && (
        <div className="relative">
          <DateInput name="firstDueDate" />
        </div>
      )}

      <button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-xl px-5 py-2.5 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 active:scale-[0.98] md:col-span-3 mt-2">
        Create Order
      </button>
    </form>
  );
}