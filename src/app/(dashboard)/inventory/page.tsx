import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { createProduct, createDistributor, createPurchase } from "@/server/actions/inventory";

export default async function InventoryPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requirePermission("dashboard.admin");
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";

  const products = await prisma.product.findMany({ 
    where: query ? {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { sku: { contains: query, mode: "insensitive" } }
      ]
    } : {},
    orderBy: { name: "asc" } 
  });
  
  const distributors = await prisma.distributor.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">Inventory Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add Product */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 transition-colors">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Add New Product</h2>
          <form action={createProduct} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input name="sku" placeholder="SKU (e.g. HW-001)" required className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" />
              <input name="name" placeholder="Product Name" required className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input name="costPrice" type="number" step="0.01" placeholder="Cost Price" required className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" />
              <input name="sellPrice" type="number" step="0.01" placeholder="Sell Price" required className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" />
            </div>
            <input name="stockQty" type="number" placeholder="Initial Stock Qty" required className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" />
            <button className="w-full bg-blue-600 text-white font-semibold text-sm rounded-lg px-5 py-2.5 hover:bg-blue-700 transition-colors shadow-sm">Save Product</button>
          </form>
        </div>

        {/* Add Distributor */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 transition-colors">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Add New Distributor</h2>
          <form action={createDistributor} className="space-y-4">
            <input name="name" placeholder="Distributor Name" required className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" />
            <input name="phone" placeholder="Phone (Optional)" className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" />
            <button className="w-full bg-green-600 text-white font-semibold text-sm rounded-lg px-5 py-2.5 hover:bg-green-700 transition-colors shadow-sm">Save Distributor</button>
          </form>
        </div>

        {/* Add Purchase */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 md:col-span-2 transition-colors">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-4">New Purchase (Add Stock)</h2>
          <form action={createPurchase} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select name="distributorId" required className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-800 dark:text-white outline-none cursor-pointer">
              <option value="">Select Distributor</option>
              {distributors.map(d => <option key={d.id} value={d.id} className="dark:bg-slate-900">{d.name}</option>)}
            </select>
            <select name="productId" required className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-800 dark:text-white outline-none cursor-pointer">
              <option value="">Select Product</option>
              {products.map(p => <option key={p.id} value={p.id} className="dark:bg-slate-900">{p.name}</option>)}
            </select>
            <input name="qty" type="number" placeholder="Quantity" required className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none" />
            <input name="unitCost" type="number" step="0.01" placeholder="Unit Cost" required className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none" />
            <button className="bg-indigo-600 text-white font-semibold text-sm rounded-lg px-5 py-2.5 hover:bg-indigo-700 transition-colors shadow-sm">Purchase</button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm transition-colors">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-slate-800 dark:text-white">Product Stock</h2>
            <form className="flex gap-2">
              <input type="text" name="q" defaultValue={query} placeholder="Search product..." className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-800 dark:text-white outline-none" />
              <button type="submit" className="bg-slate-800 dark:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium">Search</button>
            </form>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase text-xs font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{p.sku}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate text-slate-800 dark:text-slate-200">{p.name}</td>
                    <td className={`px-4 py-3 text-right font-medium ${p.stockQty <= p.reorderLvl ? "text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-300"}`}>
                      {p.stockQty} {p.stockQty <= p.reorderLvl && "(Low)"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Distributor List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm transition-colors">
          <h2 className="font-semibold mb-4 text-slate-800 dark:text-white">Distributors List</h2>
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase text-xs font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Phone</th>
                </tr>
              </thead>
              <tbody>
                {distributors.map(d => (
                  <tr key={d.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{d.name}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{d.phone || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}