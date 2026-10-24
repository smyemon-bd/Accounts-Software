import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Package, Eye } from "lucide-react";

export default async function PurchasesPage() {
  const purchases = await prisma.purchase.findMany({
    orderBy: { createdAt: "desc" },
    include: { distributor: true, items: true },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Purchase History</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">All stock purchases from distributors.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Distributor</th>
                  <th>Items</th>
                  <th className="text-right">Total</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map(p => (
                  <tr key={p.id}>
                    <td>{p.createdAt.toLocaleDateString()}</td>
                    <td className="font-medium">{p.distributor.name}</td>
                    <td>{p.items.length} items</td>
                    <td className="text-right font-bold">৳ {Number(p.total).toLocaleString()}</td>
                    <td className="text-right">
                      <Link href={`/purchases/${p.id}/invoice`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-semibold transition-colors border border-blue-100">
                        <Eye size={14} /> Invoice
                      </Link>
                    </td>
                  </tr>
                ))}
                {purchases.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400">
                      <Package size={40} className="mx-auto mb-3 opacity-20" />
                      <p>No purchases found.</p>
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