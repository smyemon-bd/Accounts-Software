import { getBudgetsWithExpenses } from "@/server/actions/budget";
import { prisma } from "@/lib/prisma";
import { BudgetForm } from "./budget-form";
import { Target, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default async function BudgetPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const resolvedParams = await searchParams;
  const currentDate = new Date();
  const selectedMonth = resolvedParams.month ? parseInt(resolvedParams.month) : currentDate.getMonth();
  const selectedYear = resolvedParams.year ? parseInt(resolvedParams.year) : currentDate.getFullYear();

  const categories = await prisma.expenseCategory.findMany({ orderBy: { name: "asc" } });
  const budgets = await getBudgetsWithExpenses(selectedMonth, selectedYear);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Target className="text-blue-500" /> Expense Budgets
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Set monthly limits and track your spending.</p>
        </div>
        
        <Link href="/expenses" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
          ← Back to Expenses
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-4">
        <span className="text-sm font-bold text-slate-500">View Budget For:</span>
        <form className="flex items-center gap-2">
          <select name="month" defaultValue={selectedMonth} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-medium outline-none cursor-pointer">
            {monthNames.map((m, idx) => <option key={idx} value={idx}>{m}</option>)}
          </select>
          <select name="year" defaultValue={selectedYear} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-medium outline-none cursor-pointer">
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Apply</button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Set Budget Form */}
        <div className="lg:col-span-1">
          <BudgetForm 
            categories={categories} 
            month={selectedMonth} 
            year={selectedYear} 
          />
        </div>

        {/* Budget List & Progress */}
        <div className="lg:col-span-2 space-y-4">
          {budgets.map(b => (
            <div key={b.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg">{b.name}</h3>
                  <p className="text-xs text-slate-500">Budget: ৳ {b.budget.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">৳ {b.spent.toLocaleString()}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Spent</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 mb-2 overflow-hidden">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    b.isOver ? 'bg-red-500' : b.percentage > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.max(b.percentage, 2)}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center text-xs font-medium">
                <span className={b.isOver ? 'text-red-500' : 'text-slate-500'}>
                  {b.percentage}% Used
                </span>
                {b.isOver ? (
                  <span className="text-red-500 flex items-center gap-1">
                    <AlertTriangle size={12} /> Budget Exceeded!
                  </span>
                ) : b.percentage > 80 ? (
                  <span className="text-amber-500 flex items-center gap-1">
                    <AlertTriangle size={12} /> Warning: Near Limit
                  </span>
                ) : (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={12} /> On Track
                  </span>
                )}
              </div>
            </div>
          ))}

          {budgets.length === 0 && (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 text-center text-slate-500">
              No expense categories found. Please add categories from the Expenses page first.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}