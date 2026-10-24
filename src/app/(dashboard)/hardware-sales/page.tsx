import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { createHardwareSale } from "@/server/actions/inventory";

export default async function HardwareSalesPage() {
  await requirePermission("dashboard.admin");

  const sales = await prisma.hardwareSale.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: true,
      items: { include: { product: true } }
    }
  });

  const clients = await prisma.client.findMany({ orderBy: { name: "asc" } });
  const products = await prisma.product.findMany({ where: { stockQty: { gt: 0 } }, orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">Hardware Sales</h1>

      {/* Add Sale Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h2 className="font-semibold text-slate-800 dark:text-white mb-4">New Hardware Sale</h2>
        <form action={createHardwareSale} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select name="clientId" required className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-800 dark:text-white outline-none cursor-pointer">
            <option value="">Select Client</option>
            {clients.map(c => <option key={c.id} value={c.id} className="dark:bg-slate-900">{c.name}</option>)}
          </select>
          
          <select name="productId" required className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-800 dark:text-white outline-none cursor-pointer">
            <option value="">Select Product</option>
            {products.map(p => <option key={p.id} value={p.id} className="dark:bg-slate-900">{p.name} (Stock: {p.stockQty})</option>)}
          </select>
          
          <input name="qty" type="number" min="1" placeholder="Quantity" required className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none" />
          <input name="unitPrice" type="number" step="0.01" placeholder="Sell Price" required className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none" />
          
          <button className="bg-purple-600 text-white font-semibold text-sm rounded-lg px-5 py-2.5 hover:bg-purple-700 transition-colors shadow-sm">Sell Product</button>
        </form>
      </div>

      {/* Sales List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm transition-colors">
        <h2 className="font-semibold mb-4 text-slate-800 dark:text-white">Recent Hardware Sales</h2>
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase text-xs font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(sale => (
                <tr key={sale.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{sale.createdAt.toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{sale.client.name}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{sale.items.map(i => i.product.name).join(", ")}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{sale.items.reduce((sum, i) => sum + i.qty, 0)}</td>
                  <td className="px-4 py-3 text-right font-medium text-green-600 dark:text-green-400">৳ {Number(sale.total).toLocaleString()}</td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-500 dark:text-slate-400">No hardware sales yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}