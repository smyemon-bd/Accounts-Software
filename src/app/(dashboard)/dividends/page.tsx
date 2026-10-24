import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import Link from "next/link";
import { PieChart, UserPlus, Share2, FileText, Wallet } from "lucide-react";
import { ShareHoldersList } from "@/components/shareholders-list";
import { DividendsList } from "@/components/dividends-list";

export default async function DividendsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ tab?: string }> 
}) {
  await requirePermission("dashboard.admin");
  const resolvedParams = await searchParams;
  const activeTab = resolvedParams.tab || "holders";

  const [holders, dividends, paymentAccounts] = await Promise.all([
    prisma.shareHolder.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.dividend.findMany({ 
      orderBy: { declaredAt: "desc" },
      include: { shareHolder: true }
    }),
    prisma.paymentAccount.findMany({ where: { isActive: true }, orderBy: { name: "asc" } })
  ]);

  const serializableDividends = dividends.map(d => ({
    ...d,
    amount: Number(d.amount)
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <PieChart className="text-blue-500" /> Dividend Management
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage share holders and dividend declarations.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <Link 
          href="/dividends?tab=holders"
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "holders" ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <UserPlus size={16} /> Share Holders
        </Link>
        <Link 
          href="/dividends?tab=dividends"
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "dividends" ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <FileText size={16} /> Dividends
        </Link>
      </div>

      <div className="mt-4">
        {activeTab === "holders" && <ShareHoldersList holders={holders} />}
        {activeTab === "dividends" && <DividendsList dividends={serializableDividends} holders={holders} paymentAccounts={paymentAccounts} />}
      </div>
    </div>
  );
}