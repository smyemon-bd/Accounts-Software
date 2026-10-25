import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import PrintButton from "@/app/(dashboard)/orders/[id]/invoice/print-button";
import { getSettings } from "@/server/actions/settings";
import { FileText, Printer } from "lucide-react";

export default async function ClientStatementPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const client = await prisma.client.findUnique({
    where: { id: resolvedParams.id },
    include: {
      sales: {
        orderBy: { createdAt: "desc" },
        include: {
          items: { include: { service: true, product: true } },
          payments: true,
        }
      }
    },
  });

  if (!client) notFound();

  const settings = await getSettings();

  let totalBilled = 0;
  let totalPaid = 0;

  client.sales.forEach(sale => {
    totalBilled += Number(sale.total);
    totalPaid += Number(sale.paidAmount);
  });

  const totalDue = totalBilled - totalPaid;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Print & Back Button */}
      <div className="flex justify-between items-center print:hidden">
        <Link href="/masters?tab=clients" className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors">
          ← Back to Clients
        </Link>
        <PrintButton />
      </div>

      {/* Main Statement Container */}
      <div className="bg-white border p-8 md:p-10 rounded-2xl shadow-xl print:shadow-none print:border-0 print:p-0">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-slate-800 pb-6 mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {settings.companyName.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{settings.companyName}</h1>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{settings.companySub}</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-2">{settings.address}</p>
            <p className="text-xs text-slate-600">Phone: {settings.phone} | Email: {settings.email}</p>
          </div>
          <div className="text-left md:text-right">
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">Statement</h2>
            <p className="text-sm font-medium text-slate-500 mt-2">Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Client Info */}
        <div className="flex justify-between items-start mb-8 bg-slate-50 p-6 rounded-xl print:bg-transparent print:p-0 print:border-b print:pb-6 print:rounded-none">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Statement For</p>
            <h3 className="text-xl font-bold text-slate-900">{client.name}</h3>
            <p className="text-sm text-slate-600 mt-1">{client.phone || "N/A"}</p>
            <p className="text-sm text-slate-600">{client.email || "N/A"}</p>
            <p className="text-sm text-slate-600">{client.address || "N/A"}</p>
          </div>
          <div className="text-right">
            <div className="mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Statement No</span>
              <span className="text-sm font-mono font-medium text-slate-800">{client.id.slice(-8).toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Summary Cards (Print Friendly) */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center print:bg-transparent print:border-slate-300">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Billed</p>
            <p className="font-black text-xl text-slate-800">৳ {totalBilled.toLocaleString()}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl border border-green-200 text-center print:bg-transparent print:border-slate-300">
            <p className="text-green-700 text-xs font-bold uppercase tracking-wider mb-1">Total Paid</p>
            <p className="font-black text-xl text-green-700">৳ {totalPaid.toLocaleString()}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-center print:bg-transparent print:border-slate-300">
            <p className="text-red-700 text-xs font-bold uppercase tracking-wider mb-1">Outstanding Due</p>
            <p className="font-black text-xl text-red-700">৳ {totalDue.toLocaleString()}</p>
          </div>
        </div>

        {/* Order History Table */}
        <h3 className="font-bold text-lg text-slate-800 mb-4">Transaction History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white print:bg-slate-200 print:text-slate-800">
                <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider border border-slate-700 print:border-slate-300">Date</th>
                <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider border border-slate-700 print:border-slate-300">Invoice No</th>
                <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider border border-slate-700 print:border-slate-300">Items</th>
                <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-right border border-slate-700 print:border-slate-300">Billed</th>
                <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-right border border-slate-700 print:border-slate-300">Paid</th>
                <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-right border border-slate-700 print:border-slate-300">Due</th>
              </tr>
            </thead>
            <tbody>
              {client.sales.map(sale => {
                const paid = Number(sale.paidAmount);
                const due = Number(sale.dueAmount);
                return (
                  <tr key={sale.id} className="border-b border-slate-200 print:border-slate-300">
                    <td className="py-3 px-4 border border-slate-200 print:border-slate-300 text-slate-700">{new Date(sale.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 border border-slate-200 print:border-slate-300 font-mono text-xs text-blue-600 print:text-slate-800">{sale.invoiceNo}</td>
                    <td className="px-4 border border-slate-200 print:border-slate-300 text-slate-600">
                      {sale.items.map((i, idx) => (
                        <span key={i.id} className="block text-xs">
                          • {i.itemType === "SERVICE" ? i.service?.name : i.product?.name} (x{i.qty})
                        </span>
                      ))}
                    </td>
                    <td className="px-4 border border-slate-200 print:border-slate-300 text-right font-medium">৳ {Number(sale.total).toLocaleString()}</td>
                    <td className="px-4 border border-slate-200 print:border-slate-300 text-right font-medium text-green-600 print:text-slate-800">৳ {paid.toLocaleString()}</td>
                    <td className="px-4 border border-slate-200 print:border-slate-300 text-right font-bold text-red-600 print:text-slate-800">৳ {due.toLocaleString()}</td>
                  </tr>
                );
              })}
              {client.sales.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500 border border-slate-200 print:border-slate-300">No transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-500">
          <p>This is a computer-generated statement. No signature is required.</p>
          <p className="mt-1">© {new Date().getFullYear()} {settings.companyName}. All rights reserved.</p>
        </div>

      </div>
    </div>
  );
}