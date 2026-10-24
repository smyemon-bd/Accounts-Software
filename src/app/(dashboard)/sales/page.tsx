import { prisma } from "@/lib/prisma";
import { SaleForm } from "@/components/sale-form";
import { SalesHistory } from "@/components/sales-history";
import { ShoppingCart, History } from "lucide-react";
import Link from "next/link";

export default async function SalesPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ tab?: string }> 
}) {
  const resolvedParams = await searchParams;
  const activeTab = resolvedParams.tab || "new";

  const [clients, services, products, paymentAccounts] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.service.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.product.findMany({ where: { stockQty: { gt: 0 }, isActive: true }, orderBy: { name: "asc" } }),
    prisma.paymentAccount.findMany({ where: { isActive: true }, orderBy: { name: "asc" } })
  ]);

  const serializableServices = JSON.parse(JSON.stringify(services)).map((s: any) => ({
    ...s,
    price: Number(s.price)
  }));
  const serializableProducts = JSON.parse(JSON.stringify(products)).map((p: any) => ({
    ...p,
    costPrice: Number(p.costPrice),
    sellPrice: Number(p.sellPrice)
  }));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <ShoppingCart className="text-blue-500" /> Sales
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Create a new sale or view sales history.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <Link 
          href="/sales?tab=new"
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "new" ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <ShoppingCart size={16} /> New Sale
        </Link>
        <Link 
          href="/sales?tab=history"
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "history" ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <History size={16} /> Sales History
        </Link>
      </div>

      <div className="mt-4">
        {activeTab === "new" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
            <SaleForm 
              clients={clients} 
              services={serializableServices} 
              products={serializableProducts} 
              paymentAccounts={paymentAccounts} 
            />
          </div>
        )}
        {activeTab === "history" && (
          <SalesHistory />
        )}
      </div>
    </div>
  );
}