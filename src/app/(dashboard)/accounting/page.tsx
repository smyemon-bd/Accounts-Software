import { getTrialBalance } from "@/server/actions/accounting";

export default async function AccountingPage() {
  const balances = await getTrialBalance();

  const totalDebit = balances.reduce((sum, acc) => sum + acc.debit, 0);
  const totalCredit = balances.reduce((sum, acc) => sum + acc.credit, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Accounting (Trial Balance)</h1>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="table-premium">
            <thead>
              <tr>
                <th>Account Code</th>
                <th>Account Name</th>
                <th>Type</th>
                <th className="text-right">Debit (৳)</th>
                <th className="text-right">Credit (৳)</th>
              </tr>
            </thead>
            <tbody>
              {balances.map((acc, idx) => (
                <tr key={idx}>
                  <td className="font-mono text-xs text-slate-500 dark:text-slate-400">{acc.code}</td>
                  <td className="font-medium text-slate-800 dark:text-slate-200">{acc.name}</td>
                  <td className="text-slate-600 dark:text-slate-300">{acc.type}</td>
                  <td className="text-right text-blue-600 dark:text-blue-400">{acc.debit > 0 ? acc.debit.toLocaleString() : "-"}</td>
                  <td className="text-right text-green-600 dark:text-green-400">{acc.credit > 0 ? acc.credit.toLocaleString() : "-"}</td>
                </tr>
              ))}
              
              {/* Total Row */}
              <tr className="bg-slate-50 dark:bg-slate-800/50 font-bold border-t-2 border-slate-300 dark:border-slate-700">
                <td colSpan={3} className="text-right py-4 text-slate-800 dark:text-white uppercase tracking-wider text-sm">
                  Total
                </td>
                <td className="text-right text-blue-700 dark:text-blue-400 py-4 text-lg">
                  ৳ {totalDebit.toLocaleString()}
                </td>
                <td className="text-right text-green-700 dark:text-green-400 py-4 text-lg">
                  ৳ {totalCredit.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}