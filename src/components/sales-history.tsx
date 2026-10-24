"use client";

import { useEffect, useState } from "react";
import { getSales, updateSale } from "@/server/actions/sale";
import { FileText, Search, Edit, X } from "lucide-react";
import { useToast } from "@/components/toast-provider";
import Link from "next/link";

export function SalesHistory() {
  const { showToast } = useToast();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingSale, setEditingSale] = useState<any>(null);

  const loadData = () => {
    getSales().then(data => {
      setSales(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredSales = sales.filter(s => 
    s.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSale = filteredSales.reduce((sum, s) => sum + s.total, 0);
  const totalPaid = filteredSales.reduce((sum, s) => sum + s.paidAmount, 0);
  const totalDue = filteredSales.reduce((sum, s) => sum + s.dueAmount, 0);

  if (loading) return <div className="p-10 text-center text-slate-500">Loading sales history...</div>;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">Total Sales Amount</p>
          <p className="text-2xl font-black mt-1">৳ {totalSale.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-green-100 text-xs font-bold uppercase tracking-wider">Total Paid</p>
          <p className="text-2xl font-black mt-1">৳ {totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-red-100 text-xs font-bold uppercase tracking-wider">Total Due</p>
          <p className="text-2xl font-black mt-1">৳ {totalDue.toLocaleString()}</p>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="font-bold text-slate-800 dark:text-white">Sales History</h2>
          
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by invoice or client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th className="text-right">Total</th>
                  <th className="text-right">Paid</th>
                  <th className="text-right">Due</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map(sale => (
                  <tr key={sale.id}>
                    <td className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">{sale.invoiceNo}</td>
                    <td className="font-medium">{sale.client.name}</td>
                    <td className="text-xs">{new Date(sale.createdAt).toLocaleDateString()}</td>
                    <td className="text-right font-bold text-slate-800 dark:text-slate-200">৳ {sale.total.toLocaleString()}</td>
                    <td className="text-right font-medium text-green-600">৳ {sale.paidAmount.toLocaleString()}</td>
                    <td className="text-right font-medium text-red-600">৳ {sale.dueAmount.toLocaleString()}</td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link 
                          href={`/sales/${sale.id}/invoice`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
                        >
                          <FileText size={14} /> Invoice
                        </Link>
                        <button 
                          onClick={() => setEditingSale(sale)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-semibold hover:bg-amber-100 transition-colors"
                        >
                          <Edit size={14} /> Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSales.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-500">No sales found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Sale Modal */}
      {editingSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
            <button onClick={() => setEditingSale(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Edit Sale — {editingSale.invoiceNo}</h2>
            
            <form action={async (formData) => {
              const res = await updateSale(formData);
              if (res.success) {
                showToast("Sale updated successfully!");
                setEditingSale(null);
                loadData(); // রিফ্রেশ ডেটা
              }
            }} className="space-y-4">
              <input type="hidden" name="id" value={editingSale.id} />
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Discount (৳)</label>
                <input name="discount" type="number" step="0.01" defaultValue={editingSale.discount} className="input-premium" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Paid Amount (৳)</label>
                <input name="paidAmount" type="number" step="0.01" defaultValue={editingSale.paidAmount} className="input-premium" />
                <p className="text-xs text-slate-500 mt-1">Total Amount: ৳ {editingSale.total.toLocaleString()}</p>
              </div>

              <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-blue-500/30">
                Update Sale
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}