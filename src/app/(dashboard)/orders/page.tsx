import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FileText, Plus, Eye } from "lucide-react";
import { OrderForm } from "./order-form"; // নতুন ফর্ম কম্পোনেন্ট ইমপোর্ট

export default async function OrdersPage() {
  const [orders, clients, services] = await Promise.all([
    prisma.serviceOrder.findMany({
      orderBy: { createdAt: "desc" },
      include: { client: true, service: true },
    }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.service.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">Service Orders</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage your client orders and track payments.</p>
        </div>
      </div>

      {/* Create Order Form */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 transition-colors">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-xl">
            <Plus className="text-blue-600 dark:text-blue-400" size={20} />
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Create New Order</h2>
        </div>

        {/* নতুন ফর্ম কম্পোনেন্ট */}
        <OrderForm clients={clients} services={services.map(s => ({ ...s, price: Number(s.price) }))} />
      </div>

      {/* Orders Table */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 transition-colors">
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50">
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Order No</th>
                  <th>Client</th>
                  <th>Service</th>
                  <th>Type</th>
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
                      <span className="text-xs font-medium px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {o.paymentType}
                      </span>
                    </td>
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
                      <Link 
                        href={`/orders/${o.id}`} 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg text-xs font-semibold transition-colors border border-blue-100 dark:border-blue-800/50"
                      >
                        <Eye size={14} />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                        <FileText size={40} className="mb-3 opacity-20" />
                        <p className="text-base font-medium">No orders yet</p>
                        <p className="text-sm mt-1">Create your first order using the form above.</p>
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