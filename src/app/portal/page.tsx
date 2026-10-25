import { getClientDashboardData } from "@/server/actions/portal";
import { redirect } from "next/navigation";
import { FileText, Wallet, AlertCircle, Download } from "lucide-react";
import Link from "next/link";

export default async function PortalDashboardPage() {
  const data = await getClientDashboardData();
  
  if (!data) redirect("/portal/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Welcome, {data.client.name}!</h1>
        <p className="text-slate-500 mt-1">Here is the summary of your account.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FileText size={18} /></div>
            <p className="text-sm font-bold text-slate-500">Total Billed</p>
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-white">৳ {data.summary.totalBilled.toLocaleString()}</p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Wallet size={18} /></div>
            <p className="text-sm font-bold text-slate-500">Total Paid</p>
          </div>
          <p className="text-2xl font-black text-emerald-600">৳ {data.summary.totalPaid.toLocaleString()}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg"><AlertCircle size={18} /></div>
            <p className="text-sm font-bold text-slate-500">Outstanding Due</p>
          </div>
          <p className="text-2xl font-black text-red-600">৳ {data.summary.totalDue.toLocaleString()}</p>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">My Invoices</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="p-3">Invoice No</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3 text-right">Paid</th>
                <th className="p-3 text-right">Due</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.sales.map((sale: any) => (
                <tr key={sale.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <td className="p-3 font-mono font-semibold text-blue-600">{sale.invoiceNo}</td>
                  <td className="p-3 text-slate-600">{new Date(sale.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 text-right font-semibold">৳ {Number(sale.total).toLocaleString()}</td>
                  <td className="p-3 text-right text-emerald-600">৳ {Number(sale.paidAmount).toLocaleString()}</td>
                  <td className="p-3 text-right text-red-600 font-bold">৳ {Number(sale.dueAmount).toLocaleString()}</td>
                  <td className="p-3 text-center">
                    <Link href={`/portal/invoices/${sale.id}`} className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs font-bold">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {data.sales.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">No invoices found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}