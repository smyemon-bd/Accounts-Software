import { prisma } from "@/lib/prisma";
import { getAllAccountBalances } from "@/server/actions/accounting";
import { Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";

export default async function PettyCashPage() {
  // ১. Petty Cash অ্যাকাউন্টগুলো খুঁজে বের করা
  const pettyCashAccounts = await prisma.paymentAccount.findMany({
    where: { type: "PETTY_CASH", isActive: true }
  });

  // ২. বর্তমান ব্যালেন্স বের করা (আপনার getAllAccountBalances ফাংশন ব্যবহার করে)
  const accountBalances = await getAllAccountBalances();
  
  // ৩. সাম্প্রতিক এক্সপেন্সগুলো দেখা (শুধু Petty Cash থেকে করা খরচ)
  const recentExpenses = await prisma.expense.findMany({
    where: { paymentAccountId: { in: pettyCashAccounts.map(a => a.id) } },
    orderBy: { date: "desc" },
    take: 10,
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Petty Cash Management</h1>
          <p className="text-sm text-slate-500">Manage your daily small expenses.</p>
        </div>
        <Link href="/expenses/new" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold">
          Log New Expense
        </Link>
      </div>

      {/* Petty Cash Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {pettyCashAccounts.map(acc => {
          // আপনার getAllAccountBalances থেকে ডাটা ম্যাপ করুন
          const balance = accountBalances.balances.find((b: any) => b.id === acc.id)?.balance || 0;
          
          return (
            <div key={acc.id} className="bg-white dark:bg-slate-900 border p-6 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="p-4 bg-blue-100 text-blue-600 rounded-xl">
                <Wallet size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500">{acc.name}</p>
                <p className="text-2xl font-bold">৳ {balance.toLocaleString()}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold mb-4">Recent Petty Cash Expenses</h2>
        <div className="space-y-3">
          {recentExpenses.map(exp => (
            <div key={exp.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div>
                <p className="font-semibold text-slate-800 dark:text-white">{exp.title}</p>
                <p className="text-xs text-slate-500">{new Date(exp.date).toLocaleDateString()}</p>
              </div>
              <p className="font-bold text-red-600">- ৳ {Number(exp.amount).toLocaleString()}</p>
            </div>
          ))}
          {recentExpenses.length === 0 && (
            <p className="text-center text-slate-500 py-4">No recent expenses.</p>
          )}
        </div>
      </div>
    </div>
  );
}