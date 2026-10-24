import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import Link from "next/link";
import { Landmark, Wallet } from "lucide-react";
import { LoansTaken } from "@/components/loans-taken";
import { LoansPaid } from "@/components/loans-paid";

export default async function LoansPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ tab?: string }> 
}) {
  await requirePermission("dashboard.admin");
  const resolvedParams = await searchParams;
  const activeTab = resolvedParams.tab || "taken";

  const [loans, repayments, paymentAccounts] = await Promise.all([
    prisma.loan.findMany({ orderBy: { startDate: "desc" } }),
    prisma.loanRepayment.findMany({
      orderBy: { paidAt: "desc" },
      include: { loan: true }
    }),
    prisma.paymentAccount.findMany({ where: { isActive: true }, orderBy: { name: "asc" } })
  ]);

  // Decimal টাইপকে Number-এ কনভার্ট করা (সব ফিল্ড আলাদা করে)
  const serializableLoans = loans.map(l => ({
    id: l.id,
    lenderName: l.lenderName,
    principal: Number(l.principal),
    interestRate: Number(l.interestRate),
    tenureMonths: l.tenureMonths,
    emiAmount: Number(l.emiAmount),
    startDate: l.startDate,
    status: l.status,
    createdAt: l.createdAt,
  }));

  const serializableRepayments = repayments.map(r => ({
    id: r.id,
    loanId: r.loanId,
    amount: Number(r.amount),
    paidAt: r.paidAt,
    loan: {
      id: r.loan.id,
      lenderName: r.loan.lenderName,
      principal: Number(r.loan.principal),
      interestRate: Number(r.loan.interestRate),
      tenureMonths: r.loan.tenureMonths,
      emiAmount: Number(r.loan.emiAmount),
      startDate: r.loan.startDate,
      status: r.loan.status,
      createdAt: r.loan.createdAt,
    }
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Loans</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage your loans and repayments.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <Link 
          href="/loans?tab=taken"
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "taken" ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <Landmark size={16} /> Loan Taken
        </Link>
        <Link 
          href="/loans?tab=paid"
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "paid" ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <Wallet size={16} /> Loan Paid
        </Link>
      </div>

      <div className="mt-4">
        {activeTab === "taken" && (
          <LoansTaken loans={serializableLoans} paymentAccounts={paymentAccounts} />
        )}
        {activeTab === "paid" && (
          <LoansPaid repayments={serializableRepayments} loans={serializableLoans} paymentAccounts={paymentAccounts} />
        )}
      </div>
    </div>
  );
}