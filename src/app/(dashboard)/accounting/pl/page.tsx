import { getProfitLossData } from "@/server/actions/reports";
import { getSettings } from "@/server/actions/settings";
import Link from "next/link";
import PrintButton from "@/app/(dashboard)/orders/[id]/invoice/print-button";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, FileText } from "lucide-react";

export default async function ProfitLossPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const resolvedParams = await searchParams;
  const currentDate = new Date();
  const selectedMonth = resolvedParams.month ? parseInt(resolvedParams.month) : currentDate.getMonth();
  const selectedYear = resolvedParams.year ? parseInt(resolvedParams.year) : currentDate.getFullYear();

  const data = await getProfitLossData(selectedMonth, selectedYear);
  const settings = await getSettings();

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="max-w-4xl mx-auto space-y-6 print:space-y-4">
      
      {/* Header (Hidden on Print) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/accounting" className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 transition-colors">
            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Profit & Loss</h1>
            <p className="text-sm text-slate-500">Financial statement for {monthNames[selectedMonth]} {selectedYear}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <form className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <select name="month" defaultValue={selectedMonth} className="bg-transparent text-sm font-medium outline-none cursor-pointer px-2">
              {monthNames.map((m, idx) => <option key={idx} value={idx}>{m}</option>)}
            </select>
            <select name="year" defaultValue={selectedYear} className="bg-transparent text-sm font-medium outline-none cursor-pointer px-2">
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700">Apply</button>
          </form>
          <PrintButton />
        </div>
      </div>

      {/* Report Container */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xl p-8 md:p-12 print:shadow-none print:border-0 print:p-0 print:rounded-none">
        
        {/* Company Header */}
        <div className="text-center border-b-2 border-slate-800 pb-6 mb-6 print:pb-4 print:mb-6">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{settings.companyName}</h2>
          <p className="text-sm text-slate-500 mt-1">{settings.address}</p>
          <div className="inline-block mt-4 px-8 py-1.5 border border-slate-300 rounded-full bg-slate-50 print:bg-transparent print:border-slate-400">
            <h3 className="text-lg font-bold text-slate-700 uppercase tracking-widest">
              Profit & Loss Statement
            </h3>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-2">For the period of {monthNames[selectedMonth]} {selectedYear}</p>
        </div>

        {/* Financial Summary Cards - Print এ পাশাপাশি থাকবে */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:grid-cols-3 print:gap-2">
          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl text-center print:border-slate-300 print:p-3 print:rounded-lg">
            <p className="text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">Total Revenue</p>
            <p className="text-2xl font-black text-emerald-600 print:text-xl print:text-black">৳ {data.revenue.toLocaleString()}</p>
          </div>

          <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-center print:border-slate-300 print:p-3 print:rounded-lg">
            <p className="text-red-800 text-xs font-bold uppercase tracking-wider mb-1">Total Expenses</p>
            <p className="text-2xl font-black text-red-600 print:text-xl print:text-black">৳ {data.totalExpense.toLocaleString()}</p>
          </div>

          <div className={`p-6 rounded-2xl text-center border print:border-slate-300 print:p-3 print:rounded-lg ${data.netProfit >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${data.netProfit >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
              {data.netProfit >= 0 ? "Net Profit" : "Net Loss"}
            </p>
            <p className={`text-2xl font-black print:text-xl print:text-black ${data.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              ৳ {Math.abs(data.netProfit).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Breakdown Section - Print এ পাশাপাশি থাকবে */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 print:grid-cols-2 print:gap-4">
          
          {/* Income Breakdown */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 print:bg-transparent print:border-slate-300 print:p-4">
            <div className="flex items-center gap-2 border-b border-slate-300 pb-2 mb-3">
              <TrendingUp size={16} className="text-emerald-600 print:text-black" />
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Income Breakdown</h4>
            </div>
            <div className="space-y-2">
              {Object.entries(data.incomeBreakdown).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center text-sm border-b border-slate-200/60 pb-1.5 last:border-0 last:pb-0">
                  <span className="text-slate-600 font-medium">{category}</span>
                  <span className="font-bold text-slate-800">৳ {amount.toLocaleString()}</span>
                </div>
              ))}
              {Object.keys(data.incomeBreakdown).length === 0 && (
                <p className="text-xs text-slate-500 italic">No income recorded.</p>
              )}
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 print:bg-transparent print:border-slate-300 print:p-4">
            <div className="flex items-center gap-2 border-b border-slate-300 pb-2 mb-3">
              <TrendingDown size={16} className="text-red-600 print:text-black" />
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Expense Breakdown</h4>
            </div>
            <div className="space-y-2">
              {Object.entries(data.expenseBreakdown).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center text-sm border-b border-slate-200/60 pb-1.5 last:border-0 last:pb-0">
                  <span className="text-slate-600 font-medium">{category}</span>
                  <span className="font-bold text-slate-800">৳ {amount.toLocaleString()}</span>
                </div>
              ))}
              {Object.keys(data.expenseBreakdown).length === 0 && (
                <p className="text-xs text-slate-500 italic">No expenses recorded.</p>
              )}
            </div>
          </div>

        </div>

        {/* Report Summary */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 print:bg-transparent print:border-none print:p-0 print:mt-8">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-slate-300 pb-2">
            <FileText size={16} className="print:hidden" /> Report Summary
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 leading-relaxed print:text-[10px]">
            <ul className="space-y-1.5 list-disc pl-4">
              <li>This statement is generated based on real-time database entries.</li>
              <li>Revenue includes all received payments (Sales & Service Orders).</li>
            </ul>
            <ul className="space-y-1.5 list-disc pl-4">
              <li>Expenses include all recorded direct and petty cash expenses.</li>
              <li>This report does not include pending due amounts (Accounts Receivable).</li>
            </ul>
          </div>
        </div>

        {/* Footer for Print */}
        <div className="hidden print:block mt-10 pt-4 border-t border-slate-300 text-center text-xs text-slate-500">
          <p>This is a computer-generated financial statement.</p>
          <p className="mt-1">© {new Date().getFullYear()} {settings.companyName}. All rights reserved.</p>
        </div>

      </div>
    </div>
  );
}