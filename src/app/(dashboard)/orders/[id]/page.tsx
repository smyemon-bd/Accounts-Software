import { prisma } from "@/lib/prisma";
import { recordPayment } from "@/server/actions/payment";
import { notFound } from "next/navigation";
import { cancelOrder } from "@/server/actions/order";
import Link from "next/link";
import { Edit } from "lucide-react";

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const order = await prisma.serviceOrder.findUnique({
    where: { id: resolvedParams.id },
    include: {
      client: true, 
      service: true,
      installments: { orderBy: { dueDate: "asc" } },
      payments: { 
        orderBy: { paidAt: "desc" }, 
        include: { receivedBy: true, paymentAccount: true } 
      },
    },
  });

  // পেমেন্ট অ্যাকাউন্টগুলো লোড করা
  const paymentAccounts = await prisma.paymentAccount.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" }
  });

  if (!order) notFound();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Info */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">{order.orderNo} — {order.client.name}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{order.service.name} • {order.paymentType} • {order.status}</p>
        <p className="mt-3 text-2xl font-bold text-blue-600 dark:text-blue-400">৳ {Number(order.totalAmount).toLocaleString()}</p>
      </div>

      {/* Action Buttons (Invoice & Cancel) */}
      <div className="flex flex-wrap gap-4 items-center">
        <Link 
          href={`/orders/${order.id}/invoice`} 
          className="bg-blue-600 text-white text-sm px-5 py-2.5 rounded-xl hover:bg-blue-700 font-medium transition-colors shadow-sm"
        >
          View Invoice
        </Link>

        {order.status !== "CANCELLED" && (
          <form action={async () => {
            "use server";
            await cancelOrder(order.id);
          }}>
            <button className="text-red-600 text-sm font-medium hover:underline border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 px-5 py-2.5 rounded-xl transition-colors hover:bg-red-100 dark:hover:bg-red-900/40">
              Cancel this Order
            </button>
          </form>
        )}
      </div>

      {/* Record Payment Form */}
      <form action={recordPayment} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-5 gap-3 shadow-sm transition-colors">
        <input type="hidden" name="serviceOrderId" value={order.id} />
        
        <input name="amount" type="number" step="0.01" placeholder="Amount" required className="border rounded-xl px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
        
        <select name="method" className="border rounded-xl px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white cursor-pointer">
          <option value="CASH">Cash</option>
          <option value="BANK">Bank</option>
          <option value="MOBILE">Mobile</option>
        </select>

        <select name="paymentAccountId" className="border rounded-xl px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white cursor-pointer">
          <option value="">Select Account (Optional)</option>
          {paymentAccounts.map(acc => (
            <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>
          ))}
        </select>

        <input name="reference" placeholder="Reference (optional)" className="border rounded-xl px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
        
        <button className="bg-green-600 text-white rounded-xl px-4 py-2 text-sm hover:bg-green-700 font-medium transition-colors shadow-sm">Record Payment</button>
      </form>

      {/* Installments Table */}
      {order.installments.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
          <h2 className="font-semibold mb-4 text-slate-800 dark:text-white">Installments</h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-left text-slate-500 dark:text-slate-400 uppercase text-xs font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-medium">Due Date</th>
                  <th className="px-4 font-medium">Amount</th>
                  <th className="px-4 font-medium">Paid</th>
                  <th className="px-4 font-medium">Status</th>
                  <th className="px-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {order.installments.map(i => (
                  <tr key={i.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">{i.dueDate.toLocaleDateString()}</td>
                    <td className="px-4">৳ {Number(i.amount).toLocaleString()}</td>
                    <td className="px-4">৳ {Number(i.paidAmount).toLocaleString()}</td>
                    <td className="px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        i.status === 'PAID' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                        i.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {i.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link 
                        href={`/orders/${order.id}/installments/${i.id}/edit`} 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-lg text-xs font-semibold transition-colors border border-amber-100 dark:border-amber-800/50"
                      >
                        <Edit size={14} />
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payments Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
        <h2 className="font-semibold mb-4 text-slate-800 dark:text-white">Payments</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-left text-slate-500 dark:text-slate-400 uppercase text-xs font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="px-4 font-medium">Amount</th>
                <th className="px-4 font-medium">Method</th>
                <th className="px-4 font-medium">Account</th>
                <th className="px-4 font-medium">By</th>
              </tr>
            </thead>
            <tbody>
              {order.payments.map(p => (
                <tr key={p.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4">{p.paidAt.toLocaleDateString()}</td>
                  <td className="px-4 font-medium">৳ {Number(p.amount).toLocaleString()}</td>
                  <td className="px-4">{p.method}</td>
                  <td className="px-4">{p.paymentAccount?.name || "N/A"}</td>
                  <td className="px-4">{p.receivedBy?.name || "Admin"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}