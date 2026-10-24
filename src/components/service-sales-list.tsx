"use client";

import { useState } from "react";
import { createServiceOrder } from "@/server/actions/order";
import { DateInput } from "@/components/date-input";
import { FileText, Plus, CreditCard, User, Eye, Calendar, Landmark } from "lucide-react";
import Link from "next/link";

export function ServiceSalesList({ clients, services, orders }: { clients: any[], services: any[], orders: any[] }) {
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState("FULL");

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedServiceId = e.target.value;
    const service = services.find(s => s.id === selectedServiceId);
    if (service) setAmount(service.price.toString());
    else setAmount("");
  };

  return (
    <div className="space-y-6">
      {/* Create Order Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 md:p-8 transition-colors">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-xl">
            <Plus className="text-blue-600 dark:text-blue-400" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Create New Service Sale</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Sell a service to a client.</p>
          </div>
        </div>

        <form action={createServiceOrder} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
              <User className="h-4 w-4 text-slate-400" />
            </div>
            <select name="clientId" required className="input-premium pl-10 cursor-pointer appearance-none" style={{ paddingLeft: '2.75rem' }}>
              <option value="">Select Client</option>
              {clients.map(c => <option key={c.id} value={c.id} className="dark:bg-slate-900">{c.name}</option>)}
            </select>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
              <FileText className="h-4 w-4 text-slate-400" />
            </div>
            <select name="serviceId" required onChange={handleServiceChange} className="input-premium pl-10 cursor-pointer appearance-none" style={{ paddingLeft: '2.75rem' }}>
              <option value="">Select Service</option>
              {services.map(s => <option key={s.id} value={s.id} className="dark:bg-slate-900">{s.name} (৳{Number(s.price).toLocaleString()})</option>)}
            </select>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
              <span className="text-slate-400 font-semibold">৳</span>
            </div>
            <input name="totalAmount" type="number" step="0.01" placeholder="Total Amount" required value={amount} onChange={(e) => setAmount(e.target.value)} className="input-premium" style={{ paddingLeft: '2.5rem' }} />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
              <CreditCard className="h-4 w-4 text-slate-400" />
            </div>
            <select name="paymentType" value={paymentType} onChange={(e) => setPaymentType(e.target.value)} className="input-premium pl-10 cursor-pointer appearance-none" style={{ paddingLeft: '2.75rem' }}>
              <option value="FULL" className="dark:bg-slate-900">Full Payment</option>
              <option value="INSTALLMENT" className="dark:bg-slate-900">Installment</option>
            </select>
          </div>

          {paymentType === "INSTALLMENT" && (
            <div className="relative animate-in fade-in zoom-in-95 duration-200">
              <input name="installmentCount" type="number" min="1" placeholder="Installment Count" required className="input-premium" />
            </div>
          )}

          {paymentType === "INSTALLMENT" && (
            <div className="relative animate-in fade-in zoom-in-95 duration-200">
              <DateInput name="firstDueDate" />
            </div>
          )}

          <button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-xl px-5 py-2.5 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 md:col-span-3 mt-2">
            Create Order
          </button>
        </form>
      </div>

      {/* Orders List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm transition-colors">
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Order No</th>
                  <th>Client</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">{o.orderNo}</td>
                    <td className="font-medium text-slate-900 dark:text-slate-100">{o.client.name}</td>
                    <td className="text-slate-600 dark:text-slate-400">{o.service.name}</td>
                    <td>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        o.status === 'PAID' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                        o.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="text-right font-bold text-slate-800 dark:text-slate-200">৳ {Number(o.totalAmount).toLocaleString()}</td>
                    <td className="text-right">
                      <Link href={`/orders/${o.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors border border-blue-100">
                        <Eye size={14} /> View
                      </Link>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 dark:text-slate-500">
                      <FileText size={40} className="mx-auto mb-3 opacity-20" />
                      <p className="text-base font-medium">No service sales yet</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}