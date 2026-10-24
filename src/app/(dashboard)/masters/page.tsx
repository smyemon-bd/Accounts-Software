import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, Briefcase, Package, Truck } from "lucide-react";
import { ClientsList } from "@/components/clients-list";
import { ServicesList } from "@/components/services-list";
import { InventoryList } from "@/components/inventory-list";

export default async function MastersPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ tab?: string, q?: string }> 
}) {
  const resolvedParams = await searchParams;
  const activeTab = resolvedParams.tab || "clients";
  const query = resolvedParams.q || "";

  const [clients, services, products, distributors, paymentAccounts] = await Promise.all([
    prisma.client.findMany({ 
      where: query ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { phone: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ]
      } : {},
      orderBy: { createdAt: "desc" } 
    }),
    prisma.service.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.product.findMany({ orderBy: { name: "asc" } }),
    prisma.distributor.findMany({ orderBy: { name: "asc" } }),
    prisma.paymentAccount.findMany({ where: { isActive: true }, orderBy: { name: "asc" } })
  ]);

  const serializableServices = services.map(s => ({ ...s, price: Number(s.price) }));

  const serializableProducts = products.map(p => ({
    ...p,
    costPrice: Number(p.costPrice),
    sellPrice: Number(p.sellPrice),
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Masters Header & Tabs - Hidden on Print */}
      <div className="print:hidden">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Masters</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage your clients, services, products and distributors in one place.</p>
        </div>

        {/* Main Tabs */}
        <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 mt-6">
          <Link 
            href="/masters?tab=clients"
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "clients" ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <Users size={16} /> Clients
          </Link>
          <Link 
            href="/masters?tab=services"
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "services" ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <Briefcase size={16} /> Services
          </Link>
          <Link 
            href="/masters?tab=products"
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "products" ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <Package size={16} /> Products
          </Link>
          <Link 
            href="/masters?tab=distributors"
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "distributors" ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <Truck size={16} /> Distributors
          </Link>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === "clients" && <ClientsList clients={clients} query={query} />}
        {activeTab === "services" && <ServicesList initialServices={serializableServices} />}
        {activeTab === "products" && <InventoryList products={serializableProducts} distributors={distributors} paymentAccounts={paymentAccounts} activeTab="products" />}
        {activeTab === "distributors" && <InventoryList products={serializableProducts} distributors={distributors} paymentAccounts={paymentAccounts} activeTab="distributors" />}
      </div>
    </div>
  );
}