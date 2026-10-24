import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CreditCard, Wallet, Eye, MonitorSmartphone } from "lucide-react";

export default async function PaymentsPage() {
  // সার্ভিস অর্ডারের পেমেন্ট
  const servicePayments = await prisma.payment.findMany({
    where: { serviceOrderId: { not: null } },
    orderBy: { paidAt: "desc" },
    include: { 
      serviceOrder: { include: { client: true } }, 
      receivedBy: true,
      paymentAccount: true
    },
  });

  // নতুন কমন সেলের পেমেন্ট
  const salePayments = await prisma.payment.findMany({
    where: { saleId: { not: null } },
    orderBy: { paidAt: "desc" },
    include: { 
      sale: { include: { client: true } }, 
      receivedBy: true,
      paymentAccount: true
    },
  });

  const allPayments = [
    ...servicePayments.map(p => ({ ...p, type: "SERVICE" as const })),
    ...salePayments.map(p => ({ ...p, type: "SALE" as const })),
  ].sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());

  const totalCollected = allPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Payments</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">View all payment transactions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="bg-green-100 dark:bg-green-900/30 p-3.5 rounded-xl">
            <Wallet className="text-green-600 dark:text-green-400" size={24} />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Collected</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">৳ {totalCollected.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6 md:p-8 transition-colors">
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50">
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Reference</th>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Account</th>
                  <th>Received By</th>
                </tr>
              </thead>
              <tbody>
                {allPayments.map(p => (
                  <tr key={p.id}>
                    <td className="text-xs">{new Date(p.paidAt).toLocaleDateString()}</td>
                    <td>
                      {p.type === "SERVICE" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                          Service
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-xs font-semibold">
                          <MonitorSmartphone size={12} /> Sale
                        </span>
                      )}
                    </td>
                    <td className="text-xs font-mono">
                      {p.type === "SERVICE" ? p.serviceOrder?.orderNo : p.sale?.invoiceNo}
                    </td>
                    <td className="text-sm font-medium">
                      {p.type === "SERVICE" ? p.serviceOrder?.client.name : p.sale?.client.name}
                    </td>
                    <td className="font-bold text-green-600">৳ {Number(p.amount).toLocaleString()}</td>
                    <td>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                        <CreditCard size={12} /> {p.method}
                      </span>
                    </td>
                    <td className="text-xs">{p.paymentAccount?.name || "N/A"}</td>
                    <td className="text-xs">{p.receivedBy.name}</td>
                  </tr>
                ))}
                {allPayments.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                        <CreditCard size={40} className="mb-3 opacity-20" />
                        <p className="text-base font-medium">No payments found</p>
                      </div>
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