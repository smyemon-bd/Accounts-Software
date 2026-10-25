import { ExpenseTabs } from "@/components/expense-tabs";
import { Target } from "lucide-react";
import Link from "next/link";

export default function ExpensesPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Expenses</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage your daily business expenses and categories.</p>
        </div>
        
        {/* ✅ বাজেট বাটন */}
        <Link 
          href="/expenses/budget" 
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2"
        >
          <Target size={16} /> Manage Budgets
        </Link>
      </div>

      <ExpenseTabs />
    </div>
  );
}