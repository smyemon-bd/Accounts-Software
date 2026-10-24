import { getAccountBook } from "@/server/actions/accounting";
import { prisma } from "@/lib/prisma";
import { AccountSelector } from "./account-selector";

export default async function CashBookPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ accountId?: string }> 
}) {
  const resolvedParams = await searchParams;
  const selectedAccountId = resolvedParams.accountId || "cash";

  // ডেটাবেজ থেকে সব পেমেন্ট অ্যাকাউন্ট (Bank, MFS, QR) আনা
  const paymentAccounts = await prisma.paymentAccount.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" }
  });

  // ড্রপডাউনের জন্য অ্যাকাউন্ট লিস্ট তৈরি করা
  const accountOptions = [
    { id: "cash", name: "Cash", code: "1000" },
    ...paymentAccounts.map(acc => ({ id: acc.id, name: `${acc.name} (${acc.type})`, code: `ACC-${acc.id}` }))
  ];

  // সিলেক্ট করা অ্যাকাউন্টের কোড বের করা
  const activeAccountOption = accountOptions.find(a => a.id === selectedAccountId);
  const accountCode = activeAccountOption?.code || "1000";

  const { totalIn, totalOut, balance, transactions } = await getAccountBook(accountCode);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Account Book</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">View transactions for any account.</p>
        </div>
        
        {/* Account Selector (Auto-Load) */}
        <AccountSelector 
          accountOptions={accountOptions} 
          selectedAccountId={selectedAccountId} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 p-4 rounded-xl transition-colors">
          <p className="text-green-800 dark:text-green-300 font-medium text-sm">Total In ({activeAccountOption?.name || "Cash"})</p>
          <p className="text-2xl font-bold text-green-900 dark:text-green-200 mt-1">৳ {totalIn.toLocaleString()}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 p-4 rounded-xl transition-colors">
          <p className="text-red-800 dark:text-red-300 font-medium text-sm">Total Out ({activeAccountOption?.name || "Cash"})</p>
          <p className="text-2xl font-bold text-red-900 dark:text-red-200 mt-1">৳ {totalOut.toLocaleString()}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 p-4 rounded-xl transition-colors">
          <p className="text-blue-800 dark:text-blue-300 font-medium text-sm">Current Balance ({activeAccountOption?.name || "Cash"})</p>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-200 mt-1">৳ {balance.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
        <h2 className="font-semibold mb-4 text-slate-800 dark:text-white">Recent Transactions</h2>
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="table-premium">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description / Memo</th>
                <th>Type</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id}>
                  <td className="text-xs">{new Date(t.date).toLocaleDateString()}</td>
                  <td>{t.memo}</td>
                  <td>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      t.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {t.type}
                    </span>
                  </td>
                  <td className={`text-right font-bold ${t.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                    ৳ {t.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan={4} className="text-center py-8 text-slate-500">No transactions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}