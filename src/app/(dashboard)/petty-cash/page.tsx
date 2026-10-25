import { prisma } from "@/lib/prisma";
import { getAllAccountBalances } from "@/server/actions/accounting";
import { Wallet, Receipt, ArrowDownRight, TrendingDown } from "lucide-react";
import { PettyCashTabs } from "./petty-cash-tabs";
import Link from "next/link";

export default async function PettyCashPage() {
  const pettyCashAccounts = await prisma.paymentAccount.findMany({
    where: { type: "PETTY_CASH", isActive: true }
  });

  const mainAccounts = await prisma.paymentAccount.findMany({
    where: { type: { not: "PETTY_CASH" }, isActive: true }
  });

  const accountBalances = await getAllAccountBalances();
  
  const recentExpenses = await prisma.expense.findMany({
    where: { paymentAccountId: { in: pettyCashAccounts.map(a => a.id) } },
    orderBy: { date: "desc" },
    take: 10,
  });

  const [categories, heads, subHeads] = await Promise.all([
    prisma.expenseCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.expenseHead.findMany({ orderBy: { name: "asc" } }),
    prisma.expenseSubHead.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalExpense = recentExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="space-y-6 w-full max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Wallet className="text-blue-500" size={28} /> Petty Cash
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage daily small expenses and funds transfer.</p>
        </div>
        <Link href="/expenses" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2">
          <Receipt size={16} /> View All Expenses
        </Link>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side (Tabs & Table) - 9 columns */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Tabs Section */}
          <PettyCashTabs 
            mainAccounts={mainAccounts} 
            pettyCashAccounts={pettyCashAccounts} 
            categories={categories} 
            heads={heads} 
            subHeads={subHeads} 
          />

          {/* Recent Transactions Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Recent Expenses</h2>
            </div>
            
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="table-premium">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentExpenses.map(exp => (
                    <tr key={exp.id}>
                      <td className="text-xs">{new Date(exp.date).toLocaleDateString()}</td>
                      <td className="font-medium text-slate-800 dark:text-slate-200">{exp.title}</td>
                      <td>
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs">
                          {exp.category?.name || "Uncategorized"}
                        </span>
                      </td>
                      <td className="text-right font-bold text-red-600 dark:text-red-400">
                        <div className="flex items-center justify-end gap-1">
                          <ArrowDownRight size={14} /> ৳ {Number(exp.amount).toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {recentExpenses.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-500">
                        No expenses recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side (Cards) - 3 columns */}
        <div className="lg:col-span-3 space-y-6">
          {pettyCashAccounts.map(acc => {
            const balance = accountBalances.balances.find((b: any) => b.id === acc.id)?.balance || 0;
            return (
              /* ✅ ড্যাশবোর্ডের কার্ডের মতো Indigo to Purple গ্রেডিয়েন্ট */
              <div key={acc.id} className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Wallet size={24} />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-sm">
                    Active
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-100">{acc.name}</p>
                  <p className="text-3xl font-black mt-1">৳ {balance.toLocaleString()}</p>
                </div>
              </div>
            );
          })}

          <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
                <TrendingDown size={24} />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500">
                All Time
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Expenses</p>
              <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">৳ {totalExpense.toLocaleString()}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}