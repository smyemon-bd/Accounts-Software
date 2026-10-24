import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import Link from "next/link";
import { TrendingUp, UserPlus } from "lucide-react";
import { InvestorsList } from "@/components/investors-list";
import { InvestmentsList } from "@/components/investments-list";

export default async function InvestmentsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ tab?: string }> 
}) {
  await requirePermission("dashboard.admin");
  const resolvedParams = await searchParams;
  const activeTab = resolvedParams.tab || "investors";

  const [investors, investments, paymentAccounts] = await Promise.all([
    prisma.investor.findMany({ orderBy: { name: "asc" } }),
    prisma.investment.findMany({
      orderBy: { investedAt: "desc" },
      include: { investor: true }
    }),
    prisma.paymentAccount.findMany({ where: { isActive: true }, orderBy: { name: "asc" } })
  ]);

  const serializableInvestments = investments.map(inv => ({
    id: inv.id,
    investorId: inv.investorId,
    amount: Number(inv.amount),
    investedAt: inv.investedAt,
    investor: inv.investor
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Investments</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage your investors and their investments.</p>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <Link 
          href="/investments?tab=investors"
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "investors" ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <UserPlus size={16} /> Investors
        </Link>
        <Link 
          href="/investments?tab=investments"
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "investments" ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <TrendingUp size={16} /> Investments
        </Link>
      </div>

      <div className="mt-4">
        {activeTab === "investors" && <InvestorsList investors={investors} />}
        {activeTab === "investments" && (
          <InvestmentsList 
            investments={serializableInvestments} 
            investors={investors} 
            paymentAccounts={paymentAccounts} 
          />
        )}
      </div>
    </div>
  );
}